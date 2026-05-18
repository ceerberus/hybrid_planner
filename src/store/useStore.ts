import { create } from 'zustand'
import { fetchState, upsertState, deleteState } from '../lib/supabase'
import type { CellEdit } from '../types'

const LS_USERNAME = 'tp_username'
const LS_DONE = 'tp_done_cells'
const LS_EDITED = 'tp_edited_cells'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface AppState {
  username: string | null
  doneCells: Set<string>
  editedCells: Record<string, CellEdit>
  syncStatus: SyncStatus
  isOffline: boolean
  collapsedPhases: Set<number>

  setUsername: (name: string) => void
  clearUsername: () => void
  toggleDone: (cellId: string) => void
  editCell: (cellId: string, edit: CellEdit | null) => void
  loadFromRemote: (username: string) => Promise<void>
  persistToRemote: () => void
  resetData: () => Promise<void>
  togglePhase: (phase: number) => void
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function migrateEditedCells(raw: Record<string, unknown>): Record<string, CellEdit> {
  const out: Record<string, CellEdit> = {}
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === 'string') {
      out[key] = { title: val }
    } else if (val && typeof val === 'object') {
      out[key] = val as CellEdit
    }
  }
  return out
}

function loadLocalFallback() {
  try {
    const done = JSON.parse(localStorage.getItem(LS_DONE) ?? '[]') as string[]
    const raw = JSON.parse(localStorage.getItem(LS_EDITED) ?? '{}') as Record<string, unknown>
    return { done: new Set(done), edited: migrateEditedCells(raw) }
  } catch {
    return { done: new Set<string>(), edited: {} }
  }
}

function saveLocalFallback(done: Set<string>, edited: Record<string, CellEdit>) {
  localStorage.setItem(LS_DONE, JSON.stringify([...done]))
  localStorage.setItem(LS_EDITED, JSON.stringify(edited))
}

export const useStore = create<AppState>((set, get) => ({
  username: localStorage.getItem(LS_USERNAME),
  doneCells: new Set(),
  editedCells: {},
  syncStatus: 'idle',
  isOffline: false,
  collapsedPhases: new Set(),

  setUsername(name) {
    localStorage.setItem(LS_USERNAME, name)
    set({ username: name })
  },

  clearUsername() {
    localStorage.removeItem(LS_USERNAME)
    localStorage.removeItem(LS_DONE)
    localStorage.removeItem(LS_EDITED)
    set({ username: null, doneCells: new Set(), editedCells: {}, syncStatus: 'idle' })
  },

  toggleDone(cellId) {
    const { doneCells, editedCells } = get()
    const next = new Set(doneCells)
    if (next.has(cellId)) next.delete(cellId)
    else next.add(cellId)
    set({ doneCells: next })
    saveLocalFallback(next, editedCells)
    get().persistToRemote()
  },

  editCell(cellId, edit) {
    const { doneCells, editedCells } = get()
    const next = { ...editedCells }
    if (edit === null) {
      delete next[cellId]
    } else {
      next[cellId] = edit
    }
    set({ editedCells: next })
    saveLocalFallback(doneCells, next)
    get().persistToRemote()
  },

  async loadFromRemote(username) {
    set({ syncStatus: 'syncing' })
    try {
      const remote = await fetchState(username)
      if (remote) {
        const done = new Set(remote.done_cells)
        const edited = migrateEditedCells(remote.edited_cells as Record<string, unknown>)
        set({ doneCells: done, editedCells: edited, syncStatus: 'synced', isOffline: false })
        saveLocalFallback(done, edited)
      } else {
        // New user, no data yet – start clean (don't inherit localStorage from previous user)
        set({ doneCells: new Set(), editedCells: {}, syncStatus: 'synced', isOffline: false })
        saveLocalFallback(new Set(), {})
      }
    } catch {
      const { done, edited } = loadLocalFallback()
      set({ doneCells: done, editedCells: edited, syncStatus: 'error', isOffline: true })
    }
  },

  persistToRemote() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const { username, doneCells, editedCells } = get()
      if (!username) return
      set({ syncStatus: 'syncing' })
      try {
        await upsertState(username, [...doneCells], editedCells)
        set({ syncStatus: 'synced', isOffline: false })
      } catch {
        set({ syncStatus: 'error', isOffline: true })
      }
    }, 800)
  },

  async resetData() {
    const { username } = get()
    if (!username) return
    try {
      await deleteState(username)
    } catch {
      // best effort
    }
    localStorage.removeItem(LS_DONE)
    localStorage.removeItem(LS_EDITED)
    set({ doneCells: new Set(), editedCells: {}, syncStatus: 'idle' })
  },

  togglePhase(phase) {
    const { collapsedPhases } = get()
    const next = new Set(collapsedPhases)
    if (next.has(phase)) next.delete(phase)
    else next.add(phase)
    set({ collapsedPhases: next })
  },
}))
