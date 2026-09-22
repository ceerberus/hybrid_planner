import { create } from 'zustand'
import { fetchState, upsertState } from '../lib/supabase'
import type { CellEdit, PlanAction } from '../types'
import { createSeedBlock, getBlockCellIds, type TrainingBlock } from '../lib/blocks'
import type { CustomType } from '../lib/customTypes'

const LS_USERNAME = 'tp_username'
const LS_DONE = 'tp_done_cells'
const LS_EDITED = 'tp_edited_cells'
const LS_BLOCKS = 'tp_blocks'
const LS_ACTIVE_BLOCK = 'tp_active_block'
const LS_CUSTOM_TYPES = 'tp_custom_types'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'
type View = 'block' | 'overview'

interface AppState {
  username: string | null
  doneCells: Set<string>
  editedCells: Record<string, CellEdit>
  blocks: TrainingBlock[]
  activeBlockId: string | null
  customTypes: CustomType[]
  view: View
  showNewBlockModal: boolean
  syncStatus: SyncStatus
  isOffline: boolean
  collapsedPhases: Set<number>

  setUsername: (name: string) => void
  clearUsername: () => void
  toggleDone: (cellId: string) => void
  editCell: (cellId: string, edit: CellEdit | null) => void
  loadFromRemote: (username: string) => Promise<void>
  persistToRemote: () => void
  resetActiveBlockData: () => Promise<void>
  togglePhase: (phase: number) => void
  applyActions: (actions: PlanAction[]) => void
  addBlock: (block: TrainingBlock) => void
  setActiveBlockId: (id: string) => void
  deleteBlock: (id: string) => void
  setView: (view: View) => void
  setShowNewBlockModal: (show: boolean) => void
  addCustomType: (customType: CustomType) => void
  activeBlock: () => TrainingBlock
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
    const blocksRaw = localStorage.getItem(LS_BLOCKS)
    const blocks = blocksRaw ? (JSON.parse(blocksRaw) as TrainingBlock[]) : [createSeedBlock()]
    const activeBlockId = localStorage.getItem(LS_ACTIVE_BLOCK) ?? blocks[0]?.id ?? null
    const customTypes = JSON.parse(localStorage.getItem(LS_CUSTOM_TYPES) ?? '[]') as CustomType[]
    return { done: new Set(done), edited: migrateEditedCells(raw), blocks, activeBlockId, customTypes }
  } catch {
    const seed = createSeedBlock()
    return { done: new Set<string>(), edited: {}, blocks: [seed], activeBlockId: seed.id, customTypes: [] as CustomType[] }
  }
}

function saveLocalFallback(
  done: Set<string>,
  edited: Record<string, CellEdit>,
  blocks: TrainingBlock[],
  activeBlockId: string | null,
  customTypes: CustomType[],
) {
  localStorage.setItem(LS_DONE, JSON.stringify([...done]))
  localStorage.setItem(LS_EDITED, JSON.stringify(edited))
  localStorage.setItem(LS_BLOCKS, JSON.stringify(blocks))
  localStorage.setItem(LS_CUSTOM_TYPES, JSON.stringify(customTypes))
  if (activeBlockId) localStorage.setItem(LS_ACTIVE_BLOCK, activeBlockId)
}

// Computed once at module load so `activeBlock()`'s fallback is a stable reference across
// calls — returning a freshly-created object every call breaks zustand/React's snapshot
// stability check (useSyncExternalStore) and crashes the whole tree.
const FALLBACK_BLOCK = createSeedBlock()

const initialLocal = loadLocalFallback()

