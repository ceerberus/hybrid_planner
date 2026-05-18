export type DayKey = 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so'

export type WorkoutType =
  | 'gym_ok'
  | 'gym_uk'
  | 'intervalle'
  | 'tempo'
  | 'long_run'
  | 'easy'
  | 'rest'
  | 'race'

export interface DayEntry {
  type: WorkoutType
  title: string
  detail?: string
}

export interface Week {
  id: string
  label: string
  dateRange: string
  phase: number
  phaseName: string
  isDeload?: boolean
  isRace?: boolean
  days: Record<DayKey, DayEntry>
}

export const DAY_LABELS: Record<DayKey, string> = {
  mo: 'Mo',
  di: 'Di',
  mi: 'Mi',
  do: 'Do',
  fr: 'Fr',
  sa: 'Sa',
  so: 'So',
}

export const DAYS: DayKey[] = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so']

export const PHASE_NAMES: Record<number, string> = {
  1: 'Basis',
  2: 'Aufbau',
  3: 'Spezifisch',
  4: 'Peak',
  5: 'Tapering',
}

export const weeks: Week[] = [
  // ── Phase 1 – Basis ──────────────────────────────────────────────────────
  {
    id: 'W1',
    label: 'W1',
    dateRange: '18.05–24.05',
    phase: 1,
    phaseName: 'Basis',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Brust, Schulter, Trizeps' },
      di: { type: 'intervalle', title: 'Intervalle 6×800m', detail: '@ 4:00–4:10/km' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'Squat, Deadlift, Lunges – leicht nach Intervallen' },
      do: { type: 'easy', title: 'Easy 8km', detail: '@ 5:30–6:00/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Klimmzüge, Rudern, Bizeps' },
      sa: { type: 'rest', title: 'Rest / Wandern', detail: '' },
      so: { type: 'long_run', title: 'Long Run 14km', detail: '@ 5:20–5:40/km' },
    },
  },
  {
    id: 'W2',
    label: 'W2',
    dateRange: '25.05–31.05',
    phase: 1,
    phaseName: 'Basis',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Drücken + Schulter' },
      di: { type: 'tempo', title: 'Tempo 8km', detail: '2km easy + 5km @ 4:30/km + 1km cool-down' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'Bulgarian Split, RDL, Calf Raises' },
      do: { type: 'easy', title: 'Easy 6km', detail: '@ 5:30–6:00/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Rücken, Core, Face Pulls' },
      sa: { type: 'rest', title: 'Rest / Wandern', detail: '' },
      so: { type: 'long_run', title: 'Long Run 15km', detail: '@ 5:20–5:40/km' },
    },
  },
  {
    id: 'W3',
    label: 'W3',
    dateRange: '01.06–07.06',
    phase: 1,
    phaseName: 'Basis',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Bankdrücken + OHP' },
      di: { type: 'intervalle', title: 'Intervalle 5×1000m', detail: '@ 4:05–4:15/km, 2min Pause' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'Leg Press, Nordic Curl, Beinbeuger' },
      do: { type: 'easy', title: 'Easy 8km', detail: '@ 5:20–5:50/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Klimmzüge, Latzug, Schulter' },
      sa: { type: 'rest', title: 'Rest / Wandern', detail: '' },
      so: { type: 'long_run', title: 'Long Run 16km', detail: '@ 5:20–5:40/km' },
    },
  },
  {
    id: 'W4',
    label: 'W4',
    dateRange: '08.06–14.06',
    phase: 1,
    phaseName: 'Basis',
    isDeload: true,
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK light', detail: 'Volumen −30%, Technik' },
      di: { type: 'easy', title: 'Easy 6km', detail: '@ 5:40–6:10/km' },
      mi: { type: 'gym_uk', title: 'Gym UK light', detail: 'Leicht, Beweglichkeit' },
      do: { type: 'easy', title: 'Easy 5km + Strides', detail: '5km + 4×100m Strides' },
      fr: { type: 'gym_ok', title: 'Gym OK light', detail: 'Oberkörper, Mobility' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: 'Long Run 12km', detail: '@ 5:30–5:50/km' },
    },
  },

  // ── Phase 2 – Aufbau ──────────────────────────────────────────────────────
  {
    id: 'W5',
    label: 'W5',
    dateRange: '15.06–21.06',
    phase: 2,
    phaseName: 'Aufbau',
    isRace: true,
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Normal, dann taper' },
      di: { type: 'easy', title: 'Easy 4km', detail: '@ 5:30/km' },
      mi: { type: 'rest', title: 'Rest', detail: '' },
      do: { type: 'easy', title: 'Easy 3km + Strides', detail: '3km + 4×80m Strides' },
      fr: { type: 'rest', title: 'Rest / Mobility', detail: '' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'race', title: '🏁 9,7km Rennen', detail: 'Zielpace 4:20–4:40/km' },
    },
  },
  {
    id: 'W6',
    label: 'W6',
    dateRange: '22.06–28.06',
    phase: 2,
    phaseName: 'Aufbau',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Normal, kein Max' },
      di: { type: 'tempo', title: 'Tempo 10km', detail: '2km easy + 6km @ 4:35–4:45/km + 2km cool-down' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'Squat + Deadlift mod.' },
      do: { type: 'easy', title: 'Easy 8km', detail: '@ 5:20–5:40/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Pull + Core' },
      sa: { type: 'rest', title: 'Rest / Wandern', detail: '' },
      so: { type: 'long_run', title: 'Long Run 17km', detail: '@ 5:15–5:30/km' },
    },
  },
  {
    id: 'W7',
    label: 'W7',
    dateRange: '29.06–05.07',
    phase: 2,
    phaseName: 'Aufbau',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Drücken progressiv' },
      di: { type: 'intervalle', title: 'Intervalle 8×600m', detail: '@ 3:55–4:05/km, 90sek Pause' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'RDL, Split Squat leicht' },
      do: { type: 'easy', title: 'Easy 9km', detail: '@ 5:20–5:40/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Ziehen + Schulter' },
      sa: { type: 'rest', title: 'Rest / Wandern', detail: '' },
      so: { type: 'long_run', title: 'Long Run 18km', detail: '@ 5:10–5:25/km' },
    },
  },
  {
    id: 'W8',
    label: 'W8',
    dateRange: '06.07–12.07',
    phase: 2,
    phaseName: 'Aufbau',
    isDeload: true,
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK light', detail: 'Volumen −30%' },
      di: { type: 'tempo', title: 'Tempo 8km', detail: '2km easy + 4km @ 4:30/km + 2km easy' },
      mi: { type: 'gym_uk', title: 'Gym UK light', detail: 'Leicht, Mobilität' },
      do: { type: 'easy', title: 'Easy 6km', detail: '@ 5:40/km' },
      fr: { type: 'gym_ok', title: 'Gym OK light', detail: 'Oberkörper' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: 'Long Run 14km', detail: '@ 5:20–5:40/km' },
    },
  },

  // ── Phase 3 – Spezifisch ──────────────────────────────────────────────────
  {
    id: 'W9',
    label: 'W9',
    dateRange: '13.07–19.07',
    phase: 3,
    phaseName: 'Spezifisch',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Kraftaufbau, schwere Sets' },
      di: { type: 'intervalle', title: 'Intervalle 6×1000m', detail: '@ 4:10–4:20/km, 2min Pause' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'Squat + Deadlift heavy' },
      do: { type: 'easy', title: 'Easy 10km', detail: '@ 5:20–5:30/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Rücken + Schulter' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: 'Long Run 19km', detail: '@ 5:10–5:25/km' },
    },
  },
  {
    id: 'W10',
    label: 'W10',
    dateRange: '20.07–26.07',
    phase: 3,
    phaseName: 'Spezifisch',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Drücken' },
      di: { type: 'tempo', title: 'Tempolauf 12km', detail: '2km easy + 8km @ 4:40/km HM-Pace + 2km cool-down' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'Beine mod., kein Max' },
      do: { type: 'easy', title: 'Easy 10km', detail: '@ 5:20–5:30/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Pull + Core' },
      sa: { type: 'rest', title: 'Rest / Wandern', detail: '' },
      so: { type: 'long_run', title: 'Long Run 20km', detail: '@ 5:10–5:20/km' },
    },
  },
  {
    id: 'W11',
    label: 'W11',
    dateRange: '27.07–02.08',
    phase: 3,
    phaseName: 'Spezifisch',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Normal' },
      di: { type: 'intervalle', title: 'Intervalle 4×2km', detail: '@ 4:20–4:30/km, 2:30min Pause' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'Squat + RDL' },
      do: { type: 'easy', title: 'Easy 10km', detail: '@ 5:20–5:30/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Oberkörper' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: 'Long Run 21km', detail: '@ 5:10–5:20/km' },
    },
  },
  {
    id: 'W12',
    label: 'W12',
    dateRange: '03.08–09.08',
    phase: 3,
    phaseName: 'Spezifisch',
    isDeload: true,
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK light', detail: 'Volumen −30%' },
      di: { type: 'tempo', title: 'Tempo 8km', detail: '2km easy + 4km @ 4:40/km + 2km easy' },
      mi: { type: 'gym_uk', title: 'Gym UK light', detail: 'Leicht' },
      do: { type: 'easy', title: 'Easy 6km', detail: '@ 5:40/km' },
      fr: { type: 'gym_ok', title: 'Gym OK light', detail: 'Oberkörper' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: 'Long Run 15km', detail: '@ 5:15–5:30/km' },
    },
  },

  // ── Phase 4 – Peak ────────────────────────────────────────────────────────
  {
    id: 'W13',
    label: 'W13',
    dateRange: '10.08–16.08',
    phase: 4,
    phaseName: 'Peak',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Intensität hoch' },
      di: { type: 'intervalle', title: 'Intervalle 5×1200m', detail: '@ 4:05–4:15/km, 2min Pause' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'Squat heavy + Accessory' },
      do: { type: 'easy', title: 'Easy 10km', detail: '@ 5:15–5:25/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Rücken + Schulter' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: 'Long Run 22km', detail: '@ 5:05–5:20/km' },
    },
  },
  {
    id: 'W14',
    label: 'W14',
    dateRange: '17.08–23.08',
    phase: 4,
    phaseName: 'Peak',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Schwer' },
      di: { type: 'tempo', title: 'Tempolauf 14km', detail: '2km easy + 10km @ 4:40–4:45/km + 2km cool-down' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'Deadlift + Beinpresse' },
      do: { type: 'easy', title: 'Easy 10km', detail: '@ 5:15–5:25/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Ziehen + Core' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: 'Long Run 22km', detail: '@ 5:05–5:15/km' },
    },
  },
  {
    id: 'W15',
    label: 'W15',
    dateRange: '24.08–30.08',
    phase: 4,
    phaseName: 'Peak',
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Normal' },
      di: { type: 'intervalle', title: 'Intervalle 3×3km', detail: '@ 4:25–4:35/km, 3min Pause' },
      mi: { type: 'gym_uk', title: 'Gym UK', detail: 'Squat + RDL leichter' },
      do: { type: 'easy', title: 'Easy 10km', detail: '@ 5:20/km' },
      fr: { type: 'gym_ok', title: 'Gym OK', detail: 'Oberkörper' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: 'Long Run 20km', detail: '@ 5:10–5:20/km' },
    },
  },

  // ── Phase 5 – Tapering ────────────────────────────────────────────────────
  {
    id: 'W16',
    label: 'W16',
    dateRange: '31.08–06.09',
    phase: 5,
    phaseName: 'Tapering',
    isDeload: true,
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Vol. −40%, Intensität bleibt' },
      di: { type: 'tempo', title: 'Tempo 8km', detail: '2km easy + 4km @ 4:45/km + 2km cool-down' },
      mi: { type: 'gym_uk', title: 'Gym UK light', detail: 'Leicht, Mobilität' },
      do: { type: 'easy', title: 'Easy 7km', detail: '@ 5:20–5:30/km' },
      fr: { type: 'gym_ok', title: 'Gym OK light', detail: 'Oberkörper leicht' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: 'Long Run 16km', detail: '@ 5:15–5:25/km' },
    },
  },
  {
    id: 'W17',
    label: 'W17',
    dateRange: '07.09–13.09',
    phase: 5,
    phaseName: 'Tapering',
    isDeload: true,
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Vol. −50%, Intensität hoch' },
      di: { type: 'intervalle', title: 'Intervalle kurz', detail: '4km easy + 4×400m @ 4:00/km + 2km cool-down' },
      mi: { type: 'gym_uk', title: 'Gym UK light', detail: 'Nur Aktivierung' },
      do: { type: 'easy', title: 'Easy 6km', detail: '@ 5:20–5:30/km' },
      fr: { type: 'gym_ok', title: 'Gym OK light', detail: 'Oberkörper leicht' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: 'Long Run 12km', detail: '@ 5:20–5:30/km' },
    },
  },
  {
    id: 'W18',
    label: 'W18',
    dateRange: '14.09–20.09',
    phase: 5,
    phaseName: 'Tapering',
    isRace: true,
    days: {
      mo: { type: 'gym_ok', title: 'Gym OK', detail: 'Sehr leicht, kein Max' },
      di: { type: 'easy', title: 'Easy 5km + Strides', detail: '5km + 4×100m Strides' },
      mi: { type: 'rest', title: 'Rest', detail: '' },
      do: { type: 'easy', title: 'Easy 4km', detail: '@ 5:30/km' },
      fr: { type: 'rest', title: 'Rest', detail: '' },
      sa: { type: 'rest', title: 'Rest / Stretching', detail: '' },
      so: { type: 'race', title: '🏁 Halbmarathon', detail: 'Ziel sub 1:40 | Start-Pace 4:42–4:45/km' },
    },
  },
]

export const TOTAL_CELLS = weeks.length * 7

export function getCellId(weekId: string, day: DayKey): string {
  return `${weekId}_${day}`
}

export function getCurrentDay(): DayKey | null {
  const map: Record<number, DayKey> = {
    0: 'so', 1: 'mo', 2: 'di', 3: 'mi', 4: 'do', 5: 'fr', 6: 'sa',
  }
  return map[new Date().getDay()] ?? null
}

export function getCurrentWeekId(): string {
  const now = new Date()
  for (const week of weeks) {
    const [startStr] = week.dateRange.split('–')
    const parts = startStr.split('.')
    const year = 2026
    const d = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]))
    const end = new Date(d)
    end.setDate(end.getDate() + 6)
    if (now >= d && now <= end) return week.id
  }
  if (now < new Date(2026, 4, 18)) return 'W1'
  return 'W18'
}
