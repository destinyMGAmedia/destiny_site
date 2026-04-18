'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Pencil, Eye, EyeOff, Plus,
  ImageIcon, MapPin, Users, Briefcase,
  Calendar, Video, Gift, MessageSquare,
<<<<<<< HEAD
  Star, Phone, LayoutDashboard, Crown, Home
=======
  Star, Phone, LayoutDashboard, Crown,
>>>>>>> origin/main
} from 'lucide-react'

// Section type → icon + color
const SECTION_META = {
  HERO:        { icon: ImageIcon,      color: '#4a148c', bg: '#f3e5f5', label: 'Hero Banner' },
  FIND_US:     { icon: MapPin,         color: '#1565c0', bg: '#e3f2fd', label: 'Find Us' },
  FELLOWSHIPS: { icon: Users,          color: '#2e7d32', bg: '#e8f5e9', label: 'Fellowships' },
<<<<<<< HEAD
  ARK_CENTERS: { icon: Home,           color: '#4a148c', bg: '#f3e5f5', label: 'Ark Centers' },
=======
>>>>>>> origin/main
  DEPARTMENTS: { icon: Briefcase,      color: '#e65100', bg: '#fff3e0', label: 'Departments' },
  EVENTS:      { icon: Calendar,       color: '#ad1457', bg: '#fce4ec', label: "What's On" },
  MEDIA:       { icon: Video,          color: '#006064', bg: '#e0f7fa', label: 'Media' },
  GIVING:      { icon: Gift,           color: '#f9a825', bg: '#fffde7', label: 'Giving' },
  PRAYER:      { icon: MessageSquare,  color: '#4527a0', bg: '#ede7f6', label: 'Prayer' },
  TESTIMONIES: { icon: Star,           color: '#c62828', bg: '#ffebee', label: 'Testimonies' },
  CONTACT:     { icon: Phone,          color: '#37474f', bg: '#eceff1', label: 'Contact' },
  CUSTOM:      { icon: LayoutDashboard,color: '#558b2f', bg: '#f1f8e9', label: 'Custom Section' },
}

