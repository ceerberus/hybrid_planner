import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { generateTrainingBlock, previewWeekCount, type Race } from '../lib/blocks'

interface RaceDraft {
  key: string
  date: string
  label: string
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addWeeksISO(iso: string, weeks: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + weeks * 7)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function NewBlockModal() {
  const addBlock = useStore(s => s.addBlock)
  const setShowNewBlockModal = useStore(s => s.setShowNewBlockModal)

  const defaultStart = todayISO()
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(addWeeksISO(defaultStart, 12))
  const [races, setRaces] = useState<RaceDraft[]>([
    { key: crypto.randomUUID(), date: addWeeksISO(defaultStart, 12), label: '' },
  ])
  const [error, setError] = useState<string | null>(null)

  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  function onClose() {
    setShowNewBlockModal(false)
  }

  function updateRace(key: string, patch: Partial<RaceDraft>) {
    setRaces(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)))
  }

  function addRace() {
    setRaces(prev => [...prev, { key: crypto.randomUUID(), date: endDate, label: '' }])
  }

  function removeRace(key: string) {
    setRaces(prev => prev.filter(r => r.key !== key))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!startDate || !endDate) {
      setError('Start- und Enddatum werden benötigt.')
      return
    }
    if (endDate < startDate) {
      setError('Das Enddatum muss nach dem Startdatum liegen.')
      return
    }

    const validRaces: Race[] = races
      .filter(r => r.date)
      .map(r => ({ date: r.date, label: r.label.trim() || 'Rennen' }))

    const block = generateTrainingBlock({
      name: name.trim() || 'Neuer Trainingsblock',
      startDate,
      endDate,
      races: validRaces,
    })

    addBlock(block)
    onClose()
  }

  const weekCount = (() => {
    if (!startDate || !endDate || endDate < startDate) return null
    const validRaces = races.filter(r => r.date).map(r => ({ date: r.date, label: r.label || 'Rennen' }))
    return previewWeekCount(startDate, endDate, validRaces)
  })()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Neuer Trainingsblock</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mb-5">
          Wir bauen dir die Wochenstruktur (Gym, Läufe, Deload, Taper) automatisch auf — Details kannst du danach pro Einheit anpassen.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Name</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="z.B. Marathon Frühjahr 2027"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Start</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Ende</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {weekCount !== null && (
            <p className="text-[11px] text-indigo-500 dark:text-indigo-400 -mt-2">
              → {weekCount} {weekCount === 1 ? 'Woche' : 'Wochen'} (an volle Wochen Mo–So angepasst)
            </p>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400">Rennen</label>
              <button
                type="button"
                onClick={addRace}
                className="text-[11px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium"
              >
                + Rennen hinzufügen
              </button>
            </div>

            {races.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-zinc-500 italic">Kein Rennen – reiner Aufbaublock.</p>
            )}

            <div className="space-y-2">
              {races.map(race => (
                <div key={race.key} className="flex items-center gap-2">
                  <input
                    type="date"
                    value={race.date}
                    onChange={e => updateRace(race.key, { date: e.target.value })}
                    className="w-[42%] px-2.5 py-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    value={race.label}
                    onChange={e => updateRace(race.key, { label: e.target.value })}
                    placeholder="z.B. Halbmarathon Zürich"
                    className="flex-1 px-2.5 py-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removeRace(race.key)}
                    className="p-1.5 text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                    aria-label="Rennen entfernen"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
          >
            Block erstellen
          </button>
        </div>
      </form>
    </div>
  )
}