export const useStore = create<AppState>((set, get) => ({
  username: localStorage.getItem(LS_USERNAME),
  doneCells: initialLocal.done,
  editedCells: initialLocal.edited,
  blocks: initialLocal.blocks,
  activeBlockId: initialLocal.activeBlockId,
  customTypes: initialLocal.customTypes,
  view: 'block',
  showNewBlockModal: false,
  syncStatus: 'idle',
  isOffline: false,
  collapsedPhases: new Set(),

  activeBlock() {
    const { blocks, activeBlockId } = get()
    return blocks.find(b => b.id === activeBlockId) ?? blocks[0] ?? FALLBACK_BLOCK
  },

  setUsername(name) {
    localStorage.setItem(LS_USERNAME, name)
    set({ username: name })
  },

  clearUsername() {
    localStorage.removeItem(LS_USERNAME)
    localStorage.removeItem(LS_DONE)
    localStorage.removeItem(LS_EDITED)
    localStorage.removeItem(LS_BLOCKS)
    localStorage.removeItem(LS_ACTIVE_BLOCK)
    localStorage.removeItem(LS_CUSTOM_TYPES)
    set({ username: null, doneCells: new Set(), editedCells: {}, blocks: [], activeBlockId: null, customTypes: [], syncStatus: 'idle', view: 'block' })
  },

  toggleDone(cellId) {
    const { doneCells, editedCells, blocks, activeBlockId, customTypes } = get()
    const next = new Set(doneCells)
    if (next.has(cellId)) next.delete(cellId)
    else next.add(cellId)
    set({ doneCells: next })
    saveLocalFallback(next, editedCells, blocks, activeBlockId, customTypes)
    get().persistToRemote()
  },

  editCell(cellId, edit) {
    const { doneCells, editedCells, blocks, activeBlockId, customTypes } = get()
    const next = { ...editedCells }
    if (edit === null) {
      delete next[cellId]
    } else {
      next[cellId] = edit
    }
    set({ editedCells: next })
    saveLocalFallback(doneCells, next, blocks, activeBlockId, customTypes)
    get().persistToRemote()
  },

  async loadFromRemote(username) {
    set({ syncStatus: 'syncing' })
    try {
      const remote = await fetchState(username)
      if (remote) {
        const done = new Set(remote.done_cells)
        const edited = migrateEditedCells(remote.edited_cells as Record<string, unknown>)
        const remoteBlocks = (remote.blocks ?? []) as TrainingBlock[]
        const blocks = remoteBlocks.length > 0 ? remoteBlocks : [createSeedBlock()]
        const activeBlockId = remote.active_block_id ?? blocks[0].id
        const customTypes = (remote.custom_types ?? []) as CustomType[]
        set({ doneCells: done, editedCells: edited, blocks, activeBlockId, customTypes, syncStatus: 'synced', isOffline: false })
        saveLocalFallback(done, edited, blocks, activeBlockId, customTypes)
        if (remoteBlocks.length === 0) get().persistToRemote()
      } else {
        // New user, no data yet – start clean with the seed block
        const seed = createSeedBlock()
        set({ doneCells: new Set(), editedCells: {}, blocks: [seed], activeBlockId: seed.id, customTypes: [], syncStatus: 'synced', isOffline: false })
        saveLocalFallback(new Set(), {}, [seed], seed.id, [])
        get().persistToRemote()
      }
    } catch {
      const { done, edited, blocks, activeBlockId, customTypes } = loadLocalFallback()
      set({ doneCells: done, editedCells: edited, blocks, activeBlockId, customTypes, syncStatus: 'error', isOffline: true })
    }
  },

  persistToRemote() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const { username, doneCells, editedCells, blocks, activeBlockId, customTypes } = get()
      if (!username) return
      set({ syncStatus: 'syncing' })
      try {
        await upsertState(username, [...doneCells], editedCells, blocks, activeBlockId, customTypes)
        set({ syncStatus: 'synced', isOffline: false })
      } catch {
        set({ syncStatus: 'error', isOffline: true })
      }
    }, 800)
  },

  async resetActiveBlockData() {
    const { username, doneCells, editedCells, blocks, activeBlockId, customTypes } = get()
    const block = blocks.find(b => b.id === activeBlockId)
    if (!block) return
    const blockCellIds = new Set(getBlockCellIds(block))

    const nextDone = new Set([...doneCells].filter(id => !blockCellIds.has(id)))
    const nextEdited = Object.fromEntries(Object.entries(editedCells).filter(([id]) => !blockCellIds.has(id)))

    set({ doneCells: nextDone, editedCells: nextEdited })
    saveLocalFallback(nextDone, nextEdited, blocks, activeBlockId, customTypes)

    if (!username) return
    try {
      await upsertState(username, [...nextDone], nextEdited, blocks, activeBlockId, customTypes)
      set({ syncStatus: 'synced', isOffline: false })
    } catch {
      set({ syncStatus: 'error', isOffline: true })
    }
  },

  togglePhase(phase) {
    const { collapsedPhases } = get()
    const next = new Set(collapsedPhases)
    if (next.has(phase)) next.delete(phase)
    else next.add(phase)
    set({ collapsedPhases: next })
  },

  applyActions(actions) {
    for (const a of actions) {
      if (a.action === 'edit_cell') {
        get().editCell(a.cellId, { title: a.text, detail: a.detail })
      } else if (a.action === 'toggle_done') {
        get().toggleDone(a.cellId)
      }
    }
  },

  addBlock(block) {
    const { blocks, doneCells, editedCells, customTypes } = get()
    const nextBlocks = [...blocks, block]
    set({ blocks: nextBlocks, activeBlockId: block.id, view: 'block' })
    saveLocalFallback(doneCells, editedCells, nextBlocks, block.id, customTypes)
    get().persistToRemote()
  },

  setActiveBlockId(id) {
    const { doneCells, editedCells, blocks, customTypes } = get()
    set({ activeBlockId: id, view: 'block' })
    saveLocalFallback(doneCells, editedCells, blocks, id, customTypes)
    get().persistToRemote()
  },

  deleteBlock(id) {
    const { blocks, activeBlockId, doneCells, editedCells, customTypes } = get()
    if (blocks.length <= 1) return
    const block = blocks.find(b => b.id === id)
    const nextBlocks = blocks.filter(b => b.id !== id)
    const blockCellIds = block ? new Set(getBlockCellIds(block)) : new Set<string>()
    const nextDone = new Set([...doneCells].filter(cid => !blockCellIds.has(cid)))
    const nextEdited = Object.fromEntries(Object.entries(editedCells).filter(([cid]) => !blockCellIds.has(cid)))
    const nextActiveId = activeBlockId === id ? nextBlocks[0].id : activeBlockId

    set({ blocks: nextBlocks, activeBlockId: nextActiveId, doneCells: nextDone, editedCells: nextEdited })
    saveLocalFallback(nextDone, nextEdited, nextBlocks, nextActiveId, customTypes)
    get().persistToRemote()
  },

  setView(view) {
    set({ view })
  },

  setShowNewBlockModal(show) {
    set({ showNewBlockModal: show })
  },

  addCustomType(customType) {
    const { customTypes, doneCells, editedCells, blocks, activeBlockId } = get()
    if (customTypes.some(ct => ct.id === customType.id)) return
    const next = [...customTypes, customType]
    set({ customTypes: next })
    saveLocalFallback(doneCells, editedCells, blocks, activeBlockId, next)
    get().persistToRemote()
  },
}))
