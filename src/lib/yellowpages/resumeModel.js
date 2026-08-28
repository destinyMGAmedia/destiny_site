// Canonical résumé model — the single source of truth the on-screen HTML preview and all
// three PDF templates render from. Framework-agnostic (no React / Node-only APIs).

export const RESUME_TEMPLATES = ['CLASSIC', 'COMPACT', 'MODERN']
export const RESUME_LOCALES = ['US', 'UK']

const clean = (v) => (typeof v === 'string' ? v.trim() : '')
const arr = (v) => (Array.isArray(v) ? v : [])
const nonEmpty = (o) => o && typeof o === 'object' && Object.keys(o).length > 0

export function normalizeTemplate(v) {
  return RESUME_TEMPLATES.includes(v) ? v : 'CLASSIC'
}

// Nigeria and the UK use "CV" + British spelling/date conventions; the US uses "Résumé" +
// American conventions. Everything else defaults to US (with the toggle to override).
export function normalizeLocale(v, country) {
  if (RESUME_LOCALES.includes(v)) return v
  const c = (country || '').toLowerCase()
  if (/united kingdom|britain|england|scotland|wales|northern ireland|\buk\b/.test(c)) return 'UK'
  if (/nigeria/.test(c)) return 'UK'
  return 'US'
}

export function localeConfig(locale) {
  const L = normalizeLocale(locale)
  return L === 'UK'
    ? { locale: 'UK', docWord: 'CV', fileWord: 'cv', spelling: 'British', experienceHeading: 'Professional Experience' }
    : { locale: 'US', docWord: 'Résumé', fileWord: 'resume', spelling: 'American', experienceHeading: 'Work Experience' }
}

function dateRange(start, end, current) {
  const s = clean(start)
  const e = current ? 'Present' : clean(end)
  if (s && e) return `${s} – ${e}`
  return s || e || ''
}

// Split a free-text description into bullet-ish lines (newlines or "• " / "- " markers).
function toBullets(text) {
  const t = clean(text)
  if (!t) return []
  return t
    .split(/\n+|(?:^|\s)[•\-*]\s+/)
    .map((s) => s.trim().replace(/^[•\-*]\s*/, ''))
    .filter(Boolean)
}

/**
 * @param {object} listing  a YellowPagesListing (INDIVIDUAL)
 * @param {{ template?: string, locale?: string }} opts
 */
export function buildResumeModel(listing = {}, opts = {}) {
  const template = normalizeTemplate(opts.template || listing.resumeTemplate)
  const lc = localeConfig(opts.locale || listing.resumeLocale || normalizeLocale(null, listing.country))

  const ai = listing.resumeUseAi && nonEmpty(listing.resumeAiContent) ? listing.resumeAiContent : null

  const name = clean(listing.name) || lc.docWord
  const headline = clean(ai?.headline) || clean(listing.headline)
  const summary = clean(ai?.summary) || clean(listing.resumeSummary) || clean(listing.description)

  const location = [listing.city, listing.state, listing.country].map(clean).filter(Boolean).join(', ')
  const socialLinks = Object.entries(listing.socialLinks || {})
    .filter(([, v]) => v)
    .map(([k, v]) => ({ label: k, value: clean(v) }))

  const rawExperience = arr(listing.experience)
  const experience = rawExperience.map((x, i) => {
    const aiEntry = ai && Array.isArray(ai.experience) ? ai.experience[i] : null
    const bullets = aiEntry && Array.isArray(aiEntry.bullets) && aiEntry.bullets.length
      ? aiEntry.bullets.map(clean).filter(Boolean)
      : toBullets(x.description)
    return {
      title: clean(aiEntry?.title) || clean(x.title),
      organization: clean(aiEntry?.organization) || clean(x.organization),
      location: clean(x.location),
      dateRange: dateRange(x.startDate, x.endDate, x.current),
      bullets,
    }
  })

  const education = arr(listing.education).map((x) => ({
    heading: [clean(x.degree), clean(x.field)].filter(Boolean).join(', ') || clean(x.school),
    org: clean(x.degree) || clean(x.field) ? clean(x.school) : '',
    meta: dateRange(x.startYear, x.endYear),
    description: clean(x.description),
  }))

  const projects = arr(listing.projects).map((x) => ({
    heading: [clean(x.name), clean(x.role)].filter(Boolean).join(' — '),
    url: clean(x.url),
    description: clean(x.description),
  }))

  const skills = (ai && Array.isArray(ai.skills) && ai.skills.length ? ai.skills : arr(listing.skills)).map(clean).filter(Boolean)
  const languages = (ai && Array.isArray(ai.languages) && ai.languages.length ? ai.languages : arr(listing.languages)).map(clean).filter(Boolean)
  const certifications = clean(ai?.certifications) || clean(listing.certifications)

  return {
    template,
    ...lc,
    name,
    headline,
    summary,
    contact: {
      email: clean(listing.email),
      phone: clean(listing.phone),
      location,
      website: clean(listing.website),
      links: socialLinks,
    },
    experience,
    education,
    projects,
    skills,
    languages,
    certifications,
    aiApplied: Boolean(ai),
  }
}

/** ATS-critical things still missing — surfaced on the preview page as "add these" prompts. */
export function resumeGaps(model) {
  const gaps = []
  if (!model.summary) gaps.push({ key: 'summary', label: 'A professional summary', anchor: 'yp-resumeSummary' })
  if (model.experience.length === 0) {
    gaps.push({ key: 'experience', label: 'At least one work experience entry', anchor: 'yp-experience' })
  } else {
    if (model.experience.some((e) => !e.dateRange)) gaps.push({ key: 'dates', label: 'Start/end dates on every role', anchor: 'yp-experience' })
    if (model.experience.some((e) => e.bullets.length === 0)) gaps.push({ key: 'bullets', label: 'What you did in each role (bullet points)', anchor: 'yp-experience' })
  }
  if (model.education.length === 0) gaps.push({ key: 'education', label: 'Education history', anchor: 'yp-education' })
  if (model.skills.length === 0) gaps.push({ key: 'skills', label: 'A list of skills', anchor: 'yp-skills' })
  if (!model.contact.email && !model.contact.phone) gaps.push({ key: 'contact', label: 'An email or phone number', anchor: 'yp-email' })
  return gaps
}

export function resumeFileName(model) {
  const base = (model.name || model.fileWord || 'resume')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
  return `${base || 'resume'}-${model.fileWord}.pdf`
}
