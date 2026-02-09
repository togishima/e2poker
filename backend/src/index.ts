import { createServer } from 'node:http'
import type { ClientMessage, ServerMessage } from '@e2poker/shared'
import { type WebSocket, WebSocketServer } from 'ws'
import { RoomManager } from './room-manager.js'

const PORT = Number(process.env.PORT) || 3001

const roomManager = new RoomManager()

// クライアント接続情報（WebSocket → { roomId, userId }）
const clientConnections = new Map<WebSocket, { roomId: string; userId: string }>()

// HTTP サーバー
const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200)
    res.end('ok')
  } else {
    res.writeHead(404)
    res.end()
  }
})

// WebSocket サーバー
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString()) as ClientMessage

      // JOIN メッセージでクライアント情報を登録
      if (message.type === 'JOIN') {
        const { roomId, userId, userName } = message
        clientConnections.set(ws, { roomId, userId })
        roomManager.joinRoom(roomId, userId, userName)
        broadcastRoomState(roomId)
        return
      }

      // その他のメッセージはクライアント情報が必要
      const clientInfo = clientConnections.get(ws)
      if (!clientInfo) {
        sendError(ws, 'Not joined to any room')
        return
      }

      const { roomId, userId } = clientInfo

      switch (message.type) {
        case 'VOTE':
          roomManager.vote(roomId, userId, message.value)
          broadcastRoomState(roomId)
          break
        case 'REVEAL':
          roomManager.reveal(roomId)
          broadcastRoomState(roomId)
          break
        case 'RESET':
          roomManager.reset(roomId)
          broadcastRoomState(roomId)
          break
        case 'CHANGE_NAME':
          roomManager.changeName(roomId, userId, message.name)
          broadcastRoomState(roomId)
          break
        case 'CHANGE_DECK':
          roomManager.changeDeck(roomId, message.deckType)
          broadcastRoomState(roomId)
          break
        case 'TOGGLE_SPECTATOR':
          roomManager.toggleSpectator(roomId, userId, message.isSpectator)
          broadcastRoomState(roomId)
          break
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      sendError(ws, errorMessage)
    }
  })

  ws.on('close', () => {
    const clientInfo = clientConnections.get(ws)
    if (clientInfo) {
      const { roomId, userId } = clientInfo
      clientConnections.delete(ws)
      try {
        roomManager.leaveRoom(roomId, userId)
        broadcastRoomState(roomId)
      } catch {
        // ルームが削除済みの場合は無視
      }
    }
  })
})

function broadcastRoomState(roomId: string): void {
  for (const [client, info] of clientConnections.entries()) {
    if (info.roomId === roomId) {
      try {
        const state = roomManager.getRoomState(roomId, info.userId)
        const message: ServerMessage = { type: 'SYNC_STATE', state }
        client.send(JSON.stringify(message))
      } catch {
        // エラーは無視（ルームが削除済みなど）
      }
    }
  }
}

function sendError(ws: WebSocket, message: string): void {
  const errorMessage: ServerMessage = { type: 'ERROR', message }
  ws.send(JSON.stringify(errorMessage))
}

server.listen(PORT, () => {
  console.log(`E² Poker backend listening on http://localhost:${PORT}`)
})
