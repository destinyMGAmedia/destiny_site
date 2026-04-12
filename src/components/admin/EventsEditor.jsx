'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Calendar } from 'lucide-react'
import ImageUploader from './ImageUploader'

function EventForm({ event = {}, assemblyId, assemblySlug, onSave, onCancel }) {
  const toDateInput = (d) => d ? new Date(d).toISOString().slice(0, 10) : ''

  const [form, setForm] = useState({
    title: event.title || '',
    startDate: toDateInput(event.startDate),
    endDate: toDateInput(event.endDate),
    time: event.time || '',
    venue: event.venue || '',
    description: event.description || '',
    flyerImage: event.flyerImage || '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    if (!form.title || !form.startDate) return
    onSave({ ...form, assemblyId })
  }

  return (
    <div className="border rounded-xl p-4 space-y-3 bg-gray-50" style={{ borderColor: 'var(--gold-500)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="form-label">Event Title *</label>
          <input className="form-input" value={form.title} onChange={set('title')} placeholder="Sunday Service, Prayer Night..." required />
        </div>
        <div>
          <label className="form-label">Start Date *</label>
          <input className="form-input" type="date" value={form.startDate} onChange={set('startDate')} required />
        </div>
        <div>
          <label className="form-label">End Date (optional)</label>
          <input className="form-input" type="date" value={form.endDate} onChange={set('endDate')} />
        </div>
        <div>
          <label className="form-label">Time</label>
          <input className="form-input" value={form.time} onChange={set('time')} placeholder="e.g. 9:00 AM – 12:00 PM" />
        </div>
        <div>
          <label className="form-label">Venue</label>
          <input className="form-input" value={form.venue} onChange={set('venue')} placeholder="Main Auditorium" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Description (optional)</label>
          <textarea className="form-input" rows={2} value={form.description} onChange={set('description')} placeholder="Brief description of the event..." />
        </div>
      </div>
      <ImageUploader
        label="Flyer / Banner Image (optional)"
        value={form.flyerImage}
        assemblySlug={assemblySlug}
        category="events"
        aspectHint="portrait or landscape"
        onUpload={(url) => setForm(f => ({ ...f, flyerImage: url }))}
        onClear={() => setForm(f => ({ ...f, flyerImage: '' }))}
      />
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={handleSave} className="btn-primary btn-sm" disabled={!form.title || !form.startDate}>
          <Check size={13} /> Save Event
        </button>
        <button type="button" onClick={onCancel} className="btn-outline btn-sm">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  )
}

function EventRow({ event, assemblyId, assemblySlug, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)

  const start = new Date(event.startDate)
  const dateStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const handleSave = async (form) => {
    const res = await fetch(`/api/admin/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        startDate: form.startDate,
        endDate: form.endDate || null,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      onUpdate(updated)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <EventForm
        event={event}
        assemblyId={assemblyId}
        assemblySlug={assemblySlug}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border rounded-xl bg-white" style={{ borderColor: 'var(--border)' }}>
      <div
        className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 text-white"
        style={{ background: 'var(--purple-800)' }}
      >
        <span className="text-xs font-bold leading-none">
          {start.toLocaleString('default', { month: 'short' }).toUpperCase()}
        </span>
        <span className="text-sm font-bold leading-none">{start.getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{event.title}</p>
        <p className="text-xs text-gray-400">{dateStr}{event.time ? ` · ${event.time}` : ''}{event.venue ? ` · ${event.venue}` : ''}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(event.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function EventsEditor({ assembly, initialEvents }) {
  const [events, setEvents] = useState(initialEvents || [])
  const [adding, setAdding] = useState(false)

  const handleAdd = async (form) => {
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        assemblyId: assembly.id,
        startDate: form.startDate,
        endDate: form.endDate || null,
      }),
    })
    if (res.ok) {
      const created = await res.json()
      setEvents(prev => [created, ...prev])
      setAdding(false)
    }
  }

  const handleUpdate = (updated) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
    if (res.ok) setEvents(prev => prev.filter(e => e.id !== id))
  }

  const sorted = [...events].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

  return (
    <div className="space-y-3">
      {/* Add button */}
      {adding ? (
        <EventForm
          assemblyId={assembly.id}
          assemblySlug={assembly.slug}
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn-primary btn-sm">
          <Plus size={14} /> Add Event
        </button>
      )}

      {/* Event list */}
      {sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.map(event => (
            <EventRow
              key={event.id}
              event={event}
              assemblyId={assembly.id}
              assemblySlug={assembly.slug}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar size={32} className="mx-auto mb-2 text-gray-200" />
          <p className="text-sm text-gray-400">No events yet. Add your first event above.</p>
        </div>
      )}
    </div>
  )
}
