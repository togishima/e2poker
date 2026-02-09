import { useEffect, useRef, useState } from 'react'
import type { Theme } from './PokerRoom.types'

type HeaderProps = {
  roomId: string
  participantCount: number
  userName: string
  isSpectator: boolean
  theme: Theme
  onChangeName: (name: string) => void
  onToggleSpectator: (isSpectator: boolean) => void
  onChangeTheme: (theme: Theme) => void
}

export function Header({
  roomId,
  participantCount,
  userName,
  isSpectator,
  theme,
  onChangeName,
  onToggleSpectator,
  onChangeTheme,
}: HeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(userName)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const themeMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingName])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleNameSubmit = () => {
    if (editedName.trim()) {
      onChangeName(editedName.trim())
    } else {
      setEditedName(userName)
    }
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit()
    } else if (e.key === 'Escape') {
      setEditedName(userName)
      setIsEditingName(false)
    }
  }

  const handleShareUrl = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      alert('URLをクリップボードにコピーしました')
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const themeConfig = {
    dark: { icon: '🌙', label: 'ダーク' },
    light: { icon: '☀️', label: 'ライト' },
    system: { icon: '🖥️', label: 'システム' },
  }

  const displayRoomId = roomId.length > 12 ? `${roomId.slice(0, 12)}...` : roomId

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-50 relative">
      <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight shrink-0">
        <span className="bg-primary text-white px-2 py-0.5 rounded-lg text-base">E²</span>
        <span>Poker</span>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium absolute left-1/2 -translate-x-1/2">
        <div className="font-mono flex items-center gap-2">
          RoomID:{' '}
          <span className="select-all" title={roomId}>
            {displayRoomId}
          </span>
          <button
            type="button"
            onClick={handleShareUrl}
            className="bg-primary hover:bg-indigo-600 text-white px-3 py-1 rounded-md font-bold text-xs shadow-lg shadow-primary/20 transition-all"
          >
            URL共有
          </button>
        </div>
        <div>
          参加者: <b className="text-slate-900 dark:text-white">{participantCount}</b>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-4 border-r border-slate-200 dark:border-slate-800 pr-4 mr-2">
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              className="font-bold text-xs w-24 px-2 py-1 rounded border border-primary bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="font-bold text-xs truncate max-w-[100px] hover:text-primary transition-colors"
            >
              @{userName}
            </button>
          )}

          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <span className="text-xs font-bold text-slate-500 group-hover:text-primary transition-colors">
              観客モード
            </span>
            <div className="relative w-9 h-5">
              <input
                type="checkbox"
                checked={isSpectator}
                onChange={(e) => onToggleSpectator(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-full h-full bg-slate-300 dark:bg-slate-700 rounded-full peer-checked:bg-primary transition-colors duration-300" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-4" />
            </div>
          </label>
        </div>

        <div className="relative inline-block" ref={themeMenuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsThemeMenuOpen(!isThemeMenuOpen)
            }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:border-primary transition-all"
          >
            <span>{themeConfig[theme].icon}</span>
            <span>{themeConfig[theme].label}</span>
          </button>
          <div
            className={`absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1 min-w-[140px] z-[100] transition-all duration-200 ${isThemeMenuOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
          >
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onChangeTheme(t)
                  setIsThemeMenuOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 ${theme === t ? 'text-primary bg-slate-100 dark:bg-slate-700' : ''
                  }`}
              >
                {themeConfig[t].icon} {themeConfig[t].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
