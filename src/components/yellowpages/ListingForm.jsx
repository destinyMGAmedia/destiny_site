'use client'
import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import { CATEGORIES, PREFERRED_CONTACTS, MAX_DESCRIPTION_CHARS, MAX_EDIT_CONTACTS, fieldLabel } from '@/lib/yellowpages/constants'
import { isValidPhone, isValidEmail } from '@/lib/yellowpages/validation'
import { COUNTRY_NAMES } from '@/lib/yellowpages/phone'
import ProfileCompleteness from './ProfileCompleteness'
import IndividualFields from './forms/IndividualFields'
import BusinessFields from './forms/BusinessFields'
import CvImportField from './forms/CvImportField'
import ExtraCategoriesField from './forms/ExtraCategoriesField'
import TagInput from './forms/TagInput'
import { FieldError } from './forms/Field'

// Fields the CV importer can fill on an INDIVIDUAL listing.
const CV_SCALARS = ['name', 'headline', 'certifications', 'email', 'phone', 'city', 'state', 'country', 'website']
const CV_ARRAYS = ['skills', 'languages', 'experience', 'education', 'projects']

const mapCvExperience = (list = []) =>
  list.map((e) => ({
    title: e.title || '',
    organization: e.organization || '',
    location: e.location || '',
    startDate: e.startDate || '',
    endDate: e.endDate || '',
    current: Boolean(e.current),
    description: (e.bullets || []).filter(Boolean).join('\n'),
  }))
const mapCvEducation = (list = []) =>
  list.map((e) => ({
    school: e.school || '',
    degree: e.degree || '',
    field: e.field || '',
    startYear: e.startYear || '',
    endYear: e.endYear || '',
    description: e.description || '',
  }))
const mapCvProjects = (list = []) =>
  list.map((p) => ({ name: p.name || '', role: p.role || '', url: p.url || '', description: p.description || '', imageUrls: [] }))

/** Does the form already hold data the CV import might overwrite? */
function formHasCvContent(form) {
  if (form.description && form.description.trim()) return true
  if (CV_SCALARS.some((k) => (form[k] || '').trim())) return true
  if (CV_ARRAYS.some((k) => (form[k] || []).length > 0)) return true
  if (Object.values(form.socialLinks || {}).some(Boolean)) return true
  return false
}

