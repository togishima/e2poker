import type { ClientMessage, DeckType, RoomState, ServerMessage } from '@e2poker/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Theme } from './PokerRoom.types'

const COLORS = ['赤い', '青い', '緑の', '黄色い', '白い', '黒い', '紫の', '桃色の']
const ANIMALS = [
  'キツネ',
  'ペンギン',
  'キリン',
  'ライオン',
  'ゾウ',
  'リス',
  'カメ',
  'ウサギ',
  'パンダ',
  'コアラ',
]

function generateRandomName(): string {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  return `${color}${animal}`
}

// 接続先: VITE_WS_URL があればそれ（Render 用）、開発時は localhost、本番は同一オリジンの /ws
function getWsUrl(roomId: string): string {
  const configured = import.meta.env.VITE_WS_URL
  let base: string
  if (configured) {
    base = configured
  } else if (import.meta.env.DEV) {
    base = 'ws://localhost:3001'
  } else {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    base = `${protocol}://${location.host}/ws`
  }

  const url = new URL(base)
  url.search = `room=${encodeURIComponent(roomId)}`
  return url.toString()
}

function getUserId(): string {
  const stored = localStorage.getItem('e2poker_userId')
  if (stored) return stored

  const newId = crypto.randomUUID()
  localStorage.setItem('e2poker_userId', newId)
  return newId
}

function getUserName(): string {
  const stored = localStorage.getItem('e2poker_userName')
  if (stored) return stored

  const newName = generateRandomName()
  localStorage.setItem('e2poker_userName', newName)
  return newName
}

export function usePokerRoom(roomId: string) {
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [connected, setConnected] = useState(false)
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shouldReconnectRef = useRef(true)
  const [userId] = useState(() => getUserId())
  const [userName, setUserNameState] = useState(() => getUserName())

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  const connect = useCallback(() => {
    if (!shouldReconnectRef.current) return
    const ws = new WebSocket(getWsUrl(roomId))
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      send({
        type: 'JOIN',
        roomId,
        userId,
        userName,
      })
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as ServerMessage
      if (message.type === 'SYNC_STATE') {
        setRoomState(message.state)
      } else if (message.type === 'ERROR') {
        console.error('WebSocket error:', message.message)
        if (
          message.message === 'Idle timeout' ||
          message.message === 'Server is at capacity' ||
          message.message === 'Room is at capacity'
        ) {
          setDisconnectReason(message.message)
          shouldReconnectRef.current = false
        }
      }
    }

    ws.onclose = () => {
      setConnected(false)
      if (shouldReconnectRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 3000)
      }
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [roomId, userId, userName, send])

  useEffect(() => {
    shouldReconnectRef.current = true
    setDisconnectReason(null)
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const vote = useCallback(
    (value: string | null) => {
      send({ type: 'VOTE', value })
    },
    [send],
  )

  const reveal = useCallback(() => {
    send({ type: 'REVEAL' })
  }, [send])

  const reset = useCallback(() => {
    send({ type: 'RESET' })
  }, [send])

  const changeName = useCallback(
    (name: string) => {
      setUserNameState(name)
      localStorage.setItem('e2poker_userName', name)
      send({ type: 'CHANGE_NAME', name })
    },
    [send],
  )

  const changeDeck = useCallback(
    (deckType: DeckType) => {
      send({ type: 'CHANGE_DECK', deckType })
    },
    [send],
  )

  const toggleSpectator = useCallback(
    (isSpectator: boolean) => {
      send({ type: 'TOGGLE_SPECTATOR', isSpectator })
    },
    [send],
  )

  return {
    roomState,
    connected,
    disconnectReason,
    userName,
    vote,
    reveal,
    reset,
    changeName,
    changeDeck,
    toggleSpectator,
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('e2poker_theme')
    return (stored as Theme) || 'system'
  })

  useEffect(() => {
    const html = document.documentElement

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.classList.toggle('dark', isDark)
    } else {
      html.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('e2poker_theme', newTheme)
  }, [])

  return { theme, setTheme }
}
