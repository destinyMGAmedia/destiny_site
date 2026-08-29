'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Check, X, Users, Eye, EyeOff, GripVertical } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'

function LeaderForm({ leader = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    name: leader.name || '',
    title: leader.title || '',
    bio: leader.bio || '',
    photo: leader.photo || '',
    displayOrder: leader.displayOrder ?? 0,
    isActive: leader.isActive !== false,
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: typeof e === 'object' && 'target' in e ? e.target.value : e }))
  const isNew = !leader.id

  return (
    <div className="border-2 rounded-2xl p-5 space-y-4" style={{ borderColor: 'var(--purple-200)', background: 'var(--ivory)' }}>
      <h3 className="font-semibold text-sm" style={{ color: 'var(--purple-900)' }}>
        {isNew ? 'Add New Global Leader' : `Edit — ${leader.name}`}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name *</label>
          <input
            className="form-input"
            value={form.name}
            onChange={set('name')}
            placeholder="Archbishop John Doe"
            required
          />
        </div>
        <div>
          <label className="form-label">Title / Designation *</label>
          <input
            className="form-input"
            value={form.title}
            onChange={set('title')}
            placeholder="Primate / Global Administrator"
            required
          />
        </div>
        <div>
          <label className="form-label">Display Order</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={form.displayOrder}
            onChange={set('displayOrder')}
          />
          <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <button
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${form.isActive ? 'bg-purple-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {form.isActive ? 'Visible on About page' : 'Hidden from About page'}
          </span>
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Bio (optional)</label>
          <textarea
            className="form-input"
            rows={3}
            value={form.bio}
            onChange={set('bio')}
            placeholder="A brief description of this leader's role and ministry..."
          />
        </div>
      </div>

      <ImageUploader
        label="Photo"
        value={form.photo}
        assemblySlug="global"
        category="leadership"
        aspectHint="portrait recommended"
        onUpload={(url) => setForm(f => ({ ...f, photo: url }))}
        onClear={() => setForm(f => ({ ...f, photo: '' }))}
      />

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.name.trim() || !form.title.trim()}
          className="btn-primary btn-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={13} />}
          {saving ? 'Saving…' : 'Save Leader'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline btn-sm">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  )
}

function LeaderRow({ leader, onEdit, onDelete, onToggle }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-white" style={{ borderColor: 'var(--border)' }}>
      <GripVertical size={14} className="text-gray-300 shrink-0" />
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative bg-purple-100">
        {leader.photo ? (
          <Image src={leader.photo} alt={leader.name} fill sizes="40px" className="object-cover object-top" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--purple-800)', color: 'var(--gold-400)' }}>
            {leader.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{leader.name}</p>
        <p className="text-xs text-gray-500 truncate">{leader.title}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${leader.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
          {leader.isActive ? 'Visible' : 'Hidden'}
        </span>
        <button
          onClick={() => onToggle(leader)}
          className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-400"
          title={leader.isActive ? 'Hide from About page' : 'Show on About page'}
        >
          {leader.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        <button onClick={() => onEdit(leader)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(leader)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function GlobalLeadersPage() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null) // null | 'new' | leader.id
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchLeaders() }, [])

  const fetchLeaders = async () => {
    try {
      const res = await fetch('/api/admin/global-leaders')
      const data = await res.json()
      setLeaders(Array.isArray(data) ? data : [])
    } catch {
      setLeaders([])
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const isNew = editingId === 'new'
      const res = await fetch(
        isNew ? '/api/admin/global-leaders' : `/api/admin/global-leaders/${editingId}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (isNew) {
        setLeaders(prev => [...prev, data])
      } else {
        setLeaders(prev => prev.map(l => l.id === editingId ? data : l))
      }
      setEditingId(null)
      showToast(isNew ? 'Leader added.' : 'Leader updated.')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (leader) => {
    if (!confirm(`Remove ${leader.name} from the About page?`)) return
    try {
      const res = await fetch(`/api/admin/global-leaders/${leader.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setLeaders(prev => prev.filter(l => l.id !== leader.id))
      showToast('Leader removed.')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleToggle = async (leader) => {
    try {
      const res = await fetch(`/api/admin/global-leaders/${leader.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !leader.isActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLeaders(prev => prev.map(l => l.id === leader.id ? data : l))
      showToast(data.isActive ? 'Leader is now visible on the About page.' : 'Leader hidden from About page.')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="space-y-6 fade-in p-8 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
          style={{
            background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: toast.type === 'success' ? '#15803d' : '#b91c1c',
          }}
        >
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Global Leaders
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage the global officers shown on the public About page. Changes are reflected immediately.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border rounded-2xl px-4 py-3" style={{ borderColor: 'var(--border)' }}>
          <Users size={16} className="text-purple-500" />
          <span className="text-2xl font-bold" style={{ color: 'var(--purple-900)' }}>{leaders.length}</span>
          <span className="text-xs text-gray-400">leaders</span>
        </div>
      </div>

      {/* Note */}
      <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--purple-50)', color: 'var(--purple-800)' }}>
        <strong>Note:</strong> Only active leaders appear on the public About page. Changes are reflected within 5 minutes.
      </div>

      {/* Leaders list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading leaders...</div>
        ) : (
          <div className="p-4 space-y-2">
            {leaders.map(leader =>
              editingId === leader.id ? (
                <LeaderForm
                  key={leader.id}
                  leader={leader}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <LeaderRow
                  key={leader.id}
                  leader={leader}
                  onEdit={(l) => setEditingId(l.id)}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              )
            )}

            {leaders.length === 0 && editingId !== 'new' && (
              <p className="text-center text-sm text-gray-400 py-8">
                No leaders added yet. Click &quot;Add Leader&quot; to get started.
              </p>
            )}

            {editingId === 'new' ? (
              <LeaderForm
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
                saving={saving}
              />
            ) : (
              <button
                onClick={() => setEditingId('new')}
                className="btn-outline w-full justify-center mt-2"
              >
                <Plus size={14} /> Add Leader
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
