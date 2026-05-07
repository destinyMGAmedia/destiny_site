'use client'
import { useState, useEffect, useCallback } from 'react'
import { Star, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react'

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

function ResolveModal({ rec, onClose, onSuccess }) {
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleResolve(status) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/growth/recommendations/${rec.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      onSuccess(status)
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
          Review Recommendation
        </h3>
        <div className="p-3 rounded-lg mb-4 text-sm bg-gray-50">
          <p className="font-medium text-gray-900">{rec.member.firstName} {rec.member.lastName}</p>
          <p className="text-gray-500 text-xs">{rec.assembly.name}</p>
          <p className="mt-1 text-gray-700">
            {LEVEL_LABELS[rec.fromLevel]} &rarr; <strong>{LEVEL_LABELS[rec.toLevel]}</strong>
          </p>
          {rec.notes && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Assembly Admin Notes</p>
              <p className="text-gray-700">{rec.notes}</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label">Your Response / Feedback (optional)</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Add any notes for the assembly admin..."
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn-outline flex-1 justify-center" disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleResolve('REJECTED')}
            disabled={loading}
            className="flex-1 btn-sm justify-center flex items-center gap-1 rounded-lg px-4 py-2 font-medium border"
            style={{ background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
          >
            <XCircle size={15} /> Reject
          </button>
          <button
            type="button"
            onClick={() => handleResolve('APPROVED')}
            disabled={loading}
            className="flex-1 btn-primary btn-sm justify-center flex items-center gap-1"
          >
            <CheckCircle size={15} /> Approve
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PromotionRecommendations() {
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [resolving, setResolving] = useState(null)
  const [toast, setToast] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  const fetchRecs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/growth/recommendations?status=${filter}`)
      const data = await res.json()
      setRecs(data.recommendations || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchRecs() }, [fetchRecs])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleSuccess(status) {
    setResolving(null)
    fetchRecs()
    showToast(status === 'APPROVED' ? 'Member promoted successfully!' : 'Recommendation rejected.')
  }

  const pendingCount = recs.filter(r => r.status === 'PENDING').length

  return (
    <div className="card overflow-hidden">
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
          style={{ background: toast.type === 'success' ? '#dcfce7' : '#fee2e2', color: toast.type === 'success' ? '#15803d' : '#b91c1c' }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {resolving && (
        <ResolveModal
          rec={resolving}
          onClose={() => setResolving(null)}
          onSuccess={handleSuccess}
        />
      )}

      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        style={{ borderBottom: collapsed ? 'none' : '1px solid var(--border)' }}
        onClick={() => setCollapsed(p => !p)}
      >
        <div className="flex items-center gap-3">
          <Star size={18} style={{ color: 'var(--gold-600)' }} />
          <div>
            <h2 className="font-bold" style={{ color: 'var(--purple-900)' }}>Promotion Recommendations</h2>
            <p className="text-xs text-gray-500">Assembly admins recommend members for advanced levels</p>
          </div>
          {pendingCount > 0 && filter === 'PENDING' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--gold-100)', color: '#7a5100' }}>
              {pendingCount} pending
            </span>
          )}
        </div>
        <ChevronDown
          size={18}
          className="text-gray-400 transition-transform"
          style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
        />
      </div>

      {!collapsed && (
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter === s ? 'border-transparent' : 'border-gray-200 bg-white text-gray-600'}`}
                style={filter === s ? { background: 'var(--purple-700)', color: 'white' } : {}}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 py-6 text-center">Loading...</p>
          ) : recs.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              {filter === 'PENDING' ? 'No pending recommendations.' : 'No recommendations found.'}
            </p>
          ) : (
            <div className="space-y-3">
              {recs.map(rec => (
                <div key={rec.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{rec.member.firstName} {rec.member.lastName}</p>
                      <p className="text-xs text-gray-500">{rec.assembly.name}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="text-gray-400">{LEVEL_LABELS[rec.fromLevel]}</span>
                        {' → '}
                        <strong style={{ color: 'var(--purple-800)' }}>{LEVEL_LABELS[rec.toLevel]}</strong>
                      </p>
                      {rec.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic">"{rec.notes}"</p>
                      )}
                      {rec.adminNotes && (
                        <p className="text-xs mt-1" style={{ color: 'var(--purple-700)' }}>Admin: {rec.adminNotes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                        style={
                          rec.status === 'PENDING' ? { background: '#fef9c3', color: '#854d0e' } :
                          rec.status === 'APPROVED' ? { background: '#dcfce7', color: '#15803d' } :
                          { background: '#fee2e2', color: '#b91c1c' }
                        }
                      >
                        {rec.status === 'PENDING' && <Clock size={11} />}
                        {rec.status === 'APPROVED' && <CheckCircle size={11} />}
                        {rec.status === 'REJECTED' && <XCircle size={11} />}
                        {rec.status.charAt(0) + rec.status.slice(1).toLowerCase()}
                      </span>
                      {rec.status === 'PENDING' && (
                        <button
                          onClick={() => setResolving(rec)}
                          className="btn-primary btn-sm"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted {new Date(rec.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {rec.resolvedAt && ` · Resolved ${new Date(rec.resolvedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
