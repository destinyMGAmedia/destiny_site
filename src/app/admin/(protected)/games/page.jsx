'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Gamepad2, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react'

export default function GamesAdminPage() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/admin/games')
      const data = await res.json()
      setGames(data)
    } catch (err) {
      console.error('Failed to fetch games', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteGame = async (id) => {
    if (!confirm('Are you sure you want to delete this game?')) return
    try {
      const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setGames(prev => prev.filter(g => g.id !== id))
      }
    } catch (err) {
      alert('Failed to delete game')
    }
  }

  const filtered = games.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Bible Games Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage interactive learning games for all ages</p>
        </div>
        <Link href="/admin/games/new" className="btn-primary">
          <Plus size={18} /> New Game
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="form-input pl-9"
          placeholder="Search by title or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--ivory)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Game</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Multiplayer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Kids</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filtered.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                          {g.thumbnail ? (
                            <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Gamepad2 size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{g.title}</p>
                          {g.isFeatured && <span className="text-[10px] text-gold-600 font-bold uppercase tracking-wider">★ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="pill text-[10px] bg-purple-50 text-purple-700 font-bold uppercase tracking-wider">
                        {g.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {g.isMultiplayer ? (
                        <span className="text-green-600 flex items-center justify-center gap-1 text-xs font-bold">
                          <CheckCircle2 size={14} /> Yes ({g.maxPlayers})
                        </span>
                      ) : (
                        <span className="text-gray-300 flex items-center justify-center gap-1 text-xs">
                          <XCircle size={14} /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {g.isKidsGame ? (
                        <span className="text-blue-600 font-bold text-xs uppercase">Kids</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {g.isActive ? (
                        <span className="pill pill-success text-[10px] uppercase font-bold tracking-wider">Active</span>
                      ) : (
                        <span className="pill pill-warning text-[10px] uppercase font-bold tracking-wider">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/games/${g.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => deleteGame(g.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No games found</td>
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
