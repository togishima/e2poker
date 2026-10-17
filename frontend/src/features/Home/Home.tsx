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

      <footer className="absolute bottom-4 text-xs text-slate-400 dark:text-slate-600 flex gap-4">
        <a href="/terms" className="hover:underline hover:text-slate-600 dark:hover:text-slate-400">
          利用規約
        </a>
        <a
          href="/privacy"
          className="hover:underline hover:text-slate-600 dark:hover:text-slate-400"
        >
          プライバシーポリシー
        </a>
        <span className="text-slate-200 dark:text-slate-800">|</span>
        <div className="flex items-center gap-1">
          <span>関連サービス:</span>
          <a
            href="https://curaq.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-slate-600 dark:hover:text-slate-400 flex items-center gap-0.5"
          >
            CuraQ
            <svg
              aria-hidden="true"
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  )
}
