export type DeckType = 'fibonacci' | 'tshirt' | 'fivefinger' | 'roman'

export const DECKS: Record<DeckType, readonly string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '?', '☕'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', '?', '☕'],
  fivefinger: ['1', '2', '3', '4', '5', '?', '☕'],
  roman: ['👍', '👎', '✋'],
} as const

// Client → Server
export type ClientMessage =
  | { type: 'JOIN'; roomId: string; userName: string; userId: string }
  | { type: 'VOTE'; value: string | null }
  | { type: 'REVEAL' }
  | { type: 'RESET' }
  | { type: 'CHANGE_NAME'; name: string }
  | { type: 'CHANGE_DECK'; deckType: DeckType }
  | { type: 'TOGGLE_SPECTATOR'; isSpectator: boolean }

// Server → Client
export type ServerMessage =
  | { type: 'SYNC_STATE'; state: RoomState }
  | { type: 'ERROR'; message: string }

export type RoomState = {
  roomId: string
  deckType: DeckType
  revealed: boolean
  users: UserState[]
}

export type UserState = {
  id: string
  name: string
  voted: boolean
  vote: string | null
  isSpectator: boolean
}
