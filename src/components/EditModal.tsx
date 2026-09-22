import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import type { DayEntry } from '../data/weeks'
import { COLOR_PALETTE, getColorOption, slugifyCustomTypeId } from '../lib/customTypes'

const BUILTIN_TYPE_OPTIONS = [
  { value: 'gym_ok', label: 'Gym OK' },
  { value: 'gym_uk', label: 'Gym UK' },
  { value: 'intervalle', label: 'Intervall' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'long_run', label: 'Long Run' },
  { value: 'easy', label: 'Easy' },
  { value: 'rest', label: 'Rest' },
  { value: 'krank', label: 'Krank' },
  { value: 'race', label: 'Race' },
]

interface Props {
  cellId: string
  entry: DayEntry
  onClose: () => void
}

export default function EditModal({ cellId, entry, onClose }: Props) {
  const editCell = useStore(s => s.editCell)
  const editedCells = useStore(s => s.editedCells)
  const customTypes = useStore(s => s.customTypes)
  const addCustomType = useStore(s => s.addCustomType)
  const existing = editedCells[cellId]

  const typeOptions = [
    ...BUILTIN_TYPE_OPTIONS,
    ...customTypes.map(ct => ({ value: ct.id, label: ct.label })),
    { value: '__custom__', label: 'Eigenes Label…' },
  ]
  const predefinedValues = [...BUILTIN_TYPE_OPTIONS.map(o => o.value), ...customTypes.map(ct => ct.id)]

  const initialType = existing?.type ?? entry.type
  const isCustomInitially = !predefinedValues.includes(initialType)
  const initialCustomType = customTypes.find(ct => ct.id === initialType)

  const [selectValue, setSelectValue] = useState(isCustomInitially ? '__custom__' : initialType)
  const [customLabel, setCustomLabel] = useState(isCustomInitially ? initialType : '')
  const [color, setColor] = useState(initialCustomType?.color ?? COLOR_PALETTE[0].key)
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

  const isCreatingCustom = selectValue === '__custom__'
  const previewBadgeClass = getColorOption(color).badgeClass

  function handleSave() {
    let effectiveType = selectValue

    if (isCreatingCustom) {
      const label = customLabel.trim()
      if (label) {
        const id = slugifyCustomTypeId(label)
        if (!customTypes.some(ct => ct.id === id)) {
          addCustomType({ id, label, color })
        }
        effectiveType = id
      } else {
        effectiveType = entry.type
      }
    }

    const typeChanged = effectiveType !== entry.type
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
      detail: detail.trim(),
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
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {isCreatingCustom && (
              <div className="mt-2.5 space-y-2.5">
                <input
                  ref={customRef}
                  type="text"
                  value={customLabel}
                  onChange={e => setCustomLabel(e.target.value)}
                  placeholder="Eigenes Label eingeben…"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-gray-400 dark:text-zinc-500">Farbe</span>
                    {customLabel.trim() && (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${previewBadgeClass} leading-none`}>
                        {customLabel.trim()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setColor(opt.key)}
                        aria-label={opt.key}
                        title={opt.key}
                        className={[
                          'w-6 h-6 rounded-full transition-all',
                          opt.swatchClass,
                          color === opt.key
                            ? 'ring-2 ring-offset-2 ring-gray-800 dark:ring-white ring-offset-white dark:ring-offset-zinc-900 scale-110'
                            : 'hover:scale-110 opacity-80 hover:opacity-100',
                        ].join(' ')}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 dark:text-zinc-500">
                  Wird nach dem Speichern dauerhaft in der Label-Liste verfügbar sein.
                </p>
              </div>
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
