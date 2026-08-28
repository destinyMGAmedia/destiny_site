'use client'
import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { CATEGORIES, PREFERRED_CONTACTS, MAX_DESCRIPTION_CHARS, MAX_EDIT_CONTACTS, fieldLabel } from '@/lib/yellowpages/constants'
import { isValidPhone, isValidEmail } from '@/lib/yellowpages/validation'
import { COUNTRY_NAMES } from '@/lib/yellowpages/phone'
import ProfileCompleteness from './ProfileCompleteness'
import IndividualFields from './forms/IndividualFields'
import BusinessFields from './forms/BusinessFields'
import TagInput from './forms/TagInput'
import { FieldError } from './forms/Field'

// Absolute base for links back to the main site (member registration lives there, not on the
// Yellow Pages subdomain). Mirrors src/components/assembly/JoinUsQR.jsx.
const MAIN_SITE = process.env.NEXT_PUBLIC_APP_URL || ''

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
  headline: '',
  resumeSummary: '',
  bannerImageUrl: '',
  availability: '',
  openToWork: false,
  skills: [],
  languages: [],
  experience: [],
  education: [],
  projects: [],
  team: [],
  editContacts: [],
  editStrict: false,
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
  portfolioImages: [],
  licenseNumber: '',
  preferredContact: 'PHONE',
}

