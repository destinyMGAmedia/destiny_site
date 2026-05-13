'use client'
import { useState, useEffect } from 'react'
import { Check, X, FileText, Home, Crown, ChevronRight, ChevronDown } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'
import Link from 'next/link'

function Toast({ toast }) {
  if (!toast) return null
  return (
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
  )
}

function Section({ title, description, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
        {open ? <ChevronDown size={16} className="text-gray-400 shrink-0" /> : <ChevronRight size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>{children}</div>}
    </div>
  )
}

function SaveButton({ saving, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving || disabled}
      className="btn-primary btn-sm disabled:opacity-50 flex items-center gap-1.5 mt-4"
    >
      {saving
        ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        : <Check size={13} />}
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  )
}

export default function SiteContentPage() {
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    fetch('/api/admin/site-content')
      .then(r => r.json())
      .then(data => { setContent(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const set = (key) => (e) => {
    const val = typeof e === 'string' ? e : e.target.value
    setContent(prev => ({ ...prev, [key]: val }))
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const save = async (sectionId, keys) => {
    setSaving(sectionId)
    try {
      const updates = Object.fromEntries(keys.map(k => [k, content[k] ?? '']))
      const res = await fetch('/api/admin/site-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      showToast('Saved successfully.')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(null)
    }
  }

  const v = (key, fallback = '') => content[key] ?? fallback

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading site content...
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <Toast toast={toast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Site Content
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage global site pages — About page and Home page content.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 w-fit">
        {[
          { id: 'about', label: 'About Page', icon: FileText },
          { id: 'home', label: 'Home Page', icon: Home },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-white shadow-sm text-purple-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── ABOUT PAGE TAB ── */}
      {activeTab === 'about' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--purple-50)', color: 'var(--purple-800)' }}>
            Changes here update the public <strong>/about</strong> page. Each section saves independently.
          </div>

          {/* Hero */}
          <Section title="Hero Section" description="Page title and tagline shown at the top of the About page" defaultOpen>
            <div className="space-y-4">
              <div>
                <label className="form-label">Page Title</label>
                <input className="form-input" value={v('about_hero_title', 'About DMGA')} onChange={set('about_hero_title')} placeholder="About DMGA" />
              </div>
              <div>
                <label className="form-label">Tagline</label>
                <input className="form-input" value={v('about_hero_tagline', '... a prophetic church with an apostolic mandate')} onChange={set('about_hero_tagline')} placeholder="... a prophetic church with an apostolic mandate" />
              </div>
              <SaveButton saving={saving === 'hero'} onClick={() => save('hero', ['about_hero_title', 'about_hero_tagline'])} />
            </div>
          </Section>

          {/* Vision & Mission */}
          <Section title="Vision & Mission" description="Two cards shown below the hero">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Mission Card Title</label>
                  <input className="form-input" value={v('about_mission_title', 'A People of Destiny')} onChange={set('about_mission_title')} placeholder="A People of Destiny" />
                </div>
                <div>
                  <label className="form-label">Vision Card Title</label>
                  <input className="form-input" value={v('about_vision_title', 'Impact the World')} onChange={set('about_vision_title')} placeholder="Impact the World" />
                </div>
              </div>
              <div>
                <label className="form-label">Mission Body</label>
                <textarea className="form-input" rows={3} value={v('about_mission_body', 'To bring people and places into their destiny in God and raise dynamic leaders.')} onChange={set('about_mission_body')} />
              </div>
              <div>
                <label className="form-label">Vision Body</label>
                <textarea className="form-input" rows={3} value={v('about_vision_body', 'To establish and advance the kingdom of God on earth by discerning His voice, declaring His will, and delivering His purpose.')} onChange={set('about_vision_body')} />
              </div>
              <SaveButton saving={saving === 'vision'} onClick={() => save('vision', ['about_mission_title', 'about_mission_body', 'about_vision_title', 'about_vision_body'])} />
            </div>
          </Section>

          {/* History */}
          <Section title="Our History" description="Narrative text shown in the History section">
            <div className="space-y-4">
              <div>
                <label className="form-label">History (paragraph 1)</label>
                <textarea className="form-input" rows={4}
                  value={v('about_history_p1', "Destiny Mission Global Assembly began with a divine vision to bring people into alignment with God's purpose for their lives. What started as a small fellowship of believers has grown into a thriving church family committed to raising leaders, transforming communities, and reaching nations for Christ.")}
                  onChange={set('about_history_p1')}
                />
              </div>
              <div>
                <label className="form-label">History (paragraph 2)</label>
                <textarea className="form-input" rows={4}
                  value={v('about_history_p2', 'Over the years, the church has experienced tremendous growth in membership and impact — hosting life-changing conferences, outreaches, and discipleship programs. Through faith, dedication, and the leading of the Holy Spirit, Destiny Mission continues to stand as a beacon of light, hope, and transformation.')}
                  onChange={set('about_history_p2')}
                />
              </div>
              <SaveButton saving={saving === 'history'} onClick={() => save('history', ['about_history_p1', 'about_history_p2'])} />
            </div>
          </Section>

          {/* Declaration */}
          <Section title="Our Declaration" description="Daily proclamation shown in the purple card">
            <div className="space-y-4">
              <div>
                <label className="form-label">Declaration Text</label>
                <textarea className="form-input" rows={6}
                  value={v('about_declaration', 'I am wonderfully made and dignified \n\nDestined to rule and reign \n\nI am a champion because \n\nI have the seed of greatness in me.')}
                  onChange={set('about_declaration')}
                />
                <p className="text-xs text-gray-400 mt-1">Use double line breaks to separate stanzas.</p>
              </div>
              <div>
                <label className="form-label">Closing Line (e.g. "Destiny Family... Champions forever!")</label>
                <input className="form-input" value={v('about_declaration_closing', 'Destiny Family... Champions forever!')} onChange={set('about_declaration_closing')} />
              </div>
              <SaveButton saving={saving === 'declaration'} onClick={() => save('declaration', ['about_declaration', 'about_declaration_closing'])} />
            </div>
          </Section>

          {/* Anthem */}
          <Section title="Our Anthem" description="Church anthem/song lyrics">
            <div className="space-y-4">
              <div>
                <label className="form-label">Anthem Verse</label>
                <textarea className="form-input" rows={4}
                  value={v('about_anthem_verse', "We're the building of the Lord, standing on the rock \nWashed by the Blood of the Lamb, destined to reign \nTo redeem this land to God and to worship in spirit and truth")}
                  onChange={set('about_anthem_verse')}
                />
              </div>
              <div>
                <label className="form-label">Anthem Chorus</label>
                <textarea className="form-input" rows={5}
                  value={v('about_anthem_chorus', "People of Destiny, a family we are, an oasis of Love in a thirsty land \nSmall enough to know you, big enough to serve you \nHere the pastures are green and the Lord is in this place \nAnd He's building us to stand")}
                  onChange={set('about_anthem_chorus')}
                />
              </div>
              <SaveButton saving={saving === 'anthem'} onClick={() => save('anthem', ['about_anthem_verse', 'about_anthem_chorus'])} />
            </div>
          </Section>

          {/* Leadership */}
          <div className="card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--purple-50)' }}>
                <Crown size={18} style={{ color: 'var(--purple-700)' }} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Leadership</p>
                <p className="text-xs text-gray-400">Add, edit, and reorder global leaders shown on the About page</p>
              </div>
            </div>
            <Link
              href="/admin/global-leaders"
              className="btn-outline btn-sm flex items-center gap-1.5"
            >
              Manage Leaders <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* ── HOME PAGE TAB ── */}
      {activeTab === 'home' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--purple-50)', color: 'var(--purple-800)' }}>
            Changes here update the <strong>Spiritual Covering</strong> section on the home page.
          </div>

          {/* Founder 1 — Primate */}
          <Section title="Founder 1 — Primate / General Overseer" description="The primary leader shown in the wider column" defaultOpen>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={v('home_founder1_name', 'Archbishop (Prof) Cletus Bassy')} onChange={set('home_founder1_name')} placeholder="Archbishop (Prof) Cletus Bassy" />
                </div>
                <div>
                  <label className="form-label">Title / Designation</label>
                  <input className="form-input" value={v('home_founder1_title', 'Primate & General Overseer')} onChange={set('home_founder1_title')} placeholder="Primate & General Overseer" />
                </div>
              </div>
              <div>
                <label className="form-label">Bio (paragraph 1)</label>
                <textarea className="form-input" rows={3}
                  value={v('home_founder1_bio1', 'A man of extraordinary faith and vision, Archbishop (Prof) Cletus Bassy is the Primate and General Overseer of Destiny Mission Global Assembly. His life is dedicated to raising a people of destiny across nations through apostolic ministry and prophetic insight.')}
                  onChange={set('home_founder1_bio1')}
                />
              </div>
              <div>
                <label className="form-label">Bio (paragraph 2)</label>
                <textarea className="form-input" rows={3}
                  value={v('home_founder1_bio2', 'Under his leadership, DMGA has experienced tremendous growth and impact, touching lives across continents and establishing a legacy of spiritual excellence, leadership development, and kingdom expansion.')}
                  onChange={set('home_founder1_bio2')}
                />
              </div>
              <div>
                <label className="form-label">Quote / Blockquote</label>
                <textarea className="form-input" rows={2}
                  value={v('home_founder1_quote', 'We are called to bring people and places into their destiny in God and raise dynamic leaders for His kingdom.')}
                  onChange={set('home_founder1_quote')}
                />
              </div>
              <ImageUploader
                label="Photo"
                value={v('home_founder1_photo')}
                assemblySlug="global"
                category="leadership"
                aspectHint="portrait recommended"
                onUpload={(url) => setContent(prev => ({ ...prev, home_founder1_photo: url }))}
                onClear={() => setContent(prev => ({ ...prev, home_founder1_photo: '' }))}
              />
              <SaveButton saving={saving === 'founder1'} onClick={() => save('founder1', ['home_founder1_name', 'home_founder1_title', 'home_founder1_bio1', 'home_founder1_bio2', 'home_founder1_quote', 'home_founder1_photo'])} />
            </div>
          </Section>

          {/* Founder 2 — Presbyter */}
          <Section title="Founder 2 — Presbyter / First Lady" description="The secondary leader shown in the narrower column">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={v('home_founder2_name', 'Bishop (Dr) Blessing Bassey')} onChange={set('home_founder2_name')} placeholder="Bishop (Dr) Blessing Bassey" />
                </div>
                <div>
                  <label className="form-label">Title / Designation</label>
                  <input className="form-input" value={v('home_founder2_title', 'Presbyter & First Lady')} onChange={set('home_founder2_title')} placeholder="Presbyter & First Lady" />
                </div>
              </div>
              <div>
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={4}
                  value={v('home_founder2_bio', 'The First Lady of DMGA and a pillar of grace and strength in the ministry. She plays a vital role in nurturing families, strengthening the church community, and mentoring women in their spiritual journey.')}
                  onChange={set('home_founder2_bio')}
                />
              </div>
              <div>
                <label className="form-label">Tagline</label>
                <input className="form-input"
                  value={v('home_founder2_tagline', 'A virtuous woman who leads with wisdom and compassion')}
                  onChange={set('home_founder2_tagline')}
                  placeholder="A virtuous woman who leads with wisdom and compassion"
                />
              </div>
              <ImageUploader
                label="Photo"
                value={v('home_founder2_photo')}
                assemblySlug="global"
                category="leadership"
                aspectHint="portrait recommended"
                onUpload={(url) => setContent(prev => ({ ...prev, home_founder2_photo: url }))}
                onClear={() => setContent(prev => ({ ...prev, home_founder2_photo: '' }))}
              />
              <SaveButton saving={saving === 'founder2'} onClick={() => save('founder2', ['home_founder2_name', 'home_founder2_title', 'home_founder2_bio', 'home_founder2_tagline', 'home_founder2_photo'])} />
            </div>
          </Section>

          {/* Other home page content is managed via existing sections */}
          <div className="card p-5">
            <p className="font-semibold text-gray-900 mb-1">Other Home Page Sections</p>
            <p className="text-sm text-gray-500 mb-4">The following are managed through their dedicated pages:</p>
            <div className="space-y-2">
              {[
                { label: 'Hero Slides (Carousel)', href: '/admin/hero-slides' },
                { label: 'YouTube / Live Stream', href: '/admin/channels' },
                { label: 'Royal Feed (Daily Devotional)', href: '/admin/devotionals' },
                { label: 'Global Events', href: '/admin/events' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="text-gray-700 font-medium">{label}</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
