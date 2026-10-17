import { createHash } from 'node:crypto'
import {
  DECKS,
  type DeckType,
  MAX_USER_NAME_LENGTH,
  type RoomState,
  type UserState,
} from '@e2poker/shared'

const MAX_ID_LENGTH = 64

// userIdは本人確認に使うため他の参加者には渡さず、ルームごとのハッシュを公開IDとして配信する
export function toPublicId(roomId: string, userId: string): string {
  return createHash('sha256').update(`${roomId}:${userId}`).digest('hex').slice(0, 16)
}

function validateId(label: string, value: unknown): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_ID_LENGTH) {
    throw new Error(`Invalid ${label}`)
  }
  return value
}

// 長すぎる名前は弾かずに切り詰める（localStorageに古い長い名前が残っていても入室できるように）
function normalizeName(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid name')
  return value.slice(0, MAX_USER_NAME_LENGTH)
}

type Room = {
  id: string
  deckType: DeckType
  revealed: boolean
  users: Map<string, User>
}

type User = {
  id: string
  name: string
  vote: string | null
  isSpectator: boolean
}

// 1ルーム分の永続化用スナップショット（JSON化できるようMapを使わない）
export type RoomSnapshot = {
  id: string
  deckType: DeckType
  revealed: boolean
  users: Array<{ id: string; name: string; vote: string | null; isSpectator: boolean }>
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map()

  createRoom(id: string): void {
    this.rooms.set(id, {
      id,
      deckType: 'fibonacci',
      revealed: false,
      users: new Map(),
    })
  }

  deleteRoom(id: string): void {
    this.rooms.delete(id)
  }

  exportRoom(roomId: string): RoomSnapshot | null {
    const room = this.rooms.get(roomId)
    if (!room) return null

    return {
      id: room.id,
      deckType: room.deckType,
      revealed: room.revealed,
      users: Array.from(room.users.values()).map((user) => ({
        id: user.id,
        name: user.name,
        vote: user.vote,
        isSpectator: user.isSpectator,
      })),
    }
  }

  importRoom(snapshot: RoomSnapshot): void {
    validateId('roomId', snapshot.id)
    if (!Object.hasOwn(DECKS, snapshot.deckType)) throw new Error('Invalid deck type')

    const users = new Map<string, User>()
    for (const user of snapshot.users) {
      users.set(user.id, {
        id: user.id,
        name: user.name,
        vote: user.vote,
        isSpectator: user.isSpectator,
      })
    }
    this.rooms.set(snapshot.id, {
      id: snapshot.id,
      deckType: snapshot.deckType,
      revealed: snapshot.revealed,
      users,
    })
  }

  joinRoom(roomId: string, userId: string, userName: string): void {
    validateId('roomId', roomId)
    validateId('userId', userId)
    const name = normalizeName(userName)
    let room = this.rooms.get(roomId)
    if (!room) {
      this.createRoom(roomId)
      room = this.rooms.get(roomId)
      if (!room) throw new Error('Failed to create room')
    }

    const existingUser = room.users.get(userId)
    if (existingUser) {
      // 既存ユーザーの名前を更新
      existingUser.name = name
    } else {
      // 新規ユーザー追加
      room.users.set(userId, {
        id: userId,
        name,
        vote: null,
        isSpectator: false,
      })
    }
  }

  leaveRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

    room.users.delete(userId)
    const isEmpty = room.users.size === 0

    if (isEmpty) {
      this.deleteRoom(roomId)
    }

    return isEmpty
  }

  vote(roomId: string, userId: string, value: string | null): void {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

    if (room.revealed) {
      throw new Error('Cannot vote when cards are revealed')
    }

    if (value !== null && !DECKS[room.deckType].includes(value)) {
      throw new Error('Invalid vote')
    }

    const user = room.users.get(userId)
    if (!user) throw new Error(`User ${userId} not found in room ${roomId}`)

    user.vote = value
  }

  reveal(roomId: string): void {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

    room.revealed = true
  }

  reset(roomId: string): void {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

    room.revealed = false
    for (const user of room.users.values()) {
      user.vote = null
    }
  }

  changeName(roomId: string, userId: string, name: string): void {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

    const user = room.users.get(userId)
    if (!user) throw new Error(`User ${userId} not found in room ${roomId}`)

    user.name = normalizeName(name)
  }

  changeDeck(roomId: string, deckType: DeckType): void {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)
    if (!Object.hasOwn(DECKS, deckType)) throw new Error('Invalid deck type')

    room.deckType = deckType
    room.revealed = false
    // 全投票をリセット
    for (const user of room.users.values()) {
      user.vote = null
    }
  }

  toggleSpectator(roomId: string, userId: string, isSpectator: boolean): void {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

    const user = room.users.get(userId)
    if (!user) throw new Error(`User ${userId} not found in room ${roomId}`)

    user.isSpectator = isSpectator
    // 観客になったら投票をクリア
    if (isSpectator) {
      user.vote = null
    }
  }

  getRoomState(roomId: string, requesterId: string): RoomState {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

    const users: UserState[] = []
    for (const user of room.users.values()) {
      const isRequester = user.id === requesterId
      const shouldShowVote = room.revealed || isRequester

      users.push({
        id: toPublicId(room.id, user.id),
        isSelf: isRequester,
        name: user.name,
        voted: user.vote !== null,
        vote: shouldShowVote ? user.vote : null,
        isSpectator: user.isSpectator,
      })
    }

    return {
      roomId: room.id,
      deckType: room.deckType,
      revealed: room.revealed,
      users,
    }
  }

  getStats(roomId: string): { min: number; max: number; avg: number } | null {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

    // 観客以外の数値投票のみを収集
    const numericVotes: number[] = []
    for (const user of room.users.values()) {
      if (user.isSpectator || user.vote === null) continue

      const num = Number(user.vote)
      if (!Number.isNaN(num)) {
        numericVotes.push(num)
      }
    }

    if (numericVotes.length === 0) {
      return null
    }

    const min = Math.min(...numericVotes)
    const max = Math.max(...numericVotes)
    const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length

    return { min, max, avg }
  }
}
