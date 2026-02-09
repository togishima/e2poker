import { useEffect, useState } from 'react'

type ToastProps = {
    message: string
    isVisible: boolean
    onClose: () => void
    duration?: number
}

export function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
    const [isRendered, setIsRendered] = useState(isVisible)

    useEffect(() => {
        if (isVisible) {
            setIsRendered(true)
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }

        const timer = setTimeout(() => {
            setIsRendered(false)
        }, 300) // Match fade-out duration
        return () => clearTimeout(timer)
    }, [isVisible, onClose, duration])

    if (!isRendered) return null

    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
        >
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{message}</span>
            </div>
        </div>
    )
}
