'use client'
import { useState } from 'react'
import { Pencil, Check, X, ChevronUp, Plus, Trash2 } from 'lucide-react'

const DEFAULT_DEPARTMENTS = [
  { key: 'CHOIR',             label: 'Choir & Worship',        tagline: "Leading the Church into God's Presence",       icon: '🎵', description: 'The DMGA Choir leads the congregation into Spirit-filled worship every service. More than a music team, we are worshippers who understand that praise is a weapon and worship is a lifestyle. Through rigorous rehearsal and spiritual development, the choir creates an atmosphere where God moves.', activities: ['Sunday Worship Leading', 'Special Ministrations', 'Choir Practice', 'Music Recordings'] },
  { key: 'SANCTUARY_KEEPERS', label: 'Sanctuary Keepers',      tagline: "Maintaining God's House with Excellence",       icon: '🏛️', description: "The Sanctuary Keepers are the stewards of God's house. This dedicated team ensures that the church building is clean, orderly, and beautiful — a fitting place for the King of kings. They serve quietly but powerfully, preparing the sanctuary before every service with excellence and love.", activities: ['Pre-service Setup', 'Post-service Tidying', 'Building Maintenance', 'Event Preparation'] },
  { key: 'PROTOCOL',          label: 'Protocol & Greeters',    tagline: 'First Impressions That Last',                   icon: '🤝', description: 'The Protocol & Greeters team is the face of DMGA. From the car park to the main hall, this team ensures that every visitor and member feels warmly welcomed and guided. They manage orderly seating, guest relations, and the dignified flow of our services.', activities: ['Welcoming Visitors', 'Seating & Ushering', 'Guest Relations', 'Service Order Management'] },
  { key: 'MEDIA_TECHNICAL',   label: 'Media & Technical',      tagline: 'Broadcasting the Kingdom to the World',         icon: '🎬', description: 'The Media & Technical department keeps DMGA connected to the world. From live streaming services to managing sound and visuals during worship, this team uses technology to extend the reach of the gospel. They handle photography, videography, social media, and all broadcast operations.', activities: ['Live Streaming', 'Sound & Visuals', 'Social Media & Content', 'Photography & Video'] },
  { key: 'CREATIVE_ARTS',     label: 'Creative Arts',          tagline: 'Faith Expressed Through Art',                   icon: '🎭', description: 'The Creative Arts department uses drama, dance, spoken word, and visual art to communicate the gospel in compelling and memorable ways. Through skits, stage performances, and creative productions, this team reaches hearts in ways that words alone cannot. Art is their language, faith is their fuel.', activities: ['Drama & Skits', 'Dance Ministry', 'Spoken Word & Poetry', 'Creative Outreach'] },
  { key: 'EVANGELISM',        label: 'Evangelism',             tagline: 'Taking the Gospel to Every Street',             icon: '🌍', description: "The Evangelism department carries the heartbeat of DMGA's mission — reaching the lost. Through street evangelism, outreach programmes, and gospel campaigns, this team takes the message of salvation beyond the four walls of the church. Every soul won is a destiny ignited.", activities: ['Street Evangelism', 'Community Outreach', 'Hospital & Prison Visits', 'Gospel Campaigns'] },
  { key: 'PRAYER',            label: 'Prayer & Intercession',  tagline: 'The Engine Room of the Church',                 icon: '🙏', description: 'The Prayer & Intercession team is the engine room of DMGA. This dedicated group carries the spiritual covering of the church through consistent, fervent prayer. They intercede for the leadership, members, nation, and global missions — standing in the gap and holding the spiritual atmosphere of the assembly.', activities: ['Early Morning Prayer', 'Intercessory Meetings', 'Prayer Chains', 'Fasting Programmes'] },
  { key: 'FACILITY',          label: 'Facility',               tagline: 'Keeping the House in Order',                    icon: '🔧', description: 'The Facility team handles the physical maintenance and infrastructure of the church premises. From electrical repairs to plumbing, landscaping to furniture arrangement — they ensure the building is always safe, functional, and presentable. Their work behind the scenes enables every other ministry to thrive.', activities: ['Building Maintenance', 'Electrical & Plumbing', 'Grounds & Landscaping', 'Equipment Management'] },
]

const DEFAULT_KEYS = new Set(DEFAULT_DEPARTMENTS.map(d => d.key))

const EMPTY_FORM = { label: '', tagline: '', description: '', activities: '', icon: '✨' }

function toKey(label) {
  return label.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '') || `DEPT_${Date.now()}`
}

