import type { DayEntry, DayKey, Week } from '../data/weeks'
import { DAYS, PHASE_NAMES, getCellId, seedWeeks } from '../data/weeks'

export interface Race {
  /** ISO date, yyyy-mm-dd */
  date: string
  label: string
}

export interface TrainingBlock {
  id: string
  name: string
  /** ISO date (Monday) the block's first week starts */
  startDate: string
  /** ISO date (Sunday) the block's last week ends */
  endDate: string
  races: Race[]
  weeks: Week[]
  createdAt: string
}

// ── date helpers ────────────────────────────────────────────────────────────

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d: Date, n: number): Date {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + n)
  return nd
}

function mondayOf(d: Date): Date {
  const day = d.getDay() // 0 = Sunday .. 6 = Saturday
  const diff = day === 0 ? -6 : 1 - day
  return addDays(d, diff)
}

function formatDDMM(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

const WEEKDAY_TO_DAYKEY: Record<number, DayKey> = {
  0: 'so', 1: 'mo', 2: 'di', 3: 'mi', 4: 'do', 5: 'fr', 6: 'sa',
}

// ── seed block (wraps the original hand-crafted plan) ──────────────────────

export function createSeedBlock(): TrainingBlock {
  const first = seedWeeks[0]
  const last = seedWeeks[seedWeeks.length - 1]
  const [firstStartStr] = first.dateRange.split('–')
  const [, lastEndStr] = last.dateRange.split('–')
  const parseLegacy = (ddmm: string) => {
    const [dd, mm] = ddmm.split('.')
    return toISO(new Date(2026, parseInt(mm) - 1, parseInt(dd)))
  }
  return {
    id: 'seed-halbmarathon',
    name: 'Halbmarathon 2026',
    startDate: parseLegacy(firstStartStr),
    endDate: parseLegacy(lastEndStr),
    races: [
      { date: '2026-06-21', label: '9,7km Rennen' },
      { date: '2026-09-20', label: 'Halbmarathon' },
    ],
    weeks: seedWeeks,
    createdAt: '2026-05-01T00:00:00.000Z',
  }
}

// ── generator ────────────────────────────────────────────────────────────

/** Relative phase sizing, mirrors the original 18-week block (4:4:4:3:3). */
const PHASE_WEIGHTS = [4, 4, 4, 3, 3]

function distributePhaseWeeks(totalWeeks: number): number[] {
  if (totalWeeks <= 0) return [0, 0, 0, 0, 0]
  if (totalWeeks <= 5) {
    // Short blocks skip the early base-building phases and go straight into sharpening.
    const counts = [0, 0, 0, 0, 0]
    let remaining = totalWeeks
    for (let i = 4; i >= 0 && remaining > 0; i--) {
      counts[i] = 1
      remaining--
    }
    return counts
  }
  const sumW = PHASE_WEIGHTS.reduce((a, b) => a + b, 0)
  const counts = PHASE_WEIGHTS.map(w => Math.floor((w / sumW) * totalWeeks))
  let remainder = totalWeeks - counts.reduce((a, b) => a + b, 0)
  let i = 0
  while (remainder > 0) {
    counts[i % 4]++ // spread extra weeks across Basis..Peak, keep Tapering tight
    remainder--
    i++
  }
  return counts
}

function qualitySession(phaseIndex: number, weekNo: number, isDeload: boolean): DayEntry {
  const useIntervals = weekNo % 2 === 0
  if (useIntervals) {
    const reps = Math.max(3, (isDeload ? 3 : 4 + phaseIndex))
    const meters = 600 + phaseIndex * 100
    return {
      type: 'intervalle',
      title: `Intervalle ${reps}×${meters}m`,
      detail: isDeload ? 'locker, Fokus Technik' : '',
    }
  }
  const km = isDeload ? 6 : 8 + phaseIndex
  return {
    type: 'tempo',
    title: `Tempo ${km}km`,
    detail: isDeload ? '' : 'inkl. Ein-/Auslaufen',
  }
}

interface WeekBuildCtx {
  phase: number
  isDeload: boolean
  isTaperPhase: boolean
  race?: Race
  longRunKm: number
  weekNo: number
}

function buildWeekDays(ctx: WeekBuildCtx): Record<DayKey, DayEntry> {
  const { phase, isDeload, isTaperPhase, race, longRunKm, weekNo } = ctx
  const phaseIndex = phase - 1

  if (race) {
    const raceDayKey = WEEKDAY_TO_DAYKEY[parseISO(race.date).getDay()]
    const raceIdx = DAYS.indexOf(raceDayKey)
    const days = {} as Record<DayKey, DayEntry>
    DAYS.forEach((day, idx) => {
      if (day === raceDayKey) {
        days[day] = { type: 'race', title: `🏁 ${race.label}`, detail: '' }
        return
      }
      const daysBefore = raceIdx - idx
      if (idx === 0 && day !== raceDayKey) {
        days[day] = { type: 'gym_ok', title: 'Gym OK leicht', detail: 'Kein Max, nur Aktivierung' }
      } else if (daysBefore >= 1 && daysBefore <= 2) {
        days[day] = { type: 'easy', title: 'Easy + Steigerungen', detail: 'kurz & locker, 4×80m Strides' }
      } else {
        days[day] = { type: 'rest', title: 'Rest', detail: '' }
      }
    })
    return days
  }

  if (isTaperPhase) {
    return {
      mo: { type: 'gym_ok', title: 'Gym OK light', detail: 'Vol. −40%, Intensität bleibt' },
      di: qualitySession(phaseIndex, weekNo, true),
      mi: { type: 'gym_uk', title: 'Gym UK light', detail: 'Nur Aktivierung' },
      do: { type: 'easy', title: `Easy ${Math.max(4, Math.round(longRunKm * 0.4))}km`, detail: '' },
      fr: { type: 'gym_ok', title: 'Gym OK light', detail: 'Oberkörper leicht' },
      sa: { type: 'rest', title: 'Rest', detail: '' },
      so: { type: 'long_run', title: `Long Run ${longRunKm}km`, detail: '' },
    }
  }

  return {
    mo: { type: 'gym_ok', title: isDeload ? 'Gym OK light' : 'Gym OK', detail: isDeload ? 'Volumen −30%' : '' },
    di: qualitySession(phaseIndex, weekNo, isDeload),
    mi: { type: 'gym_uk', title: isDeload ? 'Gym UK light' : 'Gym UK', detail: isDeload ? 'Leicht, Mobilität' : '' },
    do: { type: 'easy', title: `Easy ${Math.max(4, Math.round(longRunKm * 0.45))}km`, detail: '' },
    fr: { type: 'gym_ok', title: isDeload ? 'Gym OK light' : 'Gym OK', detail: isDeload ? 'Oberkörper' : '' },
    sa: { type: 'rest', title: 'Rest / Wandern', detail: '' },
    so: { type: 'long_run', title: `Long Run ${longRunKm}km`, detail: '' },
  }
}

export interface GenerateBlockInput {
  name: string
  /** ISO date, yyyy-mm-dd */
  startDate: string
  /** ISO date, yyyy-mm-dd */
  endDate: string
  races: Race[]
}

function alignToWeeks(startDateISO: string, endDateISO: string, races: Race[]): { blockStart: Date; blockEnd: Date; totalWeeks: number } {
  const blockStart = mondayOf(parseISO(startDateISO))
  let blockEnd = addDays(mondayOf(parseISO(endDateISO)), 6)

  const sortedRaces = [...races].sort((a, b) => a.date.localeCompare(b.date))
  for (const race of sortedRaces) {
    const raceDate = parseISO(race.date)
    if (raceDate > blockEnd) blockEnd = addDays(mondayOf(raceDate), 6)
  }

  // Round to whole days first to absorb DST-induced fractional-hour drift in the ms diff.
  const diffDays = Math.round((blockEnd.getTime() - blockStart.getTime()) / 86400000)
  const totalWeeks = Math.max(1, Math.floor(diffDays / 7) + 1)
  return { blockStart, blockEnd, totalWeeks }
}

/** Preview helper: how many weeks a given (unaligned) date range would produce once Monday/Sunday-aligned. */
export function previewWeekCount(startDateISO: string, endDateISO: string, races: Race[] = []): number {
  return alignToWeeks(startDateISO, endDateISO, races).totalWeeks
}

export function generateTrainingBlock(input: GenerateBlockInput): TrainingBlock {
  const { blockStart, blockEnd, totalWeeks } = alignToWeeks(input.startDate, input.endDate, input.races)
  const sortedRaces = [...input.races].sort((a, b) => a.date.localeCompare(b.date))
  const phaseCounts = distributePhaseWeeks(totalWeeks)

  const id = `block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

  const weeks: Week[] = []
  let phaseIndex = 0
  let weekInPhase = 0
  let peakLongRun = 10

  for (let w = 0; w < totalWeeks; w++) {
    while (phaseIndex < 4 && weekInPhase >= phaseCounts[phaseIndex]) {
      phaseIndex++
      weekInPhase = 0
    }
    const phase = phaseIndex + 1
    const phaseWeekCount = phaseCounts[phaseIndex] || 1
    const isLastOfPhase = weekInPhase === phaseWeekCount - 1
    const isTaperPhase = phase === 5
    const isDeload = !isTaperPhase && isLastOfPhase && phaseWeekCount >= 3

    const weekStart = addDays(blockStart, w * 7)
    const weekEnd = addDays(weekStart, 6)
    const weekNo = w + 1

    const raceInWeek = sortedRaces.find(r => {
      const rd = parseISO(r.date)
      return rd >= weekStart && rd <= weekEnd
    })

    if (!isTaperPhase && !raceInWeek) {
      peakLongRun = Math.min(22, peakLongRun + (isDeload ? 0 : 1))
    }

    let longRunKm: number
    if (isTaperPhase) {
      const taperFactor = Math.max(0.35, 0.7 - weekInPhase * 0.18)
      longRunKm = Math.max(8, Math.round(peakLongRun * taperFactor))
    } else if (isDeload) {
      longRunKm = Math.round(peakLongRun * 0.72)
    } else {
      longRunKm = peakLongRun
    }

    const days = buildWeekDays({
      phase,
      isDeload,
      isTaperPhase,
      race: raceInWeek,
      longRunKm,
      weekNo,
    })

    weeks.push({
      id: `${id}-W${weekNo}`,
      label: `W${weekNo}`,
      dateRange: `${formatDDMM(weekStart)}–${formatDDMM(weekEnd)}`,
      startISO: toISO(weekStart),
      phase,
      phaseName: PHASE_NAMES[phase],
      isDeload: isDeload || undefined,
      isRace: raceInWeek ? true : undefined,
      days,
    })

    weekInPhase++
  }

  return {
    id,
    name: input.name.trim() || 'Neuer Trainingsblock',
    startDate: toISO(blockStart),
    endDate: toISO(blockEnd),
    races: sortedRaces,
    weeks,
    createdAt: new Date().toISOString(),
  }
}

// ── shared helpers ──────────────────────────────────────────────────────────

export function getBlockCellIds(block: TrainingBlock): string[] {
  return block.weeks.flatMap(week => DAYS.map(day => getCellId(week.id, day)))
}

export function computeBlockProgress(block: TrainingBlock, doneCells: Set<string>) {
  const total = block.weeks.length * 7
  let done = 0
  for (const week of block.weeks) {
    for (const day of DAYS) {
      if (doneCells.has(getCellId(week.id, day))) done++
    }
  }
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return { done, total, pct }
}

export function formatBlockDateRange(block: TrainingBlock): string {
  const start = parseISO(block.startDate)
  const end = parseISO(block.endDate)
  const fmt = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}
