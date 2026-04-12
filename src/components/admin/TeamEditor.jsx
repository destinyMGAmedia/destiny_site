'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import ImageUploader from './ImageUploader'

const DEPARTMENTS = [
  'PASTORS', 'CHOIR', 'SANCTUARY_KEEPERS', 'PROTOCOL',
  'MEDIA_TECHNICAL', 'CREATIVE_ARTS', 'EVANGELISM', 'PRAYER', 'FACILITY',
]

const FELLOWSHIPS = [
  'KINGS_MEN', 'DESTINY_PRESERVERS', 'DESTINY_DEFENDERS', 'DESTINY_TREASURES',
]

function MemberForm({ member = {}, assemblySlug, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: member.name || '',
    role: member.role || '',
    bio: member.bio || '',
    photo: member.photo || '',
    category: member.category || 'DEPARTMENT',
    department: member.department || 'PASTORS',
    fellowship: member.fellowship || '',
    displayOrder: member.displayOrder ?? 0,
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="border rounded-xl p-5 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--ivory)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Pastor John Doe" />
        </div>
        <div>
          <label className="form-label">Role / Title *</label>
          <input className="form-input" value={form.role} onChange={set('role')} required placeholder="Senior Pastor" />
        </div>
        <div>
          <label className="form-label">Category</label>
          <select className="form-input" value={form.category} onChange={set('category')}>
            <option value="DEPARTMENT">Department</option>
            <option value="FELLOWSHIP">Fellowship</option>
          </select>
        </div>
        {form.category === 'DEPARTMENT' ? (
          <div>
            <label className="form-label">Department</label>
            <select className="form-input" value={form.department || ''} onChange={set('department')}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className="form-label">Fellowship</label>
            <select className="form-input" value={form.fellowship || ''} onChange={set('fellowship')}>
              {FELLOWSHIPS.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="form-label">Display Order</label>
          <input className="form-input" type="number" min={0} value={form.displayOrder} onChange={set('displayOrder')} />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Bio (optional)</label>
          <textarea className="form-input" rows={2} value={form.bio} onChange={set('bio')} placeholder="Short bio..." />
        </div>
      </div>

      <ImageUploader
        label="Photo"
        value={form.photo}
        assemblySlug={assemblySlug}
        category="team"
        aspectHint="square preferred"
        onUpload={(url) => setForm(f => ({ ...f, photo: url }))}
        onClear={() => setForm(f => ({ ...f, photo: '' }))}
      />

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={() => onSave(form)} className="btn-primary btn-sm">
          <Check size={13} /> Save Member
        </button>
        <button type="button" onClick={onCancel} className="btn-outline btn-sm">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  )
}

export default function TeamEditor({ assembly, initialMembers }) {
  const [members, setMembers] = useState(initialMembers || [])
  const [editingId, setEditingId] = useState(null) // null = no edit, 'new' = adding new
  const [saving, setSaving] = useState(false)

  const pastors = members.filter(m => m.category === 'DEPARTMENT' && m.department === 'PASTORS')
  const others = members.filter(m => !(m.category === 'DEPARTMENT' && m.department === 'PASTORS'))

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editingId === 'new') {
        const payload = {
          ...form,
          assemblyId: assembly.id,
          fellowship: form.category === 'FELLOWSHIP' ? (form.fellowship || null) : null,
          department: form.category === 'DEPARTMENT' ? (form.department || null) : null,
          photo: form.photo || null,
          displayOrder: parseInt(form.displayOrder) || 0,
        }
        const res = await fetch('/api/admin/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to save')
        const created = await res.json()
        setMembers(prev => [...prev, created])
      } else {
        const res = await fetch(`/api/admin/team/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Failed to save')
        const updated = await res.json()
        setMembers(prev => prev.map(m => m.id === editingId ? updated : m))
      }
      setEditingId(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this team member?')) return
    const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' })
    if (res.ok) setMembers(prev => prev.filter(m => m.id !== id))
  }

  const MemberRow = ({ m }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'white' }}>
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-purple-100 relative">
        {m.photo ? (
          <Image src={m.photo} alt={m.name} fill sizes="40px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--purple-800)', color: 'var(--gold-400)' }}>
            {m.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{m.name}</p>
        <p className="text-xs text-gray-500 truncate">{m.role}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => setEditingId(m.id)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600">
          <Pencil size={13} />
        </button>
        <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Pastors */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Pastors</p>
        <div className="space-y-2">
          {pastors.map(m => (
            editingId === m.id ? (
              <MemberForm key={m.id} member={m} assemblySlug={assembly.slug} onSave={handleSave} onCancel={() => setEditingId(null)} />
            ) : (
              <MemberRow key={m.id} m={m} />
            )
          ))}
          {pastors.length === 0 && <p className="text-xs text-gray-400">No pastors added yet.</p>}
        </div>
      </div>

      {/* Others */}
      {others.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Other Members</p>
          <div className="space-y-2">
            {others.map(m => (
              editingId === m.id ? (
                <MemberForm key={m.id} member={m} assemblySlug={assembly.slug} onSave={handleSave} onCancel={() => setEditingId(null)} />
              ) : (
                <MemberRow key={m.id} m={m} />
              )
            ))}
          </div>
        </div>
      )}

      {/* Add new */}
      {editingId === 'new' ? (
        <MemberForm assemblySlug={assembly.slug} onSave={handleSave} onCancel={() => setEditingId(null)} />
      ) : (
        <button
          type="button"
          onClick={() => setEditingId('new')}
          className="btn-outline w-full justify-center"
        >
          <Plus size={14} /> Add Team Member
        </button>
      )}
    </div>
  )
}