function DepartmentRow({ dept, isCustom, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    label: dept.label,
    tagline: dept.tagline,
    description: dept.description,
    activities: dept.activities.join(', '),
    icon: dept.icon,
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    onSave(dept.key, {
      ...form,
      activities: form.activities.split(',').map(a => a.trim()).filter(Boolean),
    })
    setEditing(false)
  }

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setEditing(v => !v)}
      >
        <span className="text-2xl">{dept.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: 'var(--charcoal)' }}>{dept.label}</p>
          <p className="text-xs text-gray-400">{dept.tagline}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isCustom && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(dept.key) }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600"
              title="Delete department"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setEditing(v => !v) }}
            className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600"
          >
            {editing ? <ChevronUp size={14} /> : <Pencil size={14} />}
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-t px-4 py-4 space-y-3 bg-gray-50" style={{ borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Name</label>
              <input className="form-input" value={form.label} onChange={set('label')} />
            </div>
            <div>
              <label className="form-label">Tagline</label>
              <input className="form-input" value={form.tagline} onChange={set('tagline')} />
            </div>
            <div>
              <label className="form-label">Icon (emoji)</label>
              <input className="form-input" value={form.icon} onChange={set('icon')} maxLength={4} />
            </div>
            <div>
              <label className="form-label">Activities (comma-separated)</label>
              <input className="form-input" value={form.activities} onChange={set('activities')} placeholder="Activity 1, Activity 2" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={set('description')} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} className="btn-primary btn-sm">
              <Check size={13} /> Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-outline btn-sm">
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AddDepartmentForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAdd = () => {
    if (!form.label.trim()) return
    onAdd({
      key: toKey(form.label),
      ...form,
      activities: form.activities.split(',').map(a => a.trim()).filter(Boolean),
    })
  }

  return (
    <div className="border-2 border-dashed rounded-xl px-4 py-4 space-y-3 bg-purple-50" style={{ borderColor: 'var(--purple, #7c3aed)' }}>
      <p className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>New Department</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="form-label">Name *</label>
          <input className="form-input" value={form.label} onChange={set('label')} placeholder="e.g. Children's Ministry" autoFocus />
        </div>
        <div>
          <label className="form-label">Tagline</label>
          <input className="form-input" value={form.tagline} onChange={set('tagline')} placeholder="A short subtitle" />
        </div>
        <div>
          <label className="form-label">Icon (emoji)</label>
          <input className="form-input" value={form.icon} onChange={set('icon')} maxLength={4} />
        </div>
        <div>
          <label className="form-label">Activities (comma-separated)</label>
          <input className="form-input" value={form.activities} onChange={set('activities')} placeholder="Activity 1, Activity 2" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={3} value={form.description} onChange={set('description')} placeholder="What this department does..." />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={handleAdd} className="btn-primary btn-sm" disabled={!form.label.trim()}>
          <Check size={13} /> Add Department
        </button>
        <button type="button" onClick={onCancel} className="btn-outline btn-sm">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  )
}

export default function DepartmentsEditor({ section, onContentChange }) {
  const [adding, setAdding] = useState(false)
  const cc = section?.customContent || {}
  const items = cc.items || []

  const overrides = items.reduce((map, item) => ({ ...map, [item.key]: item }), {})
  const customItems = items.filter(i => !DEFAULT_KEYS.has(i.key))

  const departments = DEFAULT_DEPARTMENTS.map(d => ({ ...d, ...overrides[d.key] }))

  const handleSave = (key, updates) => {
    const idx = items.findIndex(i => i.key === key)
    const newItem = { key, ...updates }
    const newItems = idx >= 0
      ? items.map((i, n) => n === idx ? newItem : i)
      : [...items, newItem]
    onContentChange({ items: newItems })
  }

  const handleAdd = (newDept) => {
    const key = newDept.key
    if (items.some(i => i.key === key)) {
      // avoid collision — append timestamp suffix
      newDept.key = `${key}_${Date.now()}`
    }
    onContentChange({ items: [...items, newDept] })
    setAdding(false)
  }

  const handleDelete = (key) => {
    onContentChange({ items: items.filter(i => i.key !== key) })
  }

  return (
    <div className="space-y-2">
      {departments.map(d => (
        <DepartmentRow key={d.key} dept={d} isCustom={false} onSave={handleSave} onDelete={handleDelete} />
      ))}

      {customItems.map(d => (
        <DepartmentRow key={d.key} dept={{ ...d, activities: d.activities || [] }} isCustom={true} onSave={handleSave} onDelete={handleDelete} />
      ))}

      {adding
        ? <AddDepartmentForm onAdd={handleAdd} onCancel={() => setAdding(false)} />
        : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
            style={{ borderColor: 'var(--border)' }}
          >
            <Plus size={16} /> Add Department
          </button>
        )
      }
    </div>
  )
}
