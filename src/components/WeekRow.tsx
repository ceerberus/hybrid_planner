import type { Week, DayKey } from '../data/weeks'
import { DAYS, getCellId } from '../data/weeks'
import DayCell from './DayCell'

interface Props {
  week: Week
  currentWeekId: string
  currentDay: DayKey | null
}

export default function WeekRow({ week, currentWeekId, currentDay }: Props) {
  const isCurrentWeek = week.id === currentWeekId

  return (
    <tr>
      {/* Sticky week info column */}
      <td className={[
        'sticky left-0 z-10 px-3 py-2.5 border-b border-gray-100 dark:border-zinc-800/60',
        'bg-gray-50 dark:bg-zinc-950 min-w-[120px]',
        isCurrentWeek ? '!bg-indigo-50/60 dark:!bg-indigo-950/20' : '',
      ].join(' ')}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${isCurrentWeek ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-zinc-300'}`}>
              {week.label}
            </span>
            {isCurrentWeek && (
              <span className="px-1 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold rounded border border-indigo-200 dark:border-indigo-500/30 leading-none">
                Jetzt
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500 leading-none">{week.dateRange}</span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {week.isDeload && (
              <span className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-[10px] rounded border border-yellow-200 dark:border-yellow-500/20 leading-none">
                Deload
              </span>
            )}
            {week.isRace && (
              <span className="px-1 py-0.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] rounded border border-rose-200 dark:border-rose-500/30 leading-none">
                Race
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Day cells */}
      {DAYS.map(day => (
        <DayCell
          key={day}
          cellId={getCellId(week.id, day)}
          entry={week.days[day]}
          isCurrentWeek={isCurrentWeek}
          isCurrentDay={day === currentDay}
        />
      ))}
    </tr>
  )
}
