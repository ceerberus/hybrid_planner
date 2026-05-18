import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function WelcomeScreen() {
  const [name, setName] = useState('')
  const setUsername = useStore(s => s.setUsername)
  const loadFromRemote = useStore(s => s.loadFromRemote)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setUsername(trimmed)
    loadFromRemote(trimmed)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl dark:shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Hybrid Planner
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                Dein Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="z.B. Eiche"
                autoFocus
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Loslegen →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
