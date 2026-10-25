export type DeckType = 'fibonacci' | 'tshirt' | 'fivefinger' | 'roman'

export const DECKS: Record<DeckType, readonly string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '?', '☕'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', '?', '☕'],
  fivefinger: ['1', '2', '3', '4', '5', '?', '☕'],
  roman: ['👍', '👎', '✋'],
} as const

export const MAX_USER_NAME_LENGTH = 20

// Client → Server
export type ClientMessage =
  | { type: 'JOIN'; roomId: string; userName: string }
  | { type: 'VOTE'; value: string | null }
  | { type: 'REVEAL' }
  | { type: 'RESET' }
  | { type: 'CHANGE_NAME'; name: string }
  | { type: 'CHANGE_DECK'; deckType: DeckType }
  | { type: 'TOGGLE_SPECTATOR'; isSpectator: boolean }

// Server → Client
export type ServerMessage =
  | { type: 'SYNC_STATE'; state: RoomState; userId: string }
  | { type: 'ERROR'; message: string }

export type RoomState = {
  roomId: string
  deckType: DeckType
  revealed: boolean
  users: UserState[]
}

export type UserState = {
  // 他の参加者に配信される公開ID（localStorageのuserIdとは別物）
  id: string
  isSelf: boolean
  name: string
  voted: boolean
  vote: string | null
  isSpectator: boolean
}
