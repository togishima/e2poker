import { useNavigate } from '@funstack/router'

export function Home() {
  const navigate = useNavigate()

  const handleCreateRoom = () => {
    const roomId = crypto.randomUUID()
    navigate(`/room/${roomId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6 transition-all duration-500 hover:scale-105">
          <span className="bg-primary text-white px-4 py-1.5 rounded-2xl text-2xl font-black shadow-xl shadow-primary/20">
            E²
          </span>
          <span className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Poker
          </span>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
          すぐに始められる、シンプルなプランニングポーカー
        </div>
        <button
          type="button"
          onClick={handleCreateRoom}
          className="bg-primary hover:bg-indigo-600 text-white px-6 py-3 rounded-full font-extrabold text-sm shadow-xl shadow-primary/30 transition-all active:scale-95"
        >
          ルームを作成
        </button>
      </div>
    </div>
  )
}
