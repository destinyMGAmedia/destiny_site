'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
<<<<<<< HEAD
import { ArrowLeft, Save, Check, Home } from 'lucide-react'
=======
import { ArrowLeft, Save, Check } from 'lucide-react'
>>>>>>> origin/main
import BackgroundPicker from './BackgroundPicker'
import ImageUploader from './ImageUploader'
import FellowshipsEditor from './FellowshipsEditor'
import DepartmentsEditor from './DepartmentsEditor'
import EventsEditor from './EventsEditor'

<<<<<<< HEAD
// Utility function for extracting URLs from iframe HTML
const extractUrlFromIframe = (input) => {
  if (!input) return null
  
  // If it's already a URL, return it
  if (input.startsWith('https://www.google.com/maps/embed')) {
    return input
  }
  
  // If it's iframe HTML, extract the src URL
  if (input.includes('<iframe') && input.includes('src=')) {
    const srcMatch = input.match(/src="([^"]+)"/)
    if (srcMatch) {
      return srcMatch[1]
    }
  }
  
  return null
}

=======
>>>>>>> origin/main
// Section-specific form components
function HeroForm({ content, onChange, assembly, assemblySlug }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="form-label">Heading</label>
        <input className="form-input" value={content.heading || ''} onChange={e => onChange({ heading: e.target.value })} placeholder="Welcome to Our Assembly" />
      </div>
      <div>
        <label className="form-label">Subheading</label>
        <textarea className="form-input" rows={2} value={content.subheading || ''} onChange={e => onChange({ subheading: e.target.value })} placeholder="A short welcoming message..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Button Text</label>
          <input className="form-input" value={content.ctaText || ''} onChange={e => onChange({ ctaText: e.target.value })} placeholder="Join Us Sunday" />
        </div>
        <div>
          <label className="form-label">Button Link</label>
          <input className="form-input" value={content.ctaLink || ''} onChange={e => onChange({ ctaLink: e.target.value })} placeholder="/assemblies" />
        </div>
      </div>
      <div>
        <label className="form-label">Hero Image</label>
        <ImageUploader
          value={content.heroImage || assembly.heroImage}
          assemblySlug={assemblySlug}
          category="hero"
          aspectHint="16:9 recommended"
          onUpload={url => onChange({ heroImage: url })}
          onClear={() => onChange({ heroImage: null })}
        />
      </div>
    </div>
  )
}

