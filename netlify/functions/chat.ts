// GROQ_API_KEY must be set in Netlify Dashboard → Site settings → Environment variables

import { weeks, PHASE_NAMES, DAYS, DAY_LABELS } from '../../src/data/weeks'

interface SystemContext {
  username: string
  currentWeek: string
  currentDate: string
  doneCells: string[]
  editedCells: Record<string, { type?: string; title?: string; detail?: string }>
}

interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  systemContext: SystemContext
}

function buildPlanText(): string {
  const lines: string[] = []
  let lastPhase = 0
  for (const week of weeks) {
    if (week.phase !== lastPhase) {
      lastPhase = week.phase
      lines.push(`\nPhase ${week.phase} – ${PHASE_NAMES[week.phase]}:`)
    }
    const flags = [week.isDeload && 'Deload', week.isRace && 'Rennwoche'].filter(Boolean).join(', ')
    lines.push(`  ${week.id} (${week.dateRange})${flags ? ' [' + flags + ']' : ''}:`)
    for (const day of DAYS) {
      const e = week.days[day]
      const cellId = `${week.id}_${day}`
      lines.push(`    [${cellId}] ${DAY_LABELS[day]}: ${e.title}${e.detail ? ' – ' + e.detail : ''}`)
    }
  }
  return lines.join('\n')
}

const PLAN_TEXT = buildPlanText()

function buildSystemPrompt(ctx: SystemContext): string {
  const done = ctx.doneCells.length > 0 ? ctx.doneCells.join(', ') : 'keine'
  const edited =
    Object.keys(ctx.editedCells).length > 0
      ? Object.entries(ctx.editedCells)
          .map(([k, v]) => `${k}: ${v.title ?? ''}${v.detail ? ' – ' + v.detail : ''}`)
          .join(', ')
      : 'keine'

  return `Du bist ein persönlicher Trainingsassistent für ${ctx.username}.

Aktuelles Datum: ${ctx.currentDate}
Aktuelle Woche im Plan: ${ctx.currentWeek}

VOLLSTÄNDIGER TRAININGSPLAN:
${PLAN_TEXT}

AKTUELLER FORTSCHRITT:
Abgehakte Einheiten: ${done}
Angepasste Einheiten: ${edited}

Du kannst:
1. Trainingsfragen beantworten (Alternativen vorschlagen, Paces erklären, Tipps geben)
2. Den Plan direkt anpassen wenn der User das möchte

Wenn du den Plan anpassen sollst, antworte IMMER mit normalem Text UND einem JSON-Aktionsblock am Ende:

<actions>
[
  {"action": "edit_cell", "cellId": "W3_do", "text": "Gym OK – Schulter leicht", "detail": "3×10 OHP, leichtes Gewicht"},
  {"action": "toggle_done", "cellId": "W2_mo"}
]
</actions>

Aktionen die du ausführen kannst:
- edit_cell: cellId + text (neuer Titel) + optional detail
- toggle_done: cellId abhaken oder wieder öffnen

Antworte auf Deutsch, sei präzise und praktisch. Keine langen Erklärungen außer wenn gefragt.`
}

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error:
          'GROQ_API_KEY nicht konfiguriert. Bitte in Netlify Dashboard → Site settings → Environment variables hinzufügen.',
      }),
    }
  }

  let body: ChatRequest
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const systemPrompt = buildSystemPrompt(body.systemContext)

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...body.messages,
      ],
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    console.error('[chat fn] Groq error:', response.status, JSON.stringify(data))
  }

  const text: string = data.choices?.[0]?.message?.content ?? 'Keine Antwort erhalten.'
  return {
    statusCode: response.ok ? 200 : response.status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: [{ text }] }),
  }
}
