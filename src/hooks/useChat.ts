import { useCallback, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { getCurrentWeekId } from '../data/weeks'
import type { PlanAction } from '../types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  pendingActions?: PlanAction[]
  actionsApplied?: boolean
}

function parseActions(raw: string): { text: string; actions: PlanAction[] | null } {
  const match = raw.match(/<actions>([\s\S]*?)<\/actions>/)
  if (!match) return { text: raw.trim(), actions: null }
  const text = raw.replace(/<actions>[\s\S]*?<\/actions>/, '').trim()
  try {
    return { text, actions: JSON.parse(match[1].trim()) as PlanAction[] }
  } catch {
    return { text: raw.trim(), actions: null }
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  // ref so sendMessage never has a stale closure on messages
  const messagesRef = useRef<ChatMessage[]>([])
  messagesRef.current = messages

  const username = useStore(s => s.username)
  const doneCells = useStore(s => s.doneCells)
  const editedCells = useStore(s => s.editedCells)
  const applyActions = useStore(s => s.applyActions)

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
      const history = [...messagesRef.current, userMsg]
      setMessages(history)
      setIsLoading(true)

      try {
        const res = await fetch('/.netlify/functions/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history.map(m => ({ role: m.role, content: m.content })),
            systemContext: {
              username: username ?? 'Anonym',
              currentWeek: getCurrentWeekId(),
              currentDate: new Date().toLocaleDateString('de-DE'),
              doneCells: Array.from(doneCells),
              editedCells,
            },
          }),
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const rawText: string = data.content?.[0]?.text ?? 'Keine Antwort erhalten.'
        const { text: cleanText, actions } = parseActions(rawText)

        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: cleanText,
            pendingActions: actions ?? undefined,
          },
        ])
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err)
        console.error('[useChat] sendMessage error:', err)
        setMessages(prev => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: `Fehler: ${detail}` },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [username, doneCells, editedCells]
  )

  const confirmActions = useCallback(
    (messageId: string) => {
      const msg = messagesRef.current.find(m => m.id === messageId)
      if (msg?.pendingActions) applyActions(msg.pendingActions)
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, actionsApplied: true, pendingActions: undefined } : m))
      )
    },
    [applyActions]
  )

  const dismissActions = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, pendingActions: undefined } : m))
    )
  }, [])

  return { messages, isLoading, sendMessage, confirmActions, dismissActions }
}
