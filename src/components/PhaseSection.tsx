import type { Week, DayKey } from '../data/weeks'
import { DAYS, DAY_LABELS, PHASE_NAMES } from '../data/weeks'
import { useStore } from '../store/useStore'
import WeekRow from './WeekRow'

interface Props {
  phase: number
  weeks: Week[]
  currentWeekId: string
  currentDay: DayKey | null
}

export default function PhaseSection({ phase, weeks, currentWeekId, currentDay }: Props) {
  const collapsedPhases = useStore(s => s.collapsedPhases)
  const togglePhase = useStore(s => s.togglePhase)
  const isCollapsed = collapsedPhases.has(phase)

  const phaseColors: Record<number, string> = {
    1: 'text-sky-600 dark:text-sky-400',
    2: 'text-emerald-600 dark:text-emerald-400',
    3: 'text-violet-600 dark:text-violet-400',
    4: 'text-orange-600 dark:text-orange-400',
    5: 'text-rose-600 dark:text-rose-400',
  }

  return (
    <>
      {/* Phase header row */}
      <tr>
        <td
          colSpan={8}
          className="sticky left-0 px-3 py-2 bg-gray-100 dark:bg-zinc-900 border-b border-t border-gray-200 dark:border-zinc-800 cursor-pointer hover:bg-gray-200/70 dark:hover:bg-zinc-800/80 transition-colors"
          onClick={() => togglePhase(phase)}
        >
          <div className="flex items-center gap-2">
            <svg
              className={`w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className={`text-xs font-bold uppercase tracking-wider ${phaseColors[phase]}`}>
              Phase {phase} – {PHASE_NAMES[phase]}
            </span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              {weeks[0].dateRange.split('–')[0]} – {weeks[weeks.length - 1].dateRange.split('–')[1]}
            </span>
          </div>
        </td>
      </tr>

      {/* Column headers */}
      {!isCollapsed && (
        <tr className="bg-gray-100 dark:bg-zinc-900">
          <th className="sticky left-0 z-10 px-3 py-1.5 text-left text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 min-w-[120px]">
            Woche
          </th>
          {DAYS.map(day => (
            <th
              key={day}
              className={[
                'px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-zinc-800 min-w-[160px]',
                day === currentDay
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'text-gray-400 dark:text-zinc-500',
              ].join(' ')}
            >
              {DAY_LABELS[day]}
            </th>
          ))}
        </tr>
      )}

      {/* Week rows */}
      {!isCollapsed && weeks.map(week => (
        <WeekRow
          key={week.id}
          week={week}
          currentWeekId={currentWeekId}
          currentDay={currentDay}
        />
      ))}
    </>
  )
}
