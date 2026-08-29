'use client'
import { useState, useEffect } from 'react'
import { Search, Gamepad2, Settings, X, Users, Star, EyeOff, Eye, CheckCircle2, Plus, Trash2 } from 'lucide-react'

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-purple-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function WordManager({ words, onChange }) {
  const [input, setInput] = useState('')
  const [csvMode, setCsvMode] = useState(false)
  const [csvText, setCsvText] = useState('')
  const current = Array.isArray(words) ? words : []

  const addWord = () => {
    const word = input.trim().toUpperCase().replace(/[^A-Z]/g, '')
    if (!word || current.includes(word)) { setInput(''); return }
    onChange([...current, word])
    setInput('')
  }

  const removeWord = (word) => onChange(current.filter(w => w !== word))

  const applyCSV = () => {
    const parsed = csvText
      .split(/[,\n\r]+/)
      .map(w => w.trim().toUpperCase().replace(/[^A-Z]/g, ''))
      .filter(Boolean)
    onChange([...new Set([...current, ...parsed])])
    setCsvText('')
    setCsvMode(false)
  }

  return (
    <div className="space-y-3">
      {current.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-lg min-h-[56px] max-h-[160px] overflow-y-auto">
          {current.map(word => (
            <span key={word} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
              {word}
              <button type="button" onClick={() => removeWord(word)} className="text-purple-400 hover:text-red-500 transition-colors leading-none ml-0.5">×</button>
            </span>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-gray-50 rounded-lg text-center text-xs text-gray-400 italic">
          {words === null ? 'Using default word list — add words below to override' : 'No custom words yet'}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addWord() } }}
          placeholder="Type a word and press Enter or Add..."
          className="form-input flex-1 text-sm"
        />
        <button type="button" onClick={addWord} className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
          <Plus size={14} /> Add
        </button>
      </div>

      <div>
        <button type="button" onClick={() => setCsvMode(v => !v)} className="text-xs text-purple-600 hover:underline">
          {csvMode ? '▲ Hide CSV paste' : '▼ Paste multiple words (CSV / one per line)'}
        </button>
        {csvMode && (
          <div className="mt-2 space-y-2">
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="e.g. FAITH, HOPE, LOVE  or one word per line"
              className="form-input text-sm"
              rows={3}
            />
            <button type="button" onClick={applyCSV} className="text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors">Apply</button>
          </div>
        )}
      </div>

      {current.length > 0 && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} /> Reset to default word list
        </button>
      )}
    </div>
  )
}

