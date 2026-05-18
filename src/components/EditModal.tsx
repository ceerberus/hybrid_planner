import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import type { DayEntry } from '../data/weeks'

const TYPE_OPTIONS = [
  { value: 'gym_ok', label: 'Gym OK' },
  { value: 'gym_uk', label: 'Gym UK' },
  { value: 'intervalle', label: 'Intervall' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'long_run', label: 'Long Run' },
  { value: 'easy', label: 'Easy' },
  { value: 'rest', label: 'Rest' },
  { value: 'race', label: 'Race' },
  { value: '__custom__', label: 'Eigenes Label…' },
]

const PREDEFINED_VALUES = TYPE_OPTIONS.filter(o => o.value !== '__custom__').map(o => o.value)

interface Props {
  cellId: string
  entry: DayEntry
  onClose: () => void
}

export default function EditModal({ cellId, entry, onClose }: Props) {
  const editCell = useStore(s => s.editCell)
  const editedCells = useStore(s => s.editedCells)
  const existing = editedCells[cellId]

  const initialType = existing?.type ?? entry.type
  const isCustomInitially = !PREDEFINED_VALUES.includes(initialType)

  const [selectValue, setSelectValue] = useState(isCustomInitially ? '__custom__' : initialType)
  const [customLabel, setCustomLabel] = useState(isCustomInitially ? initialType : '')
  const [title, setTitle] = useState(existing?.title ?? entry.title)
  const [detail, setDetail] = useState(existing?.detail ?? entry.detail ?? '')

  const titleRef = useRef<HTMLInputElement>(null)
  const customRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
    titleRef.current?.select()
  }, [])

  useEffect(() => {
    if (selectValue === '__custom__') {
      customRef.current?.focus()
    }
  }, [selectValue])

  const isCustom = selectValue === '__custom__'
  const effectiveType = isCustom ? customLabel.trim() : selectValue

  function handleSave() {
    const typeChanged = effectiveType && effectiveType !== entry.type
    const titleChanged = title.trim() !== entry.title
    const detailChanged = detail.trim() !== (entry.detail ?? '')

    if (!typeChanged && !titleChanged && !detailChanged) {
      editCell(cellId, null)
      onClose()
      return
    }

    editCell(cellId, {
      type: effectiveType || entry.type,
      title: title.trim() || entry.title,
      detail: detail.trim() || undefined,
    })
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-6"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Eintrag bearbeiten</h3>
          <span className="text-xs text-gray-400 dark:text-zinc-500 font-mono">{cellId}</span>
        </div>

        <div className="space-y-4">
          {/* Type / Label */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Label</label>
            <select
              value={selectValue}
              onChange={e => setSelectValue(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {isCustom && (
              <input
                ref={customRef}
                type="text"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                placeholder="Eigenes Label eingeben…"
                className="w-full mt-2 px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Überschrift</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Detail */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Detail / Notiz</label>
            <textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
              rows={3}
              placeholder="Pace, Notizen…"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-5">
          <span className="text-xs text-gray-400 dark:text-zinc-500">⌘↵ speichern</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
