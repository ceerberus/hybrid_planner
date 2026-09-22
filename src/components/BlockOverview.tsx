import { useState } from 'react'
import { useStore } from '../store/useStore'
import { computeBlockProgress, formatBlockDateRange, type TrainingBlock } from '../lib/blocks'
import { getCurrentWeekId } from '../data/weeks'

const PHASE_GRADIENT: Record<number, string> = {
  1: 'from-sky-400 to-sky-500',
  2: 'from-emerald-400 to-emerald-500',
  3: 'from-violet-400 to-violet-500',
  4: 'from-orange-400 to-orange-500',
  5: 'from-rose-400 to-rose-500',
}

function BlockCard({ block, isActive }: { block: TrainingBlock; isActive: boolean }) {
  const doneCells = useStore(s => s.doneCells)
  const blocks = useStore(s => s.blocks)
  const setActiveBlockId = useStore(s => s.setActiveBlockId)
  const deleteBlock = useStore(s => s.deleteBlock)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { done, total, pct } = computeBlockProgress(block, doneCells)
  const currentWeekId = getCurrentWeekId(block.weeks)
  const currentWeek = block.weeks.find(w => w.id === currentWeekId)
  const isFinished = pct === 100
  const now = new Date()
  const isUpcoming = new Date(block.startDate + 'T00:00:00') > now
  const isPast = new Date(block.endDate + 'T00:00:00') < now && !isFinished

  return (
    <div
      className={[
        'group relative flex flex-col rounded-2xl border p-5 cursor-pointer transition-all duration-200',
        'bg-white dark:bg-zinc-900 hover:shadow-lg hover:-translate-y-0.5',
        isActive
          ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-500/20'
          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700',
      ].join(' ')}
      onClick={() => setActiveBlockId(block.id)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{block.name}</h3>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{formatBlockDateRange(block)}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isActive && (
            <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold rounded border border-indigo-200 dark:border-indigo-500/30 leading-none whitespace-nowrap">
              Aktiv
            </span>
          )}
          {isFinished && (
            <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold rounded border border-emerald-200 dark:border-emerald-500/30 leading-none whitespace-nowrap">
              Fertig
            </span>
          )}
          {!isFinished && isUpcoming && (
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-[10px] font-semibold rounded border border-gray-200 dark:border-zinc-700 leading-none whitespace-nowrap">
              Geplant
            </span>
          )}
          {!isFinished && isPast && (
            <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold rounded border border-amber-200 dark:border-amber-500/20 leading-none whitespace-nowrap">
              Abgelaufen
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-500 mb-1">
          <span>{done} / {total} Einheiten</span>
          <span className="font-semibold text-gray-600 dark:text-zinc-300">{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Phase strip */}
      <div className="flex gap-0.5 mb-4">
        {block.weeks.map(w => (
          <div
            key={w.id}
            title={`${w.label} · Phase ${w.phase} – ${w.phaseName}`}
            className={[
              'h-1.5 flex-1 rounded-full bg-gradient-to-r',
              PHASE_GRADIENT[w.phase] ?? PHASE_GRADIENT[1],
              w.id === currentWeekId ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900 ring-gray-400 dark:ring-zinc-300' : 'opacity-60',
            ].join(' ')}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-1">
        <span className="text-[11px] text-gray-400 dark:text-zinc-500">{block.weeks.length} Wochen</span>
        {block.races.map(r => (
          <span
            key={r.date}
            className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] rounded border border-rose-200 dark:border-rose-500/20 leading-none"
          >
            🏁 {r.label}
          </span>
        ))}
        {currentWeek && (
          <span className="text-[11px] text-gray-400 dark:text-zinc-500 ml-auto">
            aktuell: {currentWeek.label}
          </span>
        )}
      </div>

      {blocks.length > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-xs" onClick={e => e.stopPropagation()}>
              <span className="text-gray-400 dark:text-zinc-500">Wirklich löschen?</span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300"
              >
                Nein
              </button>
              <button
                onClick={() => deleteBlock(block.id)}
                className="text-red-500 hover:text-red-400 font-medium"
              >
                Löschen
              </button>
            </div>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
              className="text-[11px] text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              Block löschen
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function BlockOverview() {
  const blocks = useStore(s => s.blocks)
  const activeBlockId = useStore(s => s.activeBlockId)
  const setShowNewBlockModal = useStore(s => s.setShowNewBlockModal)

  const sorted = [...blocks].sort((a, b) => b.startDate.localeCompare(a.startDate))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Trainingsblöcke</h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-0.5">
            Wähle einen Block aus oder starte einen neuen.
          </p>
        </div>
        <button
          onClick={() => setShowNewBlockModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm shadow-indigo-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Neuer Block
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(block => (
          <BlockCard key={block.id} block={block} isActive={block.id === activeBlockId} />
        ))}
      </div>
    </div>
  )
}
