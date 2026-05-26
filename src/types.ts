export interface CellEdit {
  type?: string
  title?: string
  detail?: string
}

export interface PlanAction {
  action: 'edit_cell' | 'toggle_done'
  cellId: string
  text?: string
  detail?: string
}
