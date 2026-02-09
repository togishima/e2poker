import type { DeckType, RoomState, UserState } from '@e2poker/shared'

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

  joinRoom(roomId: string, userId: string, userName: string): void {
    let room = this.rooms.get(roomId)
    if (!room) {
      this.createRoom(roomId)
      room = this.rooms.get(roomId)
      if (!room) throw new Error('Failed to create room')
    }

    const existingUser = room.users.get(userId)
    if (existingUser) {
      // 既存ユーザーの名前を更新
      existingUser.name = userName
    } else {
      // 新規ユーザー追加
      room.users.set(userId, {
        id: userId,
        name: userName,
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

    user.name = name
  }

  changeDeck(roomId: string, deckType: DeckType): void {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

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
        id: user.id,
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
