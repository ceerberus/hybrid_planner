import type { WorkoutType } from '../data/weeks'

const CONFIG: Record<WorkoutType, { label: string; className: string }> = {
  gym_ok: { label: 'Gym OK', className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30' },
  gym_uk: { label: 'Gym UK', className: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30' },
  intervalle: { label: 'Intervall', className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30' },
  tempo: { label: 'Tempo', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30' },
  long_run: { label: 'Long Run', className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30' },
  easy: { label: 'Easy', className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30' },
  rest: { label: 'Rest', className: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' },
  race: { label: 'Race', className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30' },
}

interface Props {
  type: string
}

export default function TypeBadge({ type }: Props) {
  const config = CONFIG[type as WorkoutType]
  if (config) {
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${config.className} leading-none`}>
        {config.label}
      </span>
    )
  }
  // Custom label
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-500/20 dark:text-zinc-300 dark:border-zinc-500/30 leading-none">
      {type}
    </span>
  )
}
