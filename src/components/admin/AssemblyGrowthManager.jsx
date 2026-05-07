'use client'
import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Users, ChevronUp, Star, Clock, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react'

const GROWTH_ORDER = [
  'NEW_COMER',
  'FOUNDATIONAL_CLASS',
  'DESTINY_CULTURE',
  'MINISTRY_CLASS',
  'LEADERSHIP_CLASS',
  'PASTORAL_CLASS',
  'ADVANCED_LEADERSHIP_2',
  'ADVANCED_LEADERSHIP_3',
]

const LEVEL_LABELS = {
  NEW_COMER: 'New Comer',
  FOUNDATIONAL_CLASS: 'Foundational Class',
  DESTINY_CULTURE: 'Destiny Culture',
  MINISTRY_CLASS: 'Ministry Class',
  LEADERSHIP_CLASS: 'Leadership Class',
  PASTORAL_CLASS: 'Pastoral Class',
  ADVANCED_LEADERSHIP_2: 'Advanced Leadership II',
  ADVANCED_LEADERSHIP_3: 'Advanced Leadership III',
}

// Assembly admins can directly promote up to MINISTRY_CLASS (index 3)
const DIRECT_MAX_IDX = 3

function getLevelBadgeStyle(level) {
  const idx = GROWTH_ORDER.indexOf(level)
  if (idx <= 0) return { background: 'var(--purple-50)', color: 'var(--purple-700)' }
  if (idx <= 1) return { background: '#e0f2fe', color: '#0369a1' }
  if (idx <= 2) return { background: '#dcfce7', color: '#15803d' }
  if (idx <= 3) return { background: '#fef9c3', color: '#854d0e' }
  return { background: 'var(--gold-100)', color: '#7a5100' }
}