function SectionTile({ section, assemblySlug, onToggleVisibility }) {
  const meta = SECTION_META[section.type] || SECTION_META.CUSTOM
  const Icon = meta.icon
  const isContact = section.type === 'CONTACT'

  return (
    <div
      className="card p-5 flex flex-col gap-4 relative"
      style={{ opacity: section.isVisible ? 1 : 0.55 }}
    >
      {/* Position badge */}
      <span
        className="absolute top-3 right-3 text-xs font-bold text-gray-400"
        title="Section position"
      >
        #{section.position === 9999 ? '—' : section.position / 10}
      </span>

      {/* Icon + title */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: meta.bg }}
        >
          <Icon size={18} style={{ color: meta.color }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--charcoal)' }}>
            {section.title}
          </p>
          <p className="text-xs text-gray-400">{meta.label}</p>
        </div>
      </div>

      {isContact && (
        <p className="text-xs text-gray-400 italic">
          Always displayed last — cannot be moved.
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <Link
          href={`/admin/assemblies/${assemblySlug}/content/${section.id}`}
          className="btn-primary btn-sm flex-1 text-center"
        >
          <Pencil size={13} />
          Edit
        </Link>

        {!isContact && (
          <button
            onClick={() => onToggleVisibility(section.id, !section.isVisible)}
            className="btn-outline btn-sm px-3"
            title={section.isVisible ? 'Hide section' : 'Show section'}
          >
            {section.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ContentDashboard({ assembly, sections: initialSections, role }) {
  const [sections, setSections] = useState(initialSections)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPosition, setNewPosition] = useState('')

  // Split pinned (CONTACT) from moveable sections
  const contactSection = sections.find((s) => s.type === 'CONTACT')
  const heroSection = sections.find((s) => s.type === 'HERO')
  const moveable = sections.filter((s) => s.type !== 'CONTACT').sort((a, b) => a.position - b.position)

  // Leadership visibility is stored in hero section's customContent.showLeadership (default true)
  const leadershipVisible = heroSection?.customContent?.showLeadership !== false
  const [leadVisible, setLeadVisible] = useState(leadershipVisible)

  const toggleVisibility = async (id, isVisible) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, isVisible } : s))
    await fetch(`/api/sections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible }),
    })
  }

  const toggleLeadership = async () => {
    if (!heroSection) return
    const next = !leadVisible
    setLeadVisible(next)
    const existingContent = heroSection.customContent || {}
    await fetch(`/api/sections/${heroSection.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customContent: { ...existingContent, showLeadership: next } }),
    })
  }

  const addCustomSection = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const pos = parseInt(newPosition) || 85 // default before testimonies

    const res = await fetch('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assemblyId: assembly.id,
        type: 'CUSTOM',
        title: newTitle.trim(),
        position: pos * 10,
      }),
    })

    if (res.ok) {
      const newSection = await res.json()
      setSections((prev) => [...prev, newSection])
      setNewTitle('')
      setNewPosition('')
      setAdding(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            {assembly.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the sections displayed on your assembly page. Contact is always last.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${assembly.slug}`}
            target="_blank"
            className="btn-outline btn-sm"
          >
            <Eye size={14} />
            View Page
          </Link>
          <button
            onClick={() => setAdding(true)}
            className="btn-primary btn-sm"
          >
            <Plus size={14} />
            Add Section
          </button>
        </div>
      </div>

      {/* Add custom section form */}
      {adding && (
        <div className="card p-5 mb-6 border-2" style={{ borderColor: 'var(--gold-500)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--purple-900)' }}>
            Add New Custom Section
          </h3>
          <form onSubmit={addCustomSection} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="form-label">Section Title *</label>
              <input
                className="form-input"
                placeholder="e.g. Our Mission, Community Programs..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div className="w-36">
              <label className="form-label">Position (1–9)</label>
              <input
                className="form-input"
                type="number"
                min="1"
                max="9"
                placeholder="e.g. 6"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Contact is always last</p>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary btn-sm">Add</button>
              <button type="button" onClick={() => setAdding(false)} className="btn-outline btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Sections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {moveable.map((section) => {
          const tiles = [
            <SectionTile
              key={section.id}
              section={section}
              assemblySlug={assembly.slug}
              onToggleVisibility={toggleVisibility}
            />
          ]
          // Insert Leadership tile immediately after HERO
          if (section.type === 'HERO') {
            tiles.push(
              <div
                key="leadership"
                className="card p-5 flex flex-col gap-4 relative"
                style={{ opacity: leadVisible ? 1 : 0.55 }}
              >
                {/* Position badge placeholder to match other tiles */}
                <span className="absolute top-3 right-3 text-xs font-bold text-gray-400" title="Always shown after Hero">
                  #—
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#fff8e1' }}>
                    <Crown size={18} style={{ color: '#f9a825' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--charcoal)' }}>Leadership</p>
                    <p className="text-xs text-gray-400">Pastors & Team</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <Link
                    href={`/admin/assemblies/${assembly.slug}/team`}
                    className="btn-primary btn-sm flex-1 text-center"
                  >
                    <Pencil size={13} /> Edit
                  </Link>
                  <button
                    onClick={toggleLeadership}
                    className="btn-outline btn-sm px-3"
                    title={leadVisible ? 'Hide Leadership section' : 'Show Leadership section'}
                  >
                    {leadVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>
            )
          }
          return tiles
        })}
      </div>

      {/* Contact — always last, pinned */}
      {contactSection && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <SectionTile
            key={contactSection.id}
            section={contactSection}
            assemblySlug={assembly.slug}
            onToggleVisibility={toggleVisibility}
          />
        </div>
      )}
    </div>
  )
}
