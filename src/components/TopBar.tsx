import { useState } from 'react'
import { useStore } from '../store/useStore'
import SyncIndicator from './SyncIndicator'
import ProgressBar from './ProgressBar'
import { weeks, getCellId, DAYS, getCurrentWeekId } from '../data/weeks'

interface Props {
  darkMode: boolean
  toggleDark: () => void
  onChangeName: () => void
}

export default function TopBar({ darkMode, toggleDark, onChangeName }: Props) {
  const username = useStore(s => s.username)
  const doneCells = useStore(s => s.doneCells)
  const editedCells = useStore(s => s.editedCells)
  const resetData = useStore(s => s.resetData)
  const [showReset, setShowReset] = useState(false)

  const currentWeekId = getCurrentWeekId()

  function handleExport() {
    const lines: string[] = [`Hybrid Planner – ${username}`, '']
    for (const week of weeks) {
      lines.push(`── ${week.label} ${week.dateRange} (Phase ${week.phase} – ${week.phaseName}) ──`)
      for (const day of DAYS) {
        const cellId = getCellId(week.id, day)
        const entry = week.days[day]
        const isDone = doneCells.has(cellId)
        const customText = editedCells[cellId]
        const t = typeof customText === 'string'
          ? customText
          : customText
            ? `${customText.title ?? entry.title}${(customText.detail ?? entry.detail) ? ` – ${customText.detail ?? entry.detail}` : ''}`
            : `${entry.title}${entry.detail ? ` – ${entry.detail}` : ''}`
        const text = t
        lines.push(`  [${isDone ? 'x' : ' '}] ${day.toUpperCase()}: ${text}`)
      }
      lines.push('')
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hybrid-planner-${username}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleReset() {
    await resetData()
    setShowReset(false)
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 transition-colors duration-200">
        <div className="flex items-center gap-3 px-4 py-3 h-14">
          {/* Left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">Hybrid Planner</p>
              <p className="text-[10px] text-indigo-500 dark:text-indigo-400 leading-none mt-0.5">{currentWeekId}</p>
            </div>
          </div>

          {/* Center */}
          <div className="flex-1 flex justify-center px-2 min-w-0">
            <ProgressBar />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SyncIndicator />

            <span className="hidden md:block text-xs text-gray-500 dark:text-zinc-400">{username}</span>

            <button
              onClick={onChangeName}
              className="text-[11px] text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors underline underline-offset-2"
            >
              ändern
            </button>

            {/* Dark/Light toggle */}
            <button
              onClick={toggleDark}
              className="p-1.5 text-gray-400 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={() => setShowReset(true)}
              className="p-1.5 text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800"
              title="Daten zurücksetzen"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Reset confirmation dialog */}
      {showReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowReset(false) }}
        >
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Daten zurücksetzen?</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
              Alle Häkchen und Notizen von <strong className="text-gray-800 dark:text-zinc-200">{username}</strong> werden permanent gelöscht.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="px-4 py-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors"
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
