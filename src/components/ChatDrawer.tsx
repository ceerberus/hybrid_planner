import { useEffect, useRef, useState } from 'react'
import { useChat } from '../hooks/useChat'
import type { PlanAction } from '../types'

function formatAction(a: PlanAction): string {
  if (a.action === 'edit_cell') return `${a.cellId} → "${a.text ?? ''}"`
  return `${a.cellId} abhaken / öffnen`
}

function LoadingDots() {
  return (
    <span className="flex gap-1 items-center py-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}

export default function ChatDrawer() {
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { messages, isLoading, sendMessage, confirmActions, dismissActions } = useChat()

  useEffect(() => {
    if (open) {
      setHasOpened(true)
      setTimeout(() => textareaRef.current?.focus(), 320)
    }
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="KI Assistent öffnen"
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/25 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
          open ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {!hasOpened && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
        )}
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-700/60 flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3.5 border-b border-gray-200 dark:border-zinc-700/60 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">KI Assistent</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Frag mich zu deinem Plan</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Schließen"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-8">
              <span className="text-4xl">🏃</span>
              <p className="text-sm text-gray-500 dark:text-zinc-400">Stell mir eine Frage zu deinem Trainingsplan</p>
              <div className="flex flex-col gap-1.5 mt-1">
                {[
                  'Was soll ich heute machen?',
                  'Ich hab nur 30 Minuten heute',
                  'Meine Beine sind müde – anpassen?',
                ].map(hint => (
                  <button
                    key={hint}
                    onClick={() => { setInput(hint); textareaRef.current?.focus() }}
                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-600 dark:text-zinc-400 rounded-full transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.pendingActions && (
                <div className="mt-2 w-[90%] border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-3 bg-indigo-50/70 dark:bg-indigo-950/20">
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                    📋 {msg.pendingActions.length} Änderung{msg.pendingActions.length !== 1 ? 'en' : ''} vorgeschlagen
                  </p>
                  <ul className="space-y-1 mb-3">
                    {msg.pendingActions.map((a, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-zinc-300 flex items-start gap-1.5">
                        <span className="text-indigo-400 flex-shrink-0 mt-px">•</span>
                        <span>{formatAction(a)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmActions(msg.id)}
                      className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                    >
                      Übernehmen
                    </button>
                    <button
                      onClick={() => dismissActions(msg.id)}
                      className="px-3 py-1.5 text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors"
                    >
                      Ignorieren
                    </button>
                  </div>
                </div>
              )}

              {msg.actionsApplied && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Änderungen übernommen
                </p>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-gray-100 dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                <LoadingDots />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 pb-5 pt-3 border-t border-gray-200 dark:border-zinc-700/60">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht…"
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none px-3 py-2.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all overflow-hidden disabled:opacity-50"
              style={{ height: '40px', minHeight: '40px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Senden"
              className="flex-shrink-0 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-200 dark:disabled:bg-zinc-700 text-white disabled:text-gray-400 dark:disabled:text-zinc-500 rounded-xl flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-zinc-600 mt-1.5">Enter senden · Shift+Enter neue Zeile</p>
        </div>
      </div>
    </>
  )
}
