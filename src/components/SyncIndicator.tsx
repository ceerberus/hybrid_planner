import { useStore } from '../store/useStore'

export default function SyncIndicator() {
  const syncStatus = useStore(s => s.syncStatus)

  const configs = {
    idle: { dot: 'bg-gray-300 dark:bg-zinc-600', label: '' },
    syncing: { dot: 'bg-yellow-400 animate-pulse', label: 'Syncing…' },
    synced: { dot: 'bg-emerald-400', label: 'Gespeichert' },
    error: { dot: 'bg-red-400', label: 'Fehler' },
  }

  const { dot, label } = configs[syncStatus]

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      {label && <span>{label}</span>}
    </div>
  )
}
