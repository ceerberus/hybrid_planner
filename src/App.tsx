import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import WelcomeScreen from './components/WelcomeScreen'
import TopBar from './components/TopBar'
import PhaseSection from './components/PhaseSection'
import { weeks, PHASE_NAMES, getCurrentWeekId, getCurrentDay } from './data/weeks'

export default function App() {
  const username = useStore(s => s.username)
  const loadFromRemote = useStore(s => s.loadFromRemote)
  const isOffline = useStore(s => s.isOffline)
  const clearUsername = useStore(s => s.clearUsername)

  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('tp_dark')
    return stored === null ? true : stored === 'true'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('tp_dark', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    if (username) {
      loadFromRemote(username)
    }
  }, [username, loadFromRemote])

  function handleChangeName() {
    clearUsername()
  }

  if (!username) {
    return <WelcomeScreen />
  }

  const currentWeekId = getCurrentWeekId()
  const currentDay = getCurrentDay()

  const phases = Object.keys(PHASE_NAMES)
    .map(Number)
    .map(phase => ({
      phase,
      weeks: weeks.filter(w => w.phase === phase),
    }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <TopBar
        darkMode={darkMode}
        toggleDark={() => setDarkMode(d => !d)}
        onChangeName={handleChangeName}
      />

      {isOffline && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2">
          <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
            Offline – Änderungen werden lokal gespeichert
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {phases.map(({ phase, weeks: phaseWeeks }) => (
              <PhaseSection
                key={phase}
                phase={phase}
                weeks={phaseWeeks}
                currentWeekId={currentWeekId}
                currentDay={currentDay}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="h-8" />
    </div>
  )
}