const sanitizePhone = (value) => (value || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')

/**
 * Full listing form for /yellowpages/register (create) and /yellowpages/manage (edit). Shared
 * fields live here; the type-specific portfolio fields are delegated to IndividualFields /
 * BusinessFields. Client-validates only the required minimum — the server's field-level
 * `errors` response is the source of truth and is merged into formErrors on submit.
 */
export default function ListingForm({ initialValues, onSuccess, mode = 'create', listingId, ownerContact, editToken }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues })
  const [formErrors, setFormErrors] = useState({})
  const [assemblies, setAssemblies] = useState([])
  const [status, setStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')
  const [memberCheck, setMemberCheck] = useState({ status: 'idle', member: null })

  useEffect(() => {
    fetch('/api/assemblies')
      .then((res) => res.json())
      .then((data) => setAssemblies(Array.isArray(data) ? data : []))
      .catch(() => setAssemblies([]))
  }, [])

  const assemblyName = assemblies.find((a) => a.slug === form.assemblySlug)?.name
  const trimmedPhone = form.phone.trim()
  const trimmedEmail = form.email.trim()
  const canCheckMembership =
    mode !== 'edit' && !!form.assemblySlug && (isValidPhone(trimmedPhone) || isValidEmail(trimmedEmail))

  useEffect(() => {
    if (!canCheckMembership) return
    let cancelled = false
    const timeout = setTimeout(async () => {
      if (cancelled) return
      setMemberCheck({ status: 'checking', member: null })
      try {
        const res = await fetch('/api/yellowpages/member-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assemblySlug: form.assemblySlug,
            phone: isValidPhone(trimmedPhone) ? trimmedPhone : undefined,
            email: isValidEmail(trimmedEmail) ? trimmedEmail : undefined,
          }),
        })
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) { setMemberCheck({ status: 'idle', member: null }); return }
        setMemberCheck({ status: data.found ? 'matched' : 'unmatched', member: data.member || null })
      } catch {
        if (!cancelled) setMemberCheck({ status: 'idle', member: null })
      }
    }, 500)
    return () => { cancelled = true; clearTimeout(timeout) }
  }, [canCheckMembership, form.assemblySlug, trimmedPhone, trimmedEmail])

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
    if (!form.phone.trim()) errors.phone = 'Phone number is required.'
    if (!form.category) errors.category = 'Please choose a category.'
    if (!form.description.trim()) errors.description = 'A short description is required.'
    if (form.editStrict && (form.editContacts || []).length === 0) {
      errors.editStrict = 'Add at least one editor contact, or turn this off.'
    }
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

    const payload = {
      ...form,
      yearsInOperation: form.yearsInOperation === '' ? null : Number(form.yearsInOperation),
      ...(mode === 'edit'
        ? { editToken, ownerPhone: ownerContact?.phone, ownerEmail: ownerContact?.email }
        : {}),
    }
    const url = mode === 'edit' ? `/api/yellowpages/listings/${listingId}` : '/api/yellowpages/listings'
    const method = mode === 'edit' ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      <ProfileCompleteness listing={form} />

      <div>
        <span className="yp-label">I am registering *</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={!isBusiness}
            onClick={() => set('listingType')('INDIVIDUAL')}
            disabled={mode === 'edit'}
            className="yp-card p-3 text-sm font-semibold text-center break-words disabled:opacity-60"
            style={!isBusiness ? { borderColor: 'var(--yp-yellow-600)', background: 'var(--yp-yellow-100)' } : undefined}
          >
            A professional / skill I offer
          </button>
          <button
            type="button"
            aria-pressed={isBusiness}
            onClick={() => set('listingType')('BUSINESS')}
            disabled={mode === 'edit'}
            className="yp-card p-3 text-sm font-semibold text-center break-words disabled:opacity-60"
            style={isBusiness ? { borderColor: 'var(--yp-yellow-600)', background: 'var(--yp-yellow-100)' } : undefined}
          >
            A business / organization
          </button>
        </div>
      </div>

      <div>
        <label className="yp-label" htmlFor="yp-name">{fieldLabel(form.listingType, 'name', 'Name')} *</label>
        <input id="yp-name" className="yp-input" value={form.name} onChange={(e) => set('name')(e.target.value)} />
        <FieldError message={formErrors.name} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="yp-label" htmlFor="yp-phone">Phone *</label>
          <input id="yp-phone" className="yp-input" type="tel" value={form.phone} onChange={(e) => set('phone')(sanitizePhone(e.target.value))} />
          <FieldError message={formErrors.phone} />
        </div>
        <div>
          <label className="yp-label" htmlFor="yp-whatsapp">WhatsApp</label>
          <input id="yp-whatsapp" className="yp-input" type="tel" placeholder="If different from phone" value={form.whatsapp} onChange={(e) => set('whatsapp')(sanitizePhone(e.target.value))} />
          <FieldError message={formErrors.whatsapp} />
        </div>
        <div>
          <label className="yp-label" htmlFor="yp-email">Email</label>
          <input id="yp-email" className="yp-input" type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} />
          <FieldError message={formErrors.email} />
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
          <FieldError message={formErrors.category} />
        </div>
        <div>
          <label className="yp-label" htmlFor="yp-subCategory">{isBusiness ? 'Sub-Sector' : 'Profession'}</label>
          <input id="yp-subCategory" className="yp-input" placeholder="e.g. Travel Agency, Plumbing, Architecture" value={form.subCategory} onChange={(e) => set('subCategory')(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="yp-label" htmlFor="yp-description">
          {isBusiness ? 'About the Business' : 'Description'} *{' '}
          <span className="font-normal text-xs" style={{ color: 'var(--yp-ink-soft)' }}>({form.description.length}/{MAX_DESCRIPTION_CHARS})</span>
        </label>
        <textarea id="yp-description" className="yp-textarea" maxLength={MAX_DESCRIPTION_CHARS} value={form.description} onChange={(e) => set('description')(e.target.value)} />
        <FieldError message={formErrors.description} />
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
          <select id="yp-country" className="yp-select" value={form.country} onChange={(e) => set('country')(e.target.value)}>
            <option value="">Select country</option>
            {form.country && !COUNTRY_NAMES.includes(form.country) && (
              <option value={form.country}>{form.country}</option>
            )}
            {COUNTRY_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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

        {canCheckMembership && memberCheck.status !== 'idle' && (
          <div className="mt-2 text-xs" role="status">
            {memberCheck.status === 'checking' && (
              <p className="flex items-center gap-1.5" style={{ color: 'var(--yp-ink-soft)' }}>
                <Loader2 size={12} className="animate-spin" /> Checking your membership…
              </p>
            )}
            {memberCheck.status === 'matched' && (
              <p className="flex items-start gap-1.5" style={{ color: 'var(--yp-yellow-700)' }}>
                <CheckCircle2 size={13} className="mt-px shrink-0" />
                <span>
                  {memberCheck.member
                    ? <>We found your membership — <strong>{memberCheck.member.firstName} {memberCheck.member.lastName}</strong>. </>
                    : <>We found your membership record. </>}
                  This listing will be linked to your member profile.
                </span>
              </p>
            )}
            {memberCheck.status === 'unmatched' && (
              <p className="flex items-start gap-1.5" style={{ color: 'var(--yp-ink-soft)' }}>
                <AlertCircle size={13} className="mt-px shrink-0" />
                <span>
                  No membership record found at {assemblyName || 'this assembly'} for that phone or email.
                  You don&rsquo;t need to be a member to list here — but if you are one,{' '}
                  <a
                    href={`${MAIN_SITE}/${form.assemblySlug}/join`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold"
                    style={{ color: 'var(--yp-yellow-700)' }}
                  >
                    register as a member
                  </a>{' '}
                  first so your listing links to your profile.
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {isBusiness
        ? <BusinessFields form={form} setField={set} setForm={setForm} errors={formErrors} />
        : <IndividualFields form={form} setField={set} setForm={setForm} errors={formErrors} />}

      <div>
        <label className="yp-label" htmlFor="yp-website">Website</label>
        <input id="yp-website" className="yp-input" placeholder="https://…" value={form.website} onChange={(e) => set('website')(e.target.value)} />
        <FieldError message={formErrors.website} />
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

      <div className="yp-card p-4 space-y-3">
        <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--yp-ink)' }}>
          <ShieldCheck size={16} style={{ color: 'var(--yp-yellow-600)' }} /> Who can edit this listing
        </p>
        <p className="text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
          By default the phone number and email above can request an edit code. Add extra emails or
          phone numbers here if other people {isBusiness ? '(e.g. teammates) ' : ''}should be able to edit too.
        </p>
        <TagInput
          id="yp-editContacts"
          label={isBusiness ? 'Additional editors' : 'Designated editor (optional)'}
          values={form.editContacts || []}
          onChange={set('editContacts')}
          max={MAX_EDIT_CONTACTS}
          error={formErrors.editContacts}
          placeholder="email@example.com or a phone number"
        />
        <label className="flex items-start gap-2 text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
          <input type="checkbox" className="mt-0.5" checked={Boolean(form.editStrict)} onChange={(e) => set('editStrict')(e.target.checked)} />
          <span>Only the people above can edit — my public phone/email will <strong>not</strong> grant edit access.</span>
        </label>
        <FieldError message={formErrors.editStrict} />
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
        {status === 'loading' ? 'Saving…' : mode === 'edit' ? 'Save Changes' : isBusiness ? 'List My Business' : 'Create My Portfolio'}
      </button>
    </form>
  )
}
