# Hybrid Planner

Persönlicher Trainingsplan-Tracker für 18 Wochen. React + Vite + TypeScript + Tailwind CSS, Daten in Supabase.

## Setup

**1. Abhängigkeiten installieren**
```bash
npm install
```

**2. `.env` anlegen**

Supabase URL und Anon Key eintragen (Supabase → Settings → API).

**3. Supabase-Tabelle erstellen**

Im Supabase SQL-Editor ausführen:
```sql
create table training_state (
  username text primary key,
  done_cells jsonb not null default '[]',
  edited_cells jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table training_state enable row level security;
create policy "public read/write" on training_state
  for all using (true) with check (true);
```

**4. Dev-Server starten**
```bash
npm run dev
```

## Bedienung

| Aktion | Geste |
|---|---|
| Einheit abhaken | Klick |
| Einheit bearbeiten | Rechtsklick (Desktop) / Gedrückt halten (Mobile) |
| Speichern im Modal | Cmd/Ctrl + Enter |
| Phase ein-/ausklappen | Klick auf Phase-Header |

- **Label, Überschrift und Detail** sind im Bearbeitungs-Modal änderbar; eigene Labels können frei eingegeben werden.
- Änderungen werden automatisch mit Supabase synchronisiert (800 ms Debounce).
- Bei fehlendem Netz: lokaler Fallback via localStorage, Banner zeigt Offline-Status.
- **Export** erzeugt eine `.txt`-Datei mit allen Einträgen und Häkchen.
- **Reset** löscht alle Daten des eigenen Nutzers (Bestätigungsdialog).

## Deploy (Netlify)

`netlify.toml` ist bereits konfiguriert. Im Netlify-Dashboard unter **Site → Environment variables** die zwei `VITE_`-Variablen eintragen, dann deployen.

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
