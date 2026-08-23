'use client'
import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { CATEGORIES, PREFERRED_CONTACTS, MAX_DESCRIPTION_CHARS } from '@/lib/yellowpages/constants'
import ImageUploadField from './ImageUploadField'

const PREFERRED_CONTACT_LABELS = { PHONE: 'Phone Call', WHATSAPP: 'WhatsApp', EMAIL: 'Email' }
const SOCIAL_FIELDS = ['facebook', 'instagram', 'linkedin', 'tiktok']

const EMPTY_FORM = {
  listingType: 'INDIVIDUAL',
  name: '',
  contactPersonName: '',
  position: '',
  phone: '',
  whatsapp: '',
  email: '',
  category: '',
  subCategory: '',
  description: '',
  servicesOffered: '',
  city: '',
  state: '',
  country: '',
  assemblySlug: '',
  website: '',
  socialLinks: {},
  yearsInOperation: '',
  certifications: '',
  logoUrl: '',
  photoUrl: '',
  licenseNumber: '',
  preferredContact: 'PHONE',
}

const sanitizePhone = (value) => (value || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')

// Hoisted out of ListingForm (not declared inline in render) — takes `errors` as a prop
// instead of closing over form state, per react-hooks/static-components.
function FieldError({ errors, field }) {
  return errors[field] ? (
    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
      <AlertCircle size={12} /> {errors[field]}
    </p>
  ) : null
}

/**
 * The full listing registration form, used by /yellowpages/register. Client-validates only
 * the bare minimum (required fields) for quick feedback; the server's field-level `errors`
 * response is the source of truth and is merged into formErrors on submit.
 */
export default function ListingForm({ initialValues, onSuccess }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })
  const [formErrors, setFormErrors] = useState({})
  const [assemblies, setAssemblies] = useState([])
  const [status, setStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetch('/api/assemblies')
      .then((res) => res.json())
      .then((data) => setAssemblies(Array.isArray(data) ? data : []))
      .catch(() => setAssemblies([]))
  }, [])

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (formErrors[field]) setFormErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
  }

  const setSocial = (key) => (value) => {
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }))
  }

  const validateBeforeSubmit = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = form.listingType === 'BUSINESS' ? 'Business name is required.' : 'Your name is required.'
    if (form.listingType === 'BUSINESS' && !form.contactPersonName.trim()) errors.contactPersonName = 'Contact person name is required.'
    if (!form.phone.trim()) errors.phone = 'Phone number is required.'
    if (!form.category) errors.category = 'Please choose a category.'
    if (!form.description.trim()) errors.description = 'A short description is required.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateBeforeSubmit()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setSubmitError('')
    setStatus('loading')

    try {
      const res = await fetch('/api/yellowpages/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          yearsInOperation: form.yearsInOperation === '' ? null : Number(form.yearsInOperation),
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        onSuccess?.(data.listing)
      } else if (data.errors) {
        setFormErrors(data.errors)
        setStatus('idle')
      } else {
        setSubmitError(data.error || 'Something went wrong. Please try again.')
        setStatus('idle')
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  const isBusiness = form.listingType === 'BUSINESS'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <span className="yp-label">I am registering *</span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={!isBusiness}
            onClick={() => set('listingType')('INDIVIDUAL')}
            className="yp-card p-3 text-sm font-semibold"
            style={!isBusiness ? { borderColor: 'var(--yp-yellow-600)', background: 'var(--yp-yellow-100)' } : undefined}
          >
            A skill or service I offer
          </button>
          <button
            type="button"
            aria-pressed={isBusiness}
            onClick={() => set('listingType')('BUSINESS')}
            className="yp-card p-3 text-sm font-semibold"
            style={isBusiness ? { borderColor: 'var(--yp-yellow-600)', background: 'var(--yp-yellow-100)' } : undefined}
          >
            A business/organization
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="yp-label" htmlFor="yp-name">{isBusiness ? 'Business/Organization Name *' : 'Your Name *'}</label>
          <input id="yp-name" className="yp-input" value={form.name} onChange={(e) => set('name')(e.target.value)} />
          <FieldError errors={formErrors} field="name" />
        </div>
        {isBusiness && (
          <div>
            <label className="yp-label" htmlFor="yp-contactPersonName">Contact Person *</label>
            <input id="yp-contactPersonName" className="yp-input" value={form.contactPersonName} onChange={(e) => set('contactPersonName')(e.target.value)} />
            <FieldError errors={formErrors} field="contactPersonName" />
          </div>
        )}
      </div>

      {isBusiness && (
        <div>
          <label className="yp-label" htmlFor="yp-position">Position/Designation</label>
          <input id="yp-position" className="yp-input" placeholder="e.g. Founder, CEO, Manager" value={form.position} onChange={(e) => set('position')(e.target.value)} />
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="yp-label" htmlFor="yp-phone">Phone *</label>
          <input id="yp-phone" className="yp-input" type="tel" value={form.phone} onChange={(e) => set('phone')(sanitizePhone(e.target.value))} />
          <FieldError errors={formErrors} field="phone" />
        </div>
        <div>
          <label className="yp-label" htmlFor="yp-whatsapp">WhatsApp</label>
          <input id="yp-whatsapp" className="yp-input" type="tel" placeholder="If different from phone" value={form.whatsapp} onChange={(e) => set('whatsapp')(sanitizePhone(e.target.value))} />
          <FieldError errors={formErrors} field="whatsapp" />
        </div>
        <div>
          <label className="yp-label" htmlFor="yp-email">Email</label>
          <input id="yp-email" className="yp-input" type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} />
          <FieldError errors={formErrors} field="email" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="yp-label" htmlFor="yp-category">Category *</label>
          <select id="yp-category" className="yp-select" value={form.category} onChange={(e) => set('category')(e.target.value)}>
            <option value="">Choose a category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <FieldError errors={formErrors} field="category" />
        </div>
        <div>
          <label className="yp-label" htmlFor="yp-subCategory">Sub-Sector / Profession</label>
          <input id="yp-subCategory" className="yp-input" placeholder="e.g. Travel Agency, Plumbing, Architecture" value={form.subCategory} onChange={(e) => set('subCategory')(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="yp-label" htmlFor="yp-description">
          Description * <span className="font-normal text-xs" style={{ color: 'var(--yp-ink-soft)' }}>({form.description.length}/{MAX_DESCRIPTION_CHARS})</span>
        </label>
        <textarea id="yp-description" className="yp-textarea" maxLength={MAX_DESCRIPTION_CHARS} value={form.description} onChange={(e) => set('description')(e.target.value)} />
        <FieldError errors={formErrors} field="description" />
      </div>

      <div>
        <label className="yp-label" htmlFor="yp-servicesOffered">Products/Services Offered</label>
        <textarea id="yp-servicesOffered" className="yp-textarea" placeholder="Main services or products offered" value={form.servicesOffered} onChange={(e) => set('servicesOffered')(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="yp-label" htmlFor="yp-city">City</label>
          <input id="yp-city" className="yp-input" value={form.city} onChange={(e) => set('city')(e.target.value)} />
        </div>
        <div>
          <label className="yp-label" htmlFor="yp-state">State</label>
          <input id="yp-state" className="yp-input" value={form.state} onChange={(e) => set('state')(e.target.value)} />
        </div>
        <div>
          <label className="yp-label" htmlFor="yp-country">Country</label>
          <input id="yp-country" className="yp-input" value={form.country} onChange={(e) => set('country')(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="yp-label" htmlFor="yp-assemblySlug">Assembly (optional)</label>
        <select id="yp-assemblySlug" className="yp-select" value={form.assemblySlug} onChange={(e) => set('assemblySlug')(e.target.value)}>
          <option value="">Not tied to a specific assembly</option>
          {assemblies.map((a) => (
            <option key={a.slug} value={a.slug}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ImageUploadField label="Business Logo" type="logo" value={form.logoUrl} onChange={set('logoUrl')} />
        <ImageUploadField label="Professional Photo" type="photo" value={form.photoUrl} onChange={set('photoUrl')} />
      </div>

      <div>
        <label className="yp-label" htmlFor="yp-website">Website</label>
        <input id="yp-website" className="yp-input" placeholder="https://…" value={form.website} onChange={(e) => set('website')(e.target.value)} />
        <FieldError errors={formErrors} field="website" />
      </div>

      <div>
        <span className="yp-label">Social Media</span>
        <div className="grid sm:grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map((key) => (
            <input
              key={key}
              className="yp-input"
              aria-label={key[0].toUpperCase() + key.slice(1)}
              placeholder={key[0].toUpperCase() + key.slice(1)}
              value={form.socialLinks[key] || ''}
              onChange={(e) => setSocial(key)(e.target.value)}
            />
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="yp-label" htmlFor="yp-yearsInOperation">Years in Operation</label>
          <input id="yp-yearsInOperation" className="yp-input" type="number" min="0" max="150" value={form.yearsInOperation} onChange={(e) => set('yearsInOperation')(e.target.value)} />
          <FieldError errors={formErrors} field="yearsInOperation" />
        </div>
        <div>
          <label className="yp-label" htmlFor="yp-licenseNumber">Registration/License Number</label>
          <input id="yp-licenseNumber" className="yp-input" value={form.licenseNumber} onChange={(e) => set('licenseNumber')(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="yp-label" htmlFor="yp-certifications">Professional Certifications/Memberships</label>
        <input id="yp-certifications" className="yp-input" placeholder="e.g. IATA, NANTA, CAC" value={form.certifications} onChange={(e) => set('certifications')(e.target.value)} />
      </div>

      <div>
        <label className="yp-label" htmlFor="yp-preferredContact">Preferred Contact Method</label>
        <select id="yp-preferredContact" className="yp-select" value={form.preferredContact} onChange={(e) => set('preferredContact')(e.target.value)}>
          {PREFERRED_CONTACTS.map((pc) => (
            <option key={pc} value={pc}>{PREFERRED_CONTACT_LABELS[pc]}</option>
          ))}
        </select>
      </div>

      {submitError && (
        <p className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle size={16} /> {submitError}
        </p>
      )}

      <button type="submit" disabled={status === 'loading'} className="yp-btn-primary w-full justify-center">
        {status === 'loading' ? 'Submitting…' : 'List My Skill or Business'}
      </button>
    </form>
  )
}
