import { type DeckType, MAX_USER_NAME_LENGTH, type UserState } from '@e2poker/shared'
import { RoomManager, toPublicId } from '../room-manager.js'

describe('RoomManager', () => {
  let manager: RoomManager

  beforeEach(() => {
    manager = new RoomManager()
  })

  describe('ルーム作成・削除', () => {
    it('ルームを作成できる', () => {
      manager.createRoom('room1')
      const state = manager.getRoomState('room1', 'user1')
      expect(state.roomId).toBe('room1')
      expect(state.deckType).toBe('fibonacci')
      expect(state.revealed).toBe(false)
      expect(state.users).toEqual([])
    })

    it('ルームを削除できる', () => {
      manager.createRoom('room1')
      manager.deleteRoom('room1')
      expect(() => manager.getRoomState('room1', 'user1')).toThrow()
    })
  })

  describe('ユーザー入室・退室', () => {
    it('ルームに入室できる（ルームがなければ自動作成）', () => {
      manager.joinRoom('room1', 'user1', 'Alice')
      const state = manager.getRoomState('room1', 'user1')
      expect(state.users).toHaveLength(1)
      expect(state.users[0]).toEqual({
        id: toPublicId('room1', 'user1'),
        isSelf: true,
        name: 'Alice',
        voted: false,
        vote: null,
        isSpectator: false,
      })
    })

    it('同じユーザーが再入室すると名前が更新される', () => {
      manager.joinRoom('room1', 'user1', 'Alice')
      manager.joinRoom('room1', 'user1', 'Alice Updated')
      const state = manager.getRoomState('room1', 'user1')
      expect(state.users).toHaveLength(1)
      expect(state.users[0]?.name).toBe('Alice Updated')
    })

    it('ルームから退室できる', () => {
      manager.joinRoom('room1', 'user1', 'Alice')
      manager.joinRoom('room1', 'user2', 'Bob')
      const isEmpty = manager.leaveRoom('room1', 'user1')
      expect(isEmpty).toBe(false)
      const state = manager.getRoomState('room1', 'user2')
      expect(state.users).toHaveLength(1)
      expect(state.users[0]?.id).toBe(toPublicId('room1', 'user2'))
    })

    it('空ルームになったら自動削除される', () => {
      manager.joinRoom('room1', 'user1', 'Alice')
      const isEmpty = manager.leaveRoom('room1', 'user1')
      expect(isEmpty).toBe(true)
      expect(() => manager.getRoomState('room1', 'user1')).toThrow()
    })

    it('他の参加者にはuserIdではなく公開IDが配信される', () => {
      manager.joinRoom('room1', 'user1', 'Alice')
      manager.joinRoom('room1', 'user2', 'Bob')
      const state = manager.getRoomState('room1', 'user2')
      const alice = state.users.find((u: UserState) => u.name === 'Alice')
      expect(alice?.id).not.toBe('user1')
      expect(alice?.isSelf).toBe(false)
      expect(state.users.find((u: UserState) => u.name === 'Bob')?.isSelf).toBe(true)
    })

    it('公開IDで入室しても他人の投票は見えない', () => {
      manager.joinRoom('room1', 'user1', 'Alice')
      manager.vote('room1', 'user1', '5')
      const aliceId = toPublicId('room1', 'user1')
      manager.joinRoom('room1', aliceId, 'Mallory')
      const state = manager.getRoomState('room1', aliceId)
      expect(state.users).toHaveLength(2)
      expect(state.users.find((u: UserState) => u.name === 'Alice')?.vote).toBeNull()
    })
  })

  describe('投票機能', () => {
    beforeEach(() => {
      manager.joinRoom('room1', 'user1', 'Alice')
      manager.joinRoom('room1', 'user2', 'Bob')
    })

    it('投票できる', () => {
      manager.vote('room1', 'user1', '5')
      const state = manager.getRoomState('room1', 'user1')
      const user1 = state.users.find((u: UserState) => u.id === toPublicId('room1', 'user1'))
      expect(user1?.voted).toBe(true)
      expect(user1?.vote).toBe('5')
    })

    it('投票を取り消せる（null）', () => {
      manager.vote('room1', 'user1', '5')
      manager.vote('room1', 'user1', null)
      const state = manager.getRoomState('room1', 'user1')
      const user1 = state.users.find((u: UserState) => u.id === toPublicId('room1', 'user1'))
      expect(user1?.voted).toBe(false)
      expect(user1?.vote).toBeNull()
    })

    it('revealed状態では投票できない', () => {
      manager.reveal('room1')
      expect(() => manager.vote('room1', 'user1', '5')).toThrow()
    })
  })

  describe('Reveal / Reset', () => {
    beforeEach(() => {
      manager.joinRoom('room1', 'user1', 'Alice')
      manager.joinRoom('room1', 'user2', 'Bob')
    })

    it('revealで全投票が見える', () => {
      manager.vote('room1', 'user1', '5')
      manager.vote('room1', 'user2', '8')
      manager.reveal('room1')
      const state = manager.getRoomState('room1', 'user1')
      expect(state.revealed).toBe(true)
      const user2 = state.users.find((u: UserState) => u.id === toPublicId('room1', 'user2'))
      expect(user2?.vote).toBe('8')
    })

    it('resetで投票がクリアされる', () => {
      manager.vote('room1', 'user1', '5')
      manager.vote('room1', 'user2', '8')
      manager.reveal('room1')
      manager.reset('room1')
      const state = manager.getRoomState('room1', 'user1')
      expect(state.revealed).toBe(false)
      expect(state.users.every((u: UserState) => u.vote === null && !u.voted)).toBe(true)
    })
  })

  describe('getRoomState の投票隠蔽ロジック', () => {
    beforeEach(() => {
      manager.joinRoom('room1', 'user1', 'Alice')
      manager.joinRoom('room1', 'user2', 'Bob')
      manager.vote('room1', 'user1', '5')
      manager.vote('room1', 'user2', '8')
    })

    it('revealed=falseの場合、他ユーザーのvoteはnullで隠蔽される', () => {
      const state = manager.getRoomState('room1', 'user1')
      const user1 = state.users.find((u: UserState) => u.id === toPublicId('room1', 'user1'))
      const user2 = state.users.find((u: UserState) => u.id === toPublicId('room1', 'user2'))
      // 自分の投票は見える
      expect(user1?.vote).toBe('5')
      expect(user1?.voted).toBe(true)
      // 他者の投票は隠蔽される
      expect(user2?.vote).toBeNull()
      expect(user2?.voted).toBe(true) // votedフラグは見える
    })

    it('revealed=trueの場合、全員の投票が見える', () => {
      manager.reveal('room1')
      const state = manager.getRoomState('room1', 'user1')
      const user1 = state.users.find((u: UserState) => u.id === toPublicId('room1', 'user1'))
      const user2 = state.users.find((u: UserState) => u.id === toPublicId('room1', 'user2'))
      expect(user1?.vote).toBe('5')
      expect(user2?.vote).toBe('8')
    })
  })

  describe('名前・デッキ・観客モード変更', () => {
    beforeEach(() => {
      manager.joinRoom('room1', 'user1', 'Alice')
    })

    it('ユーザー名を変更できる', () => {
      manager.changeName('room1', 'user1', 'Alice New')
      const state = manager.getRoomState('room1', 'user1')
      expect(state.users[0]?.name).toBe('Alice New')
    })

    it('デッキを変更すると投票もリセットされる', () => {
      manager.vote('room1', 'user1', '5')
      manager.changeDeck('room1', 'tshirt')
      const state = manager.getRoomState('room1', 'user1')
      expect(state.deckType).toBe('tshirt')
      expect(state.users[0]?.vote).toBeNull()
      expect(state.users[0]?.voted).toBe(false)
    })

    it('観客モードに切り替えると投票がクリアされる', () => {
      manager.vote('room1', 'user1', '5')
      manager.toggleSpectator('room1', 'user1', true)
      const state = manager.getRoomState('room1', 'user1')
      expect(state.users[0]?.isSpectator).toBe(true)
      expect(state.users[0]?.vote).toBeNull()
      expect(state.users[0]?.voted).toBe(false)
    })

    it('観客モードを解除できる', () => {
      manager.toggleSpectator('room1', 'user1', true)
      manager.toggleSpectator('room1', 'user1', false)
      const state = manager.getRoomState('room1', 'user1')
      expect(state.users[0]?.isSpectator).toBe(false)
    })
  })

  describe('統計計算', () => {
    beforeEach(() => {
      manager.joinRoom('room1', 'user1', 'Alice')
      manager.joinRoom('room1', 'user2', 'Bob')
      manager.joinRoom('room1', 'user3', 'Charlie')
    })

    it('数値投票のみで統計を計算する', () => {
      manager.vote('room1', 'user1', '3')
      manager.vote('room1', 'user2', '5')
      manager.vote('room1', 'user3', '8')
      const stats = manager.getStats('room1')
      expect(stats).toEqual({
        min: 3,
        max: 8,
        avg: expect.closeTo(5.33, 2),
      })
    })

    it('非数値投票は除外する', () => {
      manager.vote('room1', 'user1', '3')
      manager.vote('room1', 'user2', '?')
      manager.vote('room1', 'user3', '☕')
      const stats = manager.getStats('room1')
      expect(stats).toEqual({
        min: 3,
        max: 3,
        avg: 3,
      })
    })

    it('投票がない場合はnullを返す', () => {
      const stats = manager.getStats('room1')
      expect(stats).toBeNull()
    })

    it('数値投票がない場合はnullを返す', () => {
      manager.vote('room1', 'user1', '?')
      manager.vote('room1', 'user2', '☕')
      const stats = manager.getStats('room1')
      expect(stats).toBeNull()
    })

    it('観客の投票は除外する', () => {
      manager.vote('room1', 'user1', '3')
      manager.vote('room1', 'user2', '5')
      manager.toggleSpectator('room1', 'user3', true)
      manager.vote('room1', 'user3', '8')
      const stats = manager.getStats('room1')
      // user3は観客なので除外
      expect(stats).toEqual({
        min: 3,
        max: 5,
        avg: 4,
      })
    })

    it('観客のみの投票の場合はnullを返す', () => {
      manager.toggleSpectator('room1', 'user1', true)
      manager.vote('room1', 'user1', '5')
      const stats = manager.getStats('room1')
      expect(stats).toBeNull()
    })
  })

  describe('入力検証', () => {
    it('長すぎる名前は切り詰められる', () => {
      manager.joinRoom('room1', 'user1', 'あ'.repeat(100))
      expect(manager.getRoomState('room1', 'user1').users[0]?.name).toHaveLength(
        MAX_USER_NAME_LENGTH,
      )
      manager.changeName('room1', 'user1', 'い'.repeat(100))
      expect(manager.getRoomState('room1', 'user1').users[0]?.name).toHaveLength(
        MAX_USER_NAME_LENGTH,
      )
    })

    it('長すぎるIDでは入室できない', () => {
      expect(() => manager.joinRoom('r'.repeat(65), 'user1', 'Alice')).toThrow()
      expect(() => manager.joinRoom('room1', 'u'.repeat(65), 'Alice')).toThrow()
    })

    it('デッキにない値では投票できない', () => {
      manager.joinRoom('room1', 'user1', 'Alice')
      expect(() => manager.vote('room1', 'user1', 'x'.repeat(1000))).toThrow()
      expect(() => manager.vote('room1', 'user1', 'XL')).toThrow()
    })

    it('存在しないデッキには変更できない', () => {
      manager.joinRoom('room1', 'user1', 'Alice')
      expect(() => manager.changeDeck('room1', 'unknown' as DeckType)).toThrow()
      expect(manager.getRoomState('room1', 'user1').deckType).toBe('fibonacci')
    })
  })
})