function cvFillSummary(parsed) {
  const bits = []
  if (parsed.headline) bits.push('headline')
  if (parsed.summary) bits.push('summary')
  if (parsed.skills?.length) bits.push(`${parsed.skills.length} skills`)
  if (parsed.experience?.length) bits.push(`${parsed.experience.length} role${parsed.experience.length === 1 ? '' : 's'}`)
  if (parsed.education?.length) bits.push(`${parsed.education.length} qualification${parsed.education.length === 1 ? '' : 's'}`)
  if (parsed.projects?.length) bits.push(`${parsed.projects.length} project${parsed.projects.length === 1 ? '' : 's'}`)
  if (parsed.languages?.length) bits.push('languages')
  return bits.length ? bits.join(', ') : 'your contact details'
}

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
  categories: [],
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

  // CV import (INDIVIDUAL only)
  const [cvPending, setCvPending] = useState(null)
  const [cvMsg, setCvMsg] = useState('')

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (formErrors[field]) setFormErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
  }

  const setSocial = (key) => (value) => {
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }))
  }

  const applyCv = (parsed, cvMode) => {
    setForm((f) => {
      const keep = (cur, inc) => (cvMode === 'replace' ? (inc || '') || cur : cur || (inc || ''))
      const keepArr = (cur, inc) => {
        const incoming = inc || []
        return cvMode === 'replace' ? (incoming.length ? incoming : cur) : (cur && cur.length ? cur : incoming)
      }
      const socials =
        cvMode === 'replace'
          ? { ...f.socialLinks, ...(parsed.socialLinks || {}) }
          : { ...(parsed.socialLinks || {}), ...f.socialLinks }
      return {
        ...f,
        name: keep(f.name, parsed.name),
        headline: keep(f.headline, parsed.headline),
        description: keep(f.description, parsed.summary),
        certifications: keep(f.certifications, parsed.certifications),
        email: keep(f.email, parsed.email),
        phone: keep(f.phone, parsed.phone),
        city: keep(f.city, parsed.city),
        state: keep(f.state, parsed.state),
        country: keep(f.country, parsed.country),
        website: keep(f.website, parsed.website),
        socialLinks: socials,
        skills: keepArr(f.skills, parsed.skills),
        languages: keepArr(f.languages, parsed.languages),
        experience: keepArr(f.experience, mapCvExperience(parsed.experience)),
        education: keepArr(f.education, mapCvEducation(parsed.education)),
        projects: keepArr(f.projects, mapCvProjects(parsed.projects)),
      }
    })
    setFormErrors({})
    setCvPending(null)
    setCvMsg(`Filled from your CV: ${cvFillSummary(parsed)}. Review below and add anything missing.`)
  }

  const handleCvParsed = (parsed) => {
    if (!parsed) return
    setCvMsg('')
    if (formHasCvContent(form)) setCvPending(parsed)
    else applyCv(parsed, 'replace')
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

      {!isBusiness && (
        <div className="space-y-3">
          <CvImportField onParsed={handleCvParsed} />

          {cvPending && (
            <div className="yp-card p-4" style={{ borderColor: 'var(--yp-yellow-600)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--yp-ink)' }}>
                Your form already has some details
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--yp-ink-soft)' }}>
                How should we use what we read from your CV?
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" onClick={() => applyCv(cvPending, 'replace')} className="yp-btn-primary !py-1.5 !px-3 text-sm">
                  Replace with the CV
                </button>
                <button type="button" onClick={() => applyCv(cvPending, 'fillBlanks')} className="yp-btn-outline !py-1.5 !px-3 text-sm">
                  Only fill empty fields
                </button>
                <button type="button" onClick={() => setCvPending(null)} className="text-sm underline px-2" style={{ color: 'var(--yp-ink-soft)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {cvMsg && (
            <p className="flex items-start gap-1.5 text-sm" style={{ color: 'var(--yp-yellow-700)' }}>
              <Sparkles size={14} className="mt-px shrink-0" /> {cvMsg}
            </p>
          )}
        </div>
      )}

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

      <div className={isBusiness ? 'grid sm:grid-cols-2 gap-4' : ''}>
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
        {isBusiness && (
          <div>
            <label className="yp-label" htmlFor="yp-subCategory">Sub-Sector</label>
            <input id="yp-subCategory" className="yp-input" placeholder="e.g. Travel Agency, Logistics, Architecture" value={form.subCategory} onChange={(e) => set('subCategory')(e.target.value)} />
          </div>
        )}
      </div>

      {isBusiness && (
        <ExtraCategoriesField
          primary={form.category}
          values={form.categories || []}
          onChange={set('categories')}
          error={formErrors.categories}
        />
      )}

      <div>
        <label className="yp-label" htmlFor="yp-description">
          {isBusiness ? 'About the Business' : 'Professional Summary'} *{' '}
          <span className="font-normal text-xs" style={{ color: 'var(--yp-ink-soft)' }}>({form.description.length}/{MAX_DESCRIPTION_CHARS})</span>
        </label>
        <textarea
          id="yp-description"
          className="yp-textarea"
          rows={isBusiness ? 3 : 4}
          maxLength={MAX_DESCRIPTION_CHARS}
          placeholder={isBusiness ? '' : 'A short paragraph about your experience, focus, and what you’re looking for. This is used on your portfolio and as the summary on your exported résumé.'}
          value={form.description}
          onChange={(e) => set('description')(e.target.value)}
        />
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
