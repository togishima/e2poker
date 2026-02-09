import { useNavigate } from '@funstack/router'
import { useEffect } from 'react'

export function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    const roomId = crypto.randomUUID()
    navigate(`/room/${roomId}`)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="text-center">
        <div className="text-xl font-extrabold mb-2">ルームを作成中...</div>
      </div>
    </div>
  )
}
