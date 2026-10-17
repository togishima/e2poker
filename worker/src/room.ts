import { DurableObject } from 'cloudflare:workers'
import type { ClientMessage, ServerMessage } from '@e2poker/shared'
import { RoomManager, type RoomSnapshot } from '../../backend/src/room-manager.js'
import type { Env } from './index'

// backend/src/index.ts と同じ値
const MAX_ROOM_CONNECTIONS = 30
const IDLE_TIMEOUT_MS = 30 * 60 * 1000
const MAX_PAYLOAD_BYTES = 4 * 1024

// alarm の間隔（アイドル判定の粒度）。接続が残っている間だけ再スケジュールする
const ALARM_INTERVAL_MS = 60 * 1000

const STORAGE_KEY = 'room'

// 接続ごとの情報。Hibernation 後も残るよう serializeAttachment で保持する
type Attachment = {
  userId: string | null
  lastActivity: number
}

// 1 ルーム = 1 Durable Object。ルーム状態はメモリに持ちつつ、変更ごとに storage へ保存する
export class RoomObject extends DurableObject<Env> {
  private readonly roomId: string
  private readonly rooms = new RoomManager()

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.roomId = ctx.id.name ?? ''
    // Hibernation から復帰したとき、メッセージを処理する前に状態を復元する
    ctx.blockConcurrencyWhile(async () => {
      const snapshot = await ctx.storage.get<RoomSnapshot>(STORAGE_KEY)
      if (snapshot) {
        this.rooms.importRoom(snapshot)
      }
    })
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 })
    }
    if (!this.roomId) {
      return new Response('Invalid room', { status: 400 })
    }

    const { 0: client, 1: server } = new WebSocketPair()
    const isFull = this.ctx.getWebSockets().length >= MAX_ROOM_CONNECTIONS

    this.ctx.acceptWebSocket(server)
    server.serializeAttachment({ userId: null, lastActivity: Date.now() } satisfies Attachment)

    if (isFull) {
      // Node 版と同じくエラーメッセージを送ってから閉じる（クライアントが理由を表示できるように）
      this.sendError(server, 'Room is at capacity')
      server.close(1013, 'Room is at capacity')
    } else {
      await this.ensureAlarm()
    }

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    const size = typeof raw === 'string' ? new TextEncoder().encode(raw).byteLength : raw.byteLength
    if (size > MAX_PAYLOAD_BYTES) {
      // Node 版の ws の maxPayload 超過と同じ扱い（切断 = 退室）
      ws.close(1009, 'Message too big')
      await this.leave(ws)
      return
    }

    const attachment = this.readAttachment(ws)
    attachment.lastActivity = Date.now()
    ws.serializeAttachment(attachment)

    try {
      const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw)
      const message = JSON.parse(text) as ClientMessage

      // JOIN で接続に userId を登録する（Node 版と同じく、入室に失敗しても登録は残す）
      if (message.type === 'JOIN') {
        if (message.roomId !== this.roomId) {
          throw new Error('Room mismatch')
        }
        attachment.userId = message.userId
        ws.serializeAttachment(attachment)
        this.rooms.joinRoom(message.roomId, message.userId, message.userName)
        await this.saveAndBroadcast()
        return
      }

      if (attachment.userId === null) {
        this.sendError(ws, 'Not joined to any room')
        return
      }
      const userId = attachment.userId

      switch (message.type) {
        case 'VOTE':
          this.rooms.vote(this.roomId, userId, message.value)
          break
        case 'REVEAL':
          this.rooms.reveal(this.roomId)
          break
        case 'RESET':
          this.rooms.reset(this.roomId)
          break
        case 'CHANGE_NAME':
          this.rooms.changeName(this.roomId, userId, message.name)
          break
        case 'CHANGE_DECK':
          this.rooms.changeDeck(this.roomId, message.deckType)
          break
        case 'TOGGLE_SPECTATOR':
          this.rooms.toggleSpectator(this.roomId, userId, message.isSpectator)
          break
        default:
          return
      }
      await this.saveAndBroadcast()
    } catch (error) {
      this.sendError(ws, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    await this.leave(ws)
    try {
      ws.close(code, reason)
    } catch {
      // 既に閉じている場合は無視
    }
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    await this.leave(ws)
    try {
      ws.close(1011, 'WebSocket error')
    } catch {
      // 既に閉じている場合は無視
    }
  }

  async alarm(): Promise<void> {
    const now = Date.now()
    for (const ws of this.ctx.getWebSockets()) {
      const attachment = this.readAttachment(ws)
      if (now - attachment.lastActivity <= IDLE_TIMEOUT_MS) continue

      try {
        this.sendError(ws, 'Idle timeout')
        ws.close(1001, 'Idle timeout')
      } catch {
        // 既に閉じている場合は無視
      }
      await this.leave(ws)
    }

    if (this.ctx.getWebSockets().length > 0) {
      await this.ctx.storage.setAlarm(Date.now() + ALARM_INTERVAL_MS)
    }
  }

  // 接続を退室させる。二重に呼ばれても userId を消して 2 回目以降は何もしない
  private async leave(ws: WebSocket): Promise<void> {
    const attachment = this.readAttachment(ws)
    if (attachment.userId === null) return
    const userId = attachment.userId

    try {
      attachment.userId = null
      ws.serializeAttachment(attachment)

      const isEmpty = this.rooms.leaveRoom(this.roomId, userId)
      if (isEmpty) {
        // 空になったルームは保存データも消す
        await this.ctx.storage.deleteAll()
        await this.ctx.storage.deleteAlarm()
        return
      }
      await this.saveAndBroadcast()
    } catch {
      // ルームが削除済みの場合は無視（Node 版と同じ）
    }
  }

  private async saveAndBroadcast(): Promise<void> {
    await this.persist()
    this.broadcast()
  }

  private async persist(): Promise<void> {
    const snapshot = this.rooms.exportRoom(this.roomId)
    if (snapshot) {
      await this.ctx.storage.put(STORAGE_KEY, snapshot)
    } else {
      await this.ctx.storage.delete(STORAGE_KEY)
    }
  }

  // 接続ごとに、その接続の userId 視点の状態を送る（投票の隠蔽はRoomManager側）
  private broadcast(): void {
    for (const ws of this.ctx.getWebSockets()) {
      const attachment = this.readAttachment(ws)
      if (attachment.userId === null) continue
      try {
        const state = this.rooms.getRoomState(this.roomId, attachment.userId)
        const message: ServerMessage = { type: 'SYNC_STATE', state }
        ws.send(JSON.stringify(message))
      } catch {
        // エラーは無視（ルームが削除済みなど）
      }
    }
  }

  private sendError(ws: WebSocket, message: string): void {
    const errorMessage: ServerMessage = { type: 'ERROR', message }
    try {
      ws.send(JSON.stringify(errorMessage))
    } catch {
      // 既に閉じている場合は無視
    }
  }

  private readAttachment(ws: WebSocket): Attachment {
    const attachment = ws.deserializeAttachment() as Attachment | null
    return attachment ?? { userId: null, lastActivity: Date.now() }
  }

  private async ensureAlarm(): Promise<void> {
    if ((await this.ctx.storage.getAlarm()) === null) {
      await this.ctx.storage.setAlarm(Date.now() + ALARM_INTERVAL_MS)
    }
  }
}
