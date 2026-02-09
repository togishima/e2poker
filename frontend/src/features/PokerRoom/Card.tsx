import type { UserState } from '@e2poker/shared'

type CardProps = {
  user: UserState
  isMe: boolean
  revealed: boolean
}

export function Card({ user, isMe, revealed }: CardProps) {
  const isVoted = user.voted
  const isSpectator = user.isSpectator
  const showCard = revealed || (isMe && isVoted)
  const value = showCard ? user.vote : ''

  if (isSpectator) {
    return null
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${revealed ? 'revealed' : ''}`}>
      <div className="w-[84px] h-[120px]" style={{ perspective: '1000px' }}>
        <div className="card-inner">
          {/* 裏面 */}
          <div
            className={`face face-back ${
              isVoted
                ? 'bg-indigo-600 border-2 border-solid border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                : 'bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700'
            }`}
          >
            {isVoted && <span className="text-white/20 text-xl italic font-black">E²</span>}
          </div>
          {/* 表面 */}
          <div className="face face-front bg-white text-slate-800 border-2 border-indigo-500 shadow-xl text-3xl font-black">
            {value}
          </div>
        </div>
      </div>
      <div
        className={`text-[10px] font-bold text-center ${
          isMe ? 'text-primary underline underline-offset-4' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {user.name}
        {user.isSpectator && (
          <>
            <br />
            <span className="opacity-50 font-medium">(観客)</span>
          </>
        )}
      </div>
    </div>
  )
}
