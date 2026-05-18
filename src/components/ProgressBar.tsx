import { useStore } from '../store/useStore'
import { TOTAL_CELLS } from '../data/weeks'

export default function ProgressBar() {
  const doneCells = useStore(s => s.doneCells)
  const done = doneCells.size
  const pct = Math.round((done / TOTAL_CELLS) * 100)

  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-xs text-gray-500 dark:text-zinc-400 whitespace-nowrap">
        {done} / {TOTAL_CELLS}
      </span>
      <div className="flex-1 min-w-[80px] max-w-[200px] h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 whitespace-nowrap">{pct}%</span>
    </div>
  )
}
