'use client'
import { useState } from 'react'
import { Pencil, Check, X, ChevronDown, ChevronUp } from 'lucide-react'

const DEFAULT_FELLOWSHIPS = [
  {
    key: 'KINGS_MEN',
    label: "King's Men",
    tagline: 'Raising Kingdom Builders',
    icon: '👑',
    description: `The King's Men Fellowship is the brotherhood of DMGA — a gathering of men committed to walking in purpose, accountability, and kingdom influence. We are builders: of families, businesses, communities, and the church. Through regular meetings, mentorship, and ministry, the King's Men challenge one another to grow in faith, character, and service.`,
    activities: ['Monthly Brotherhood Meetings', 'Family Mentorship', 'Community Outreach', 'Kingdom Business Network'],
  },
  {
    key: 'DESTINY_PRESERVERS',
    label: 'Destiny Preservers',
    tagline: 'Women of Purpose & Grace',
    icon: '💜',
    description: `The Destiny Preservers are the women of DMGA — daughters of the King who carry grace, wisdom, and strength. This fellowship equips women to fulfil their God-given destinies in the home, workplace, and ministry. Through prayer, discipleship, and sisterhood, Destiny Preservers guard and advance God's purposes in every sphere of life.`,
    activities: ['Prayer & Intercession', 'Discipleship & Mentoring', 'Women in Business', 'Home & Family Support'],
  },
  {
    key: 'DESTINY_DEFENDERS',
    label: 'Destiny Defenders',
    tagline: 'Champions of the Next Generation',
    icon: '⚡',
    description: `Destiny Defenders is the youth and young adults fellowship of DMGA — a movement of passionate believers who refuse to compromise their faith. We champion the next generation through bold worship, the uncompromising Word, and intentional discipleship. Defenders are equipped to face the world with confidence and transform it for God's glory.`,
    activities: ['Youth Sunday Services', 'Campus Outreach', 'Leadership Training', 'Annual Youth Convention'],
  },
  {
    key: 'DESTINY_TREASURES',
    label: 'Destiny Treasures',
    tagline: 'Nurturing Young Hearts for God',
    icon: '⭐',
    description: `Destiny Treasures is the children's fellowship of DMGA — a vibrant, fun, and faith-filled community for kids. Through creative learning, Bible stories, worship, and play, we plant seeds of faith in young hearts that will bear fruit for generations. Every child in DMGA is a treasure, and we are committed to nurturing them to know and love God.`,
    activities: ["Sunday Children's Church", 'Bible Quizzes & Games', 'Vacation Bible School', 'Kids Worship'],
  },
]

function FellowshipRow({ fellowship, onSave }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    label: fellowship.label,
    tagline: fellowship.tagline,
    description: fellowship.description,
    activities: fellowship.activities.join(', '),
    icon: fellowship.icon,
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    onSave(fellowship.key, {
      ...form,
      activities: form.activities.split(',').map(a => a.trim()).filter(Boolean),
    })
    setEditing(false)
  }

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      {/* Row header — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setEditing(v => !v)}
      >
        <span className="text-2xl">{fellowship.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: 'var(--charcoal)' }}>{fellowship.label}</p>
          <p className="text-xs text-gray-400">{fellowship.tagline}</p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setEditing(v => !v) }}
          className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 shrink-0"
        >
          {editing ? <ChevronUp size={14} /> : <Pencil size={14} />}
        </button>
      </div>

      {/* Inline edit form */}
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

export default function FellowshipsEditor({ section, onContentChange }) {
  const cc = section?.customContent || {}
  const overrides = (cc.items || []).reduce((map, item) => ({ ...map, [item.key]: item }), {})

  // Merge defaults with any saved overrides
  const fellowships = DEFAULT_FELLOWSHIPS.map(f => ({ ...f, ...overrides[f.key] }))

  const handleSave = (key, updates) => {
    const existingItems = cc.items || []
    const idx = existingItems.findIndex(i => i.key === key)
    const newItem = { key, ...updates }
    const newItems = idx >= 0
      ? existingItems.map((i, n) => n === idx ? newItem : i)
      : [...existingItems, newItem]

    onContentChange({ items: newItems })
  }

  return (
    <div className="space-y-2">
      {fellowships.map(f => (
        <FellowshipRow key={f.key} fellowship={f} onSave={handleSave} />
      ))}
    </div>
  )
}