function PromoteModal({ member, isGlobal, onClose, onSuccess }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fromIdx = GROWTH_ORDER.indexOf(member.growthLevel)
  const toIdx = fromIdx + 1
  const toLevel = GROWTH_ORDER[toIdx]
  const isLastLevel = toIdx >= GROWTH_ORDER.length
  const needsRecommendation = !isGlobal && toIdx > DIRECT_MAX_IDX
  const hasPendingRec = member.promotionRecs?.length > 0

  if (isLastLevel) return null

  const action = needsRecommendation ? 'RECOMMEND' : 'PROMOTE'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/assemblies/${member._assemblySlug}/growth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, memberId: member.id, toLevel, notes })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="card p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--purple-900)', fontFamily: 'var(--font-serif)' }}>
          {needsRecommendation ? 'Recommend for Promotion' : 'Promote Member'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {member.firstName} {member.lastName} &rarr; <strong>{LEVEL_LABELS[toLevel]}</strong>
        </p>

        {hasPendingRec && !isGlobal && (
          <div className="p-3 rounded-lg mb-4 flex items-center gap-2 text-sm" style={{ background: '#fef9c3', color: '#854d0e' }}>
            <Clock size={15} />
            A recommendation is already pending for this member.
          </div>
        )}

        {needsRecommendation && (
          <div className="p-3 rounded-lg mb-4 text-sm" style={{ background: 'var(--purple-50)', color: 'var(--purple-800)' }}>
            Promotions to <strong>{LEVEL_LABELS[toLevel]}</strong> require approval from a Global Admin.
            Your recommendation will be reviewed before the member is promoted.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">
              {needsRecommendation ? 'Reason for Recommendation' : 'Notes (optional)'}
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder={needsRecommendation ? 'Why is this member ready for promotion?' : 'Any notes about this promotion...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required={needsRecommendation}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 justify-center">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (hasPendingRec && !isGlobal)}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? 'Processing...' : needsRecommendation ? 'Submit Recommendation' : 'Confirm Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AssemblyGrowthManager({ assemblySlug, assemblyName, isGlobal }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('ALL')
  const [promoting, setPromoting] = useState(null) // member being promoted
  const [toast, setToast] = useState(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/assemblies/${assemblySlug}/growth`)
      const data = await res.json()
      // Inject assemblySlug into each member for the promote modal
      setMembers((data.members || []).map(m => ({ ...m, _assemblySlug: assemblySlug })))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [assemblySlug])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleSuccess(data) {
    setPromoting(null)
    fetchMembers()
    if (data.action === 'PROMOTED') showToast(`Member promoted to ${LEVEL_LABELS[data.toLevel]}!`)
    else if (data.action === 'RECOMMENDED') showToast('Recommendation submitted for global admin approval.')
  }

  const filtered = members.filter(m => {
    const name = `${m.firstName} ${m.lastName}`.toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase())
    const matchLevel = filterLevel === 'ALL' || m.growthLevel === filterLevel
    return matchSearch && matchLevel
  })

  const levelCounts = GROWTH_ORDER.reduce((acc, l) => {
    acc[l] = members.filter(m => m.growthLevel === l).length
    return acc
  }, {})

  return (
    <div className="p-6">
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
          style={{ background: toast.type === 'success' ? '#dcfce7' : '#fee2e2', color: toast.type === 'success' ? '#15803d' : '#b91c1c' }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {promoting && (
        <PromoteModal
          member={promoting}
          isGlobal={isGlobal}
          onClose={() => setPromoting(null)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Growth Track — {assemblyName}
        </h1>
        <p className="text-sm text-gray-500">
          {isGlobal
            ? 'Manage member progression across all growth levels.'
            : 'Manage member progression up to Ministry Class. Recommend members for higher levels.'}
        </p>
      </div>

      {/* Level summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {GROWTH_ORDER.map(level => (
          <button
            key={level}
            onClick={() => setFilterLevel(prev => prev === level ? 'ALL' : level)}
            className={`p-3 rounded-xl border text-left transition-all ${filterLevel === level ? 'ring-2' : ''}`}
            style={{
              borderColor: filterLevel === level ? 'var(--purple-400)' : '#e5e7eb',
              background: filterLevel === level ? 'var(--purple-50)' : 'white',
              ringColor: 'var(--purple-400)'
            }}
          >
            <p className="text-xs text-gray-500 truncate">{LEVEL_LABELS[level]}</p>
            <p className="text-xl font-bold mt-1" style={{ color: 'var(--purple-900)' }}>{levelCounts[level] || 0}</p>
          </button>
        ))}
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-input pl-9"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value)}
          style={{ maxWidth: 220 }}
        >
          <option value="ALL">All Levels</option>
          {GROWTH_ORDER.map(l => (
            <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading members...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No members found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--purple-50)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--purple-800)' }}>Member</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--purple-800)' }}>Current Level</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--purple-800)' }}>Stage Progress</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--purple-800)' }}>Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(member => {
                const fromIdx = GROWTH_ORDER.indexOf(member.growthLevel)
                const toIdx = fromIdx + 1
                const toLevel = GROWTH_ORDER[toIdx]
                const isLastLevel = toIdx >= GROWTH_ORDER.length
                const needsRec = !isGlobal && toIdx > DIRECT_MAX_IDX
                const hasPendingRec = member.promotionRecs?.length > 0

                // Current stage progress
                const currentProgress = member.progress?.find(p => p.stage?.level === member.growthLevel)
                const totalLessons = currentProgress?.stage?.contents?.length || 0
                const completedLessons = Array.isArray(currentProgress?.completedContents)
                  ? currentProgress.completedContents.length
                  : 0
                const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
                const stageCompleted = currentProgress?.status === 'COMPLETED'

                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                      <p className="text-xs text-gray-400">{member.email || member.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={getLevelBadgeStyle(member.growthLevel)}
                      >
                        {LEVEL_LABELS[member.growthLevel]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {totalLessons > 0 ? (
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{stageCompleted ? 'Completed' : `${completedLessons}/${totalLessons} lessons`}</span>
                            {currentProgress?.testScore != null && (
                              <span>Score: {Math.round(currentProgress.testScore)}%</span>
                            )}
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${stageCompleted ? 100 : pct}%`,
                                background: stageCompleted ? '#16a34a' : 'var(--purple-600)'
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {hasPendingRec ? (
                        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#854d0e' }}>
                          <Clock size={13} /> Pending Approval
                        </span>
                      ) : stageCompleted ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle size={13} /> Stage Complete
                        </span>
                      ) : currentProgress ? (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <AlertCircle size={13} /> In Progress
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not Started</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isLastLevel && (
                        <button
                          onClick={() => setPromoting(member)}
                          disabled={hasPendingRec && !isGlobal}
                          className={`btn-sm flex items-center gap-1 ${needsRec ? 'btn-outline' : 'btn-primary'}`}
                          title={needsRec ? `Recommend for ${LEVEL_LABELS[toLevel]}` : `Promote to ${LEVEL_LABELS[toLevel]}`}
                        >
                          {needsRec ? (
                            <><Star size={13} /> Recommend</>
                          ) : (
                            <><ChevronUp size={13} /> Promote</>
                          )}
                        </button>
                      )}
                      {isLastLevel && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Star size={13} /> Highest Level
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend for assembly admins */}
      {!isGlobal && (
        <div className="mt-4 p-3 rounded-xl text-xs text-gray-500 flex items-center gap-3" style={{ background: 'var(--purple-50)' }}>
          <ChevronUp size={13} style={{ color: 'var(--purple-700)' }} />
          <span><strong>Promote</strong> — directly advances up to Ministry Class</span>
          <Star size={13} style={{ color: '#854d0e' }} />
          <span><strong>Recommend</strong> — submits to Global Admin for approval (Leadership Class and above)</span>
        </div>
      )}
    </div>
  )
}
