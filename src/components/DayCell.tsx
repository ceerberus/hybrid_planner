import { useState } from 'react'
import type { DayEntry } from '../data/weeks'
import { useStore } from '../store/useStore'
import TypeBadge from './TypeBadge'
import EditModal from './EditModal'

interface Props {
  cellId: string
  entry: DayEntry
  isCurrentWeek: boolean
  isCurrentDay: boolean
  phaseRingClass: string
}

export default function DayCell({ cellId, entry, isCurrentWeek, isCurrentDay, phaseRingClass }: Props) {
  const doneCells = useStore(s => s.doneCells)
  const editedCells = useStore(s => s.editedCells)
  const toggleDone = useStore(s => s.toggleDone)
  const [showModal, setShowModal] = useState(false)

  const isDone = doneCells.has(cellId)
  const edit = editedCells[cellId]

  const displayType = edit?.type ?? entry.type
  const displayTitle = edit?.title ?? entry.title
  const displayDetail = edit?.detail ?? entry.detail

  // Only highlight today's exact cell (current week + current day)
  const isToday = isCurrentWeek && isCurrentDay

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    setShowModal(true)
  }

  return (
    <>
      <td
        onClick={() => toggleDone(cellId)}
        onContextMenu={handleContextMenu}
        className={[
          'px-3 py-2.5 text-left align-top cursor-pointer select-none transition-colors duration-150',
          'min-w-[160px] max-w-[220px]',
          'border-b border-gray-100 dark:border-zinc-800/60',
          isDone
            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/60'
            : 'hover:bg-gray-100/60 dark:hover:bg-zinc-800/40',
          isToday
            ? phaseRingClass
            : isCurrentWeek
            ? 'border-l border-l-indigo-200 dark:border-l-indigo-800/60'
            : '',
        ].filter(Boolean).join(' ')}
        title="Klick = abhaken · Rechtsklick / Gedrückt halten = bearbeiten"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <TypeBadge type={displayType} />
            {isDone && (
              <svg className="w-3 h-3 text-emerald-500 dark:text-emerald-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className={`text-xs font-medium leading-snug ${isDone ? 'line-through text-gray-400 dark:text-zinc-500' : 'text-gray-800 dark:text-zinc-200'}`}>
            {displayTitle}
          </p>
          {displayDetail && (
            <p className={`text-[11px] leading-snug mt-0.5 ${isDone ? 'text-gray-300 dark:text-zinc-600' : 'text-gray-500 dark:text-zinc-500'}`}>
              {displayDetail}
            </p>
          )}
        </div>
      </td>

      {showModal && (
        <EditModal
          cellId={cellId}
          entry={entry}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