function SettingsModal({ game, onClose, onSave }) {
  const isWordSearch = game.gameData?.component === 'BibleWordSearch'

  const [form, setForm] = useState({
    isActive: game.isActive,
    isFeatured: game.isFeatured,
    isKidsGame: game.isKidsGame,
    isMultiplayer: game.isMultiplayer,
    maxPlayers: game.maxPlayers ?? 2,
    description: game.description ?? '',
    instructions: game.instructions ?? '',
    words: isWordSearch ? (game.gameData?.words ?? null) : undefined,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }))
  const setVal = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/games/${game.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      onSave(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--purple-900)', fontFamily: 'var(--font-serif)' }}>
              Configure Game
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{game.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Visibility & Featured */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Visibility</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Show to Players</p>
                  <p className="text-xs text-gray-500">When off, this game is hidden on the public games page</p>
                </div>
                <Toggle checked={form.isActive} onChange={set('isActive')} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Featured Game</p>
                  <p className="text-xs text-gray-500">Highlighted at the top of the games list</p>
                </div>
                <Toggle checked={form.isFeatured} onChange={set('isFeatured')} />
              </div>
            </div>
          </div>

          {/* Audience */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Audience</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Kids-Friendly</p>
                  <p className="text-xs text-gray-500">Tags this game for children — shown in the Kids section</p>
                </div>
                <Toggle checked={form.isKidsGame} onChange={set('isKidsGame')} />
              </div>
            </div>
          </div>

          {/* Multiplayer */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Multiplayer</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable Multiplayer Mode</p>
                  <p className="text-xs text-gray-500">Allow players to join rooms and play together</p>
                </div>
                <Toggle checked={form.isMultiplayer} onChange={set('isMultiplayer')} />
              </div>
              {form.isMultiplayer && (
                <div>
                  <label className="form-label">Max Players per Room</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    className="form-input max-w-[120px]"
                    value={form.maxPlayers}
                    onChange={(e) => setForm(f => ({ ...f, maxPlayers: parseInt(e.target.value) || 2 }))}
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum 2, maximum 20</p>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Display Content</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Short description shown to players before they start..."
                  value={form.description}
                  onChange={setVal('description')}
                />
              </div>
              <div>
                <label className="form-label">How to Play (Instructions)</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Step-by-step instructions shown in the game..."
                  value={form.instructions}
                  onChange={setVal('instructions')}
                />
              </div>
            </div>
          </div>

          {/* Word List — only for the crossword/word-search game */}
          {isWordSearch && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Word List</h3>
              <p className="text-xs text-gray-500 mb-3">
                Customize the words players must find. Leave empty to use the built-in default list ({game.title}).
              </p>
              <WordManager
                words={form.words}
                onChange={(w) => setForm(f => ({ ...f, words: w }))}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function GamesAdminPage() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [configuringGame, setConfiguringGame] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchGames() }, [])

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/admin/games')
      const data = await res.json()
      setGames(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch games', err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const patchGame = async (id, patch) => {
    setToggling(id)
    try {
      const res = await fetch(`/api/admin/games/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setGames(prev => prev.map(g => g.id === id ? { ...g, ...data } : g))
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setToggling(null)
    }
  }

  const handleModalSave = (updated) => {
    setGames(prev => prev.map(g => g.id === updated.id ? { ...g, ...updated } : g))
    setConfiguringGame(null)
    showToast('Game settings saved.')
  }

  const filtered = games.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.type.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: games.length,
    active: games.filter(g => g.isActive).length,
    featured: games.filter(g => g.isFeatured).length,
    multiplayer: games.filter(g => g.isMultiplayer).length,
  }

  return (
    <div className="space-y-6 fade-in p-8 max-w-5xl">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
          style={{
            background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: toast.type === 'success' ? '#15803d' : '#b91c1c',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Settings modal */}
      {configuringGame && (
        <SettingsModal
          game={configuringGame}
          onClose={() => setConfiguringGame(null)}
          onSave={handleModalSave}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Bible Games
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Configure visibility, audience, and settings for each game. Games are built-in — enable or disable them as needed.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Games', value: stats.total, icon: <Gamepad2 size={20} className="text-purple-500" /> },
          { label: 'Live (Visible)', value: stats.active, icon: <Eye size={20} className="text-green-500" /> },
          { label: 'Featured', value: stats.featured, icon: <Star size={20} className="text-yellow-500" /> },
          { label: 'Multiplayer', value: stats.multiplayer, icon: <Users size={20} className="text-blue-500" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold mt-0.5">{value}</p>
            </div>
            {icon}
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="form-input pl-9"
          placeholder="Search games..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Games list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading games...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--ivory)' }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Game</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Visible</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Featured</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Kids</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Multiplayer</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filtered.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {g.thumbnail ? (
                            <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover" />
                          ) : (
                            <Gamepad2 size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{g.title}</p>
                            {!g.isActive && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                <EyeOff size={10} /> Hidden
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                            {g.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Visible toggle */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={g.isActive}
                          disabled={toggling === g.id}
                          onChange={(val) => patchGame(g.id, { isActive: val })}
                        />
                      </div>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={g.isFeatured}
                          disabled={toggling === g.id}
                          onChange={(val) => patchGame(g.id, { isFeatured: val })}
                        />
                      </div>
                    </td>

                    {/* Kids toggle */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={g.isKidsGame}
                          disabled={toggling === g.id}
                          onChange={(val) => patchGame(g.id, { isKidsGame: val })}
                        />
                      </div>
                    </td>

                    {/* Multiplayer info */}
                    <td className="px-5 py-4 text-center">
                      {g.isMultiplayer ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                          <Users size={13} /> {g.maxPlayers}p
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    {/* Configure */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setConfiguringGame(g)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-purple-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-50"
                      >
                        <Settings size={14} />
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      {games.length === 0 ? 'No games found in the database.' : 'No games match your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
