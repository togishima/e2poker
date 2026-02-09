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
        <div className="flex items-center justify-center gap-2 text-xl font-extrabold tracking-tight mb-6">
          <span className="bg-primary text-white px-2 py-0.5 rounded-lg text-base">E²</span>
          <span>Poker</span>
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
