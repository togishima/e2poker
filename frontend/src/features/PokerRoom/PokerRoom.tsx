import { Card } from './Card'
import { DeckSelector } from './DeckSelector'
import { Header } from './Header'
import { usePokerRoom, useTheme } from './PokerRoom.hooks'
import { StatsBar } from './StatsBar'

type PokerRoomProps = {
  params: {
    roomId: string
  }
}

export function PokerRoom({ params }: PokerRoomProps) {
  const { roomId } = params
  const {
    roomState,
    connected,
    userId,
    userName,
    vote,
    reveal,
    reset,
    changeName,
    changeDeck,
    toggleSpectator,
  } = usePokerRoom(roomId)
  const { theme, setTheme } = useTheme()

  if (!connected || !roomState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <div className="text-center">
          <div className="text-xl font-extrabold mb-2">接続中...</div>
          <div className="text-sm text-slate-500">ルーム {roomId} に接続しています</div>
        </div>
      </div>
    )
  }

  const myUser = roomState.users.find((u) => u.id === userId)
  const myVote = myUser?.vote || null
  const isSpectator = myUser?.isSpectator || false
  const canReveal = !roomState.revealed && roomState.users.some((u) => !u.isSpectator && u.voted)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header
        roomId={roomId}
        participantCount={roomState.users.length}
        userName={userName}
        isSpectator={isSpectator}
        theme={theme}
        onChangeName={changeName}
        onToggleSpectator={toggleSpectator}
        onChangeTheme={setTheme}
      />

      <main className="flex-1 flex flex-col items-center py-8 px-4 overflow-y-auto overflow-x-hidden">
        <StatsBar users={roomState.users} revealed={roomState.revealed} />

        <div className="table-surface bg-slate-200/40 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-[64px] p-8 md:p-12 w-full max-w-5xl flex flex-col items-center gap-10 shadow-2xl backdrop-blur-md relative overflow-hidden transition-colors">
          {/* グリッド背景 */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* カードグリッド */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-x-2 gap-y-10 w-full max-w-4xl justify-items-center relative z-10">
            {roomState.users.map((user) => (
              <Card
                key={user.id}
                user={user}
                isMe={user.id === userId}
                revealed={roomState.revealed}
              />
            ))}
          </div>

          {/* ボタンエリア */}
          <div className="relative z-10 flex flex-col items-center justify-center h-20 w-full mb-4">
            {!roomState.revealed ? (
              <button
                type="button"
                onClick={reveal}
                disabled={!canReveal}
                className={`h-14 px-12 rounded-full font-extrabold text-lg border-2 border-transparent box-border transition-all ${
                  canReveal
                    ? 'bg-primary hover:bg-indigo-600 text-white shadow-xl shadow-primary/30 hover:-translate-y-1 active:scale-95'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                カードを開く
              </button>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-12 rounded-full font-bold text-sm shadow-md hover:bg-slate-50 transition-all active:scale-95 box-border"
              >
                次のラウンド
              </button>
            )}
          </div>
        </div>
      </main>

      <DeckSelector
        currentDeck={roomState.deckType}
        selectedVote={myVote}
        revealed={roomState.revealed}
        isSpectator={isSpectator}
        onVote={vote}
        onChangeDeck={changeDeck}
      />
    </div>
  )
}
