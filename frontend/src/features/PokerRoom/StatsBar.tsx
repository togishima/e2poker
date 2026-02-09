import type { UserState } from '@e2poker/shared'

type StatsBarProps = {
  users: UserState[]
  revealed: boolean
}

function calculateStats(users: UserState[]): {
  min: number
  avg: number
  max: number
} | null {
  const numericalVotes = users
    .filter((user) => !user.isSpectator && user.vote && !Number.isNaN(Number(user.vote)))
    .map((user) => Number(user.vote))

  if (numericalVotes.length === 0) {
    return null
  }

  const min = Math.min(...numericalVotes)
  const max = Math.max(...numericalVotes)
  const sum = numericalVotes.reduce((a, b) => a + b, 0)
  const avg = sum / numericalVotes.length

  return { min, avg, max }
}

export function StatsBar({ users, revealed }: StatsBarProps) {
  const stats = revealed ? calculateStats(users) : null

  return (
    <div className="h-16 mb-4 flex items-center justify-center">
      <div
        className={`flex gap-4 transition-opacity duration-300 ${
          revealed && stats ? 'opacity-100' : 'invisible opacity-0'
        }`}
      >
        {stats ? (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-xl shadow-sm flex items-center gap-3 text-xs font-bold">
              最小 <b className="text-primary text-base">{stats.min}</b>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-xl shadow-sm flex items-center gap-3 text-xs font-bold">
              平均 <b className="text-primary text-base">{stats.avg.toFixed(1)}</b>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-xl shadow-sm flex items-center gap-3 text-xs font-bold">
              最大 <b className="text-primary text-base">{stats.max}</b>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-xl shadow-sm flex items-center gap-3 text-xs font-bold">
              最小 <b className="text-primary text-base">-</b>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-xl shadow-sm flex items-center gap-3 text-xs font-bold">
              平均 <b className="text-primary text-base">-</b>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-xl shadow-sm flex items-center gap-3 text-xs font-bold">
              最大 <b className="text-primary text-base">-</b>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