function FindUsForm({ assembly, onAssemblyChange }) {
  const serviceTimes = assembly.serviceTimes || []

  const updateServiceTime = (i, field, val) => {
    const updated = serviceTimes.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
    onAssemblyChange({ serviceTimes: updated })
  }

<<<<<<< HEAD
  const validateMapInput = (input) => {
    if (!input) return { isValid: true, extractedUrl: null }
    
    const extractedUrl = extractUrlFromIframe(input.trim())
    if (!extractedUrl) return { isValid: false, extractedUrl: null }
    
    const isValidUrl = extractedUrl.includes('google.com/maps/embed') && extractedUrl.includes('pb=')
    return { isValid: isValidUrl, extractedUrl }
  }

  const mapValidation = validateMapInput(assembly.mapLink)
  const mapLinkValid = mapValidation.isValid

=======
>>>>>>> origin/main
  const addServiceTime = () => {
    onAssemblyChange({ serviceTimes: [...serviceTimes, { day: '', time: '', type: '' }] })
  }

  const removeServiceTime = (i) => {
    onAssemblyChange({ serviceTimes: serviceTimes.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="form-label">Physical Address</label>
        <input className="form-input" value={assembly.address || ''} onChange={e => onAssemblyChange({ address: e.target.value })} placeholder="Street, City, State" />
      </div>
      <div>
<<<<<<< HEAD
        <label className="form-label">Google Maps Embed Code</label>
        <textarea 
          className={`form-input ${assembly.mapLink && !mapLinkValid ? 'border-red-300 bg-red-50' : assembly.mapLink && mapLinkValid ? 'border-green-300 bg-green-50' : ''}`}
          rows={4}
          value={assembly.mapLink || ''} 
          onChange={e => {
            const input = e.target.value
            const validation = validateMapInput(input)
            // Always save the original input, but the component will use extracted URL
            onAssemblyChange({ mapLink: input })
          }}
          placeholder="Paste the entire iframe code from Google Maps here..."
        />
        
        {assembly.mapLink && !mapLinkValid && (
          <p className="text-xs text-red-600 mt-1">❌ Invalid embed code. Please copy the iframe from Google Maps &quot;Embed a map&quot; feature.</p>
        )}
        
        {assembly.mapLink && mapLinkValid && mapValidation.extractedUrl && (
          <div className="mt-1">
            <p className="text-xs text-green-600">✅ Valid Google Maps embed detected!</p>
            {assembly.mapLink !== mapValidation.extractedUrl && (
              <p className="text-xs text-gray-500 mt-1">📎 URL will be automatically extracted: <span className="font-mono text-xs break-all">{mapValidation.extractedUrl}</span></p>
            )}
          </div>
        )}
        
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 font-semibold mb-2">📍 How to get Google Maps embed code:</p>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>Open <a href="https://www.google.com/maps" target="_blank" rel="noopener" className="underline">Google Maps</a></li>
            <li>Search for your assembly location</li>
            <li>Click &quot;Share&quot; button</li>
            <li>Select &quot;Embed a map&quot; tab</li>
            <li>Choose map size (Medium recommended)</li>
            <li><strong>Copy the entire iframe code</strong> and paste it here</li>
          </ol>
          <p className="text-xs text-blue-600 mt-2">💡 You can paste either the full iframe code or just the URL - both work!</p>
        </div>
=======
        <label className="form-label">Google Maps Link</label>
        <input className="form-input" value={assembly.mapLink || ''} onChange={e => onAssemblyChange({ mapLink: e.target.value })} placeholder="https://maps.google.com/..." />
>>>>>>> origin/main
      </div>
      <div>
        <label className="form-label">Parking Notes</label>
        <input className="form-input" value={assembly.parkingNotes || ''} onChange={e => onAssemblyChange({ parkingNotes: e.target.value })} placeholder="Free parking available..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Phone</label>
          <input className="form-input" value={assembly.phone || ''} onChange={e => onAssemblyChange({ phone: e.target.value })} placeholder="+234..." />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={assembly.email || ''} onChange={e => onAssemblyChange({ email: e.target.value })} />
        </div>
        <div>
          <label className="form-label">WhatsApp</label>
          <input className="form-input" value={assembly.whatsapp || ''} onChange={e => onAssemblyChange({ whatsapp: e.target.value })} placeholder="+234..." />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Service Times</label>
          <button type="button" onClick={addServiceTime} className="btn-primary btn-sm">+ Add</button>
        </div>
        <div className="space-y-2">
          {serviceTimes.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="form-input w-28" placeholder="Day" value={s.day || ''} onChange={e => updateServiceTime(i, 'day', e.target.value)} />
              <input className="form-input flex-1" placeholder="Time e.g. 9:00 AM – 12:00 PM" value={s.time || ''} onChange={e => updateServiceTime(i, 'time', e.target.value)} />
              <input className="form-input flex-1" placeholder="Type e.g. Main Service" value={s.type || ''} onChange={e => updateServiceTime(i, 'type', e.target.value)} />
              <button type="button" onClick={() => removeServiceTime(i)} className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GivingForm({ giving, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="form-label">Bank Name</label>
        <input className="form-input" value={giving.bankName || ''} onChange={e => onChange({ bankName: e.target.value })} placeholder="First Bank of Nigeria" />
      </div>
      <div>
        <label className="form-label">Account Name</label>
        <input className="form-input" value={giving.accountName || ''} onChange={e => onChange({ accountName: e.target.value })} />
      </div>
      <div>
        <label className="form-label">Account Number</label>
        <input className="form-input font-mono" value={giving.accountNumber || ''} onChange={e => onChange({ accountNumber: e.target.value })} />
      </div>
      <div>
        <label className="form-label">Instructions / Note</label>
        <textarea className="form-input" rows={3} value={giving.instructions || ''} onChange={e => onChange({ instructions: e.target.value })} placeholder="Use your full name as the payment description..." />
      </div>
    </div>
  )
}

function ContactForm({ assembly, onAssemblyChange }) {
  return (
    <div className="space-y-5">
<<<<<<< HEAD
      <p className="text-xs text-gray-400">Contact section pulls from the assembly&apos;s main contact details.</p>
=======
      <p className="text-xs text-gray-400">Contact section pulls from the assembly's main contact details.</p>
>>>>>>> origin/main
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Phone</label>
          <input className="form-input" value={assembly.phone || ''} onChange={e => onAssemblyChange({ phone: e.target.value })} />
        </div>
        <div>
          <label className="form-label">WhatsApp</label>
          <input className="form-input" value={assembly.whatsapp || ''} onChange={e => onAssemblyChange({ whatsapp: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={assembly.email || ''} onChange={e => onAssemblyChange({ email: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Address</label>
          <input className="form-input" value={assembly.address || ''} onChange={e => onAssemblyChange({ address: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

function GenericSectionForm({ content, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="form-label">Section Heading (optional override)</label>
        <input className="form-input" value={content.headingOverride || ''} onChange={e => onChange({ headingOverride: e.target.value })} placeholder="Leave blank to use default" />
      </div>
      <div>
        <label className="form-label">Intro Text (optional)</label>
        <textarea className="form-input" rows={3} value={content.intro || ''} onChange={e => onChange({ intro: e.target.value })} placeholder="A short introduction shown above the content..." />
      </div>
    </div>
  )
}

// Which sections need assembly-level data saved
const ASSEMBLY_SECTIONS = new Set(['FIND_US', 'CONTACT'])
// Which sections need giving details saved
const GIVING_SECTIONS = new Set(['GIVING'])
// Sections that don't show background picker
const NO_BG_SECTIONS = new Set(['FIND_US', 'CONTACT', 'GIVING'])
// List-based sections that manage items internally (save their own content)
<<<<<<< HEAD
const LIST_SECTIONS = new Set(['FELLOWSHIPS', 'DEPARTMENTS', 'EVENTS', 'ARK_CENTERS'])
=======
const LIST_SECTIONS = new Set(['FELLOWSHIPS', 'DEPARTMENTS', 'EVENTS'])
>>>>>>> origin/main

export default function SectionEditor({ assembly, section, role }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const [content, setContent] = useState(section.customContent || {})
  const updateContent = (updates) => setContent(prev => ({ ...prev, ...updates }))

  const [assemblyData, setAssemblyData] = useState({
    address: assembly.address || '',
    mapLink: assembly.mapLink || '',
    parkingNotes: assembly.parkingNotes || '',
    phone: assembly.phone || '',
    email: assembly.email || '',
    whatsapp: assembly.whatsapp || '',
    serviceTimes: assembly.serviceTimes || [],
  })
  const updateAssembly = (updates) => setAssemblyData(prev => ({ ...prev, ...updates }))

  const [givingData, setGivingData] = useState({
    bankName: assembly.givingDetails?.bankName || '',
    accountName: assembly.givingDetails?.accountName || '',
    accountNumber: assembly.givingDetails?.accountNumber || '',
    instructions: assembly.givingDetails?.instructions || '',
  })
  const updateGiving = (updates) => setGivingData(prev => ({ ...prev, ...updates }))

  const isListSection = LIST_SECTIONS.has(section.type)

  // For list sections (Fellowships, Departments), items are saved immediately per-item.
  // We still need a top-level save for heading/bg overrides.
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const promises = []

      promises.push(
        fetch(`/api/sections/${section.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customContent: content }),
        })
      )

      if (ASSEMBLY_SECTIONS.has(section.type)) {
<<<<<<< HEAD
        // Extract URL from iframe if needed before saving
        const processedAssemblyData = { ...assemblyData }
        if (processedAssemblyData.mapLink) {
          const extractedUrl = extractUrlFromIframe(processedAssemblyData.mapLink)
          if (extractedUrl) {
            processedAssemblyData.mapLink = extractedUrl
          }
        }
        
=======
>>>>>>> origin/main
        promises.push(
          fetch(`/api/admin/assembly/${assembly.slug}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
<<<<<<< HEAD
            body: JSON.stringify(processedAssemblyData),
=======
            body: JSON.stringify(assemblyData),
>>>>>>> origin/main
          })
        )
      }

      if (GIVING_SECTIONS.has(section.type)) {
        promises.push(
          fetch(`/api/admin/giving/${assembly.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(givingData),
          })
        )
      }

      const results = await Promise.all(promises)
      for (const res of results) {
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Save failed')
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // For list sections (FELLOWSHIPS/DEPARTMENTS): items save immediately via onContentChange,
  // which patches the section customContent right away.
  const handleListItemChange = async (updates) => {
    const newContent = { ...content, ...updates }
    setContent(newContent)
    await fetch(`/api/sections/${section.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customContent: newContent }),
    })
  }

  const showBgPicker = !NO_BG_SECTIONS.has(section.type)

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/admin/assemblies/${assembly.slug}/content`)}
          className="text-gray-400 hover:text-gray-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            {section.title}
          </h1>
          <p className="text-xs text-gray-400">{assembly.name} — {section.type}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Heading / intro override — shown for list sections and generic */}
      {(isListSection || section.type === 'CUSTOM' || section.type === 'PRAYER' || section.type === 'TESTIMONIES' || section.type === 'MEDIA') && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Section Heading & Intro</h2>
          <div>
            <label className="form-label">Heading Override (optional)</label>
            <input className="form-input" value={content.headingOverride || ''} onChange={e => updateContent({ headingOverride: e.target.value })} placeholder="Leave blank to use default" />
          </div>
          <div>
            <label className="form-label">Intro Text (optional)</label>
            <textarea className="form-input" rows={2} value={content.intro || ''} onChange={e => updateContent({ intro: e.target.value })} placeholder="A short introduction shown above the content..." />
          </div>
        </div>
      )}

      {/* Section-specific content */}
      {section.type === 'HERO' && (
        <div className="card p-6 space-y-6">
          <h2 className="font-semibold text-gray-800">Hero Content</h2>
          <HeroForm content={content} onChange={updateContent} assembly={assembly} assemblySlug={assembly.slug} />
        </div>
      )}

      {section.type === 'FIND_US' && (
        <div className="card p-6 space-y-6">
          <h2 className="font-semibold text-gray-800">Location & Contact Details</h2>
          <FindUsForm assembly={assemblyData} onAssemblyChange={updateAssembly} />
        </div>
      )}

      {section.type === 'GIVING' && (
        <div className="card p-6 space-y-6">
          <h2 className="font-semibold text-gray-800">Giving Details</h2>
          <GivingForm giving={givingData} onChange={updateGiving} />
        </div>
      )}

      {section.type === 'CONTACT' && (
        <div className="card p-6 space-y-6">
          <h2 className="font-semibold text-gray-800">Contact Information</h2>
          <ContactForm assembly={assemblyData} onAssemblyChange={updateAssembly} />
        </div>
      )}

      {section.type === 'FELLOWSHIPS' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Fellowships</h2>
          <p className="text-xs text-gray-400">Click the edit icon on any fellowship to update its details. Changes save automatically per item.</p>
          <FellowshipsEditor section={{ ...section, customContent: content }} onContentChange={handleListItemChange} />
        </div>
      )}

      {section.type === 'DEPARTMENTS' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Departments</h2>
          <p className="text-xs text-gray-400">Click the edit icon on any department to update its details. Changes save automatically per item.</p>
          <DepartmentsEditor section={{ ...section, customContent: content }} onContentChange={handleListItemChange} />
        </div>
      )}

      {section.type === 'EVENTS' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Events</h2>
          <EventsEditor assembly={assembly} initialEvents={assembly.events || []} />
        </div>
      )}

<<<<<<< HEAD
      {section.type === 'ARK_CENTERS' && (
        <div className="card p-6 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Home className="text-purple-600" size={30} />
          </div>
          <h2 className="font-semibold text-gray-800">Ark Centers Data</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
            Ark Center locations and attendance are managed through the main Ark Centers management page.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/admin/assemblies/${assembly.slug}/ark-centers`)}
            className="btn-primary justify-center"
          >
            Manage Ark Centers
          </button>
        </div>
      )}

=======
>>>>>>> origin/main
      {/* Background picker */}
      {showBgPicker && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Background Style</h2>
          <BackgroundPicker
            value={content.bg}
            onChange={(bg) => updateContent({ bg })}
            assemblySlug={assembly.slug}
          />
        </div>
      )}

      {/* Save button — not needed for EVENTS (saves per-item) but shown for heading/bg */}
      {section.type !== 'EVENTS' && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full justify-center disabled:opacity-60"
        >
          {saved ? <><Check size={15} /> Saved!</> : saving ? 'Saving...' : <><Save size={15} /> Save Changes</>}
        </button>
      )}

      {/* For Events — save only heading/bg if they've been changed */}
      {section.type === 'EVENTS' && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-outline w-full justify-center disabled:opacity-60 text-sm"
        >
          {saved ? <><Check size={15} /> Saved!</> : saving ? 'Saving...' : <><Save size={15} /> Save Heading & Background</>}
        </button>
      )}
    </div>
  )
}
