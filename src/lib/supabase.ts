/*
  Run this SQL in your Supabase project (SQL Editor):

  create table training_state (
    username text primary key,
    done_cells jsonb not null default '[]',
    edited_cells jsonb not null default '{}',
    updated_at timestamptz not null default now()
  );

  -- Optional: enable Row Level Security (table is public since no auth)
  alter table training_state enable row level security;
  create policy "public read/write" on training_state
    for all using (true) with check (true);
*/

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface RemoteState {
  done_cells: string[]
  edited_cells: Record<string, unknown>
}

export async function fetchState(username: string): Promise<RemoteState | null> {
  const { data, error } = await supabase
    .from('training_state')
    .select('done_cells, edited_cells')
    .eq('username', username)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as RemoteState
}

export async function upsertState(
  username: string,
  doneCells: string[],
  editedCells: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from('training_state').upsert(
    {
      username,
      done_cells: doneCells,
      edited_cells: editedCells,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'username' },
  )
  if (error) throw error
}

export async function deleteState(username: string): Promise<void> {
  const { error } = await supabase
    .from('training_state')
    .delete()
    .eq('username', username)
  if (error) throw error
}
