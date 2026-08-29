// Shared validators for The Yellow Pages public forms/routes. Mirrors the validation style
// already used in src/app/(public)/[slug]/join/page.jsx (sanitizePhone/isValidPhone/isValidEmail).

import {
  LISTING_TYPES,
  PREFERRED_CONTACTS,
  CATEGORY_VALUES,
  MAX_EXTRA_CATEGORIES,
  SOCIAL_LINK_KEYS,
  MAX_DESCRIPTION_CHARS,
  MAX_PORTFOLIO_IMAGES,
  MAX_SKILLS,
  MAX_LANGUAGES,
  MAX_EXPERIENCE,
  MAX_EDUCATION,
  MAX_PROJECTS,
  MAX_TEAM,
  MAX_EDIT_CONTACTS,
  MAX_HEADLINE_CHARS,
  MAX_SUMMARY_CHARS,
} from './constants'
import { resolveDialCode } from './phone'

export const sanitizePhone = (value) => (value || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
export const isValidPhone = (value) => /^\+?\d{7,15}$/.test((value || '').trim())
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim())
// Light validation only — the field is optional and free-form; just reject obviously-not-a-URL input.
export const isValidUrl = (value) => /^https?:\/\/.+\..+/i.test((value || '').trim())

const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Trimmed, de-duped, capped list of non-empty short strings (skills, languages). */
function parseStringList(value, max, itemMax = 80) {
  if (value === undefined || value === null) return { list: [], error: null }
  if (!Array.isArray(value)) return { list: [], error: 'Expected a list.' }
  const seen = new Set()
  const list = []
  for (const raw of value) {
    const s = str(raw, itemMax)
    const key = s.toLowerCase()
    if (!s || seen.has(key)) continue
    seen.add(key)
    list.push(s)
  }
  if (list.length > max) return { list: list.slice(0, max), error: `Add up to ${max}.` }
  return { list, error: null }
}

/** Generic array-of-objects parser: trims each field, drops rows that fail `keep`, caps count. */
function parseObjectList(value, max, fields, keep) {
  if (value === undefined || value === null) return { list: [], error: null }
  if (!Array.isArray(value)) return { list: [], error: 'Expected a list.' }
  const list = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const row = {}
    for (const [name, opts] of Object.entries(fields)) {
      if (opts.type === 'bool') row[name] = Boolean(raw[name])
      else if (opts.type === 'stringList') row[name] = parseStringList(raw[name], opts.max || 12, opts.itemMax || 400).list
      else row[name] = str(raw[name], opts.max || 300)
    }
    if (keep(row)) list.push(row)
  }
  if (list.length > max) return { list: list.slice(0, max), error: `Add up to ${max}.` }
  return { list, error: null }
}

const EXPERIENCE_FIELDS = {
  title: { max: 160 },
  organization: { max: 160 },
  location: { max: 160 },
  startDate: { max: 40 },
  endDate: { max: 40 },
  current: { type: 'bool' },
  description: { max: 1500 },
}
const EDUCATION_FIELDS = {
  school: { max: 200 },
  degree: { max: 160 },
  field: { max: 160 },
  startYear: { max: 20 },
  endYear: { max: 20 },
  description: { max: 1000 },
}
const PROJECT_FIELDS = {
  name: { max: 200 },
  role: { max: 160 },
  url: { max: 400 },
  description: { max: 1500 },
  imageUrls: { type: 'stringList', max: MAX_PORTFOLIO_IMAGES, itemMax: 400 },
}
const TEAM_FIELDS = {
  name: { max: 160 },
  role: { max: 160 },
  photoUrl: { max: 400 },
  linkedListingId: { max: 40 },
}

export const parseExperience = (v) => parseObjectList(v, MAX_EXPERIENCE, EXPERIENCE_FIELDS, (r) => r.title || r.organization)
export const parseEducation = (v) => parseObjectList(v, MAX_EDUCATION, EDUCATION_FIELDS, (r) => r.school || r.degree)
export const parseProjects = (v) => parseObjectList(v, MAX_PROJECTS, PROJECT_FIELDS, (r) => r.name)
export const parseTeam = (v) => parseObjectList(v, MAX_TEAM, TEAM_FIELDS, (r) => r.name)

/** Normalizes a list of extra editor contacts — each must be a valid phone or email. */
export function parseEditContacts(value) {
  if (value === undefined || value === null) return { list: [], error: null }
  if (!Array.isArray(value)) return { list: [], error: 'Expected a list.' }
  const seen = new Set()
  const list = []
  for (const raw of value) {
    const trimmed = typeof raw === 'string' ? raw.trim() : ''
    if (!trimmed) continue
    let normalized = null
    if (trimmed.includes('@')) {
      if (!isValidEmail(trimmed)) return { list, error: `"${trimmed}" is not a valid email.` }
      normalized = trimmed.toLowerCase()
    } else {
      const phone = sanitizePhone(trimmed)
      if (!isValidPhone(phone)) return { list, error: `"${trimmed}" is not a valid phone number.` }
      normalized = phone
    }
    if (seen.has(normalized)) continue
    seen.add(normalized)
    list.push(normalized)
  }
  if (list.length > MAX_EDIT_CONTACTS) return { list: list.slice(0, MAX_EDIT_CONTACTS), error: `Add up to ${MAX_EDIT_CONTACTS} editor contacts.` }
  return { list, error: null }
}

/**
 * Validates a listing submission body. Returns { errors, data } — `data` is only populated
 * (with trimmed/normalized values) when `errors` is empty.
 */
export function validateListingInput(body = {}) {
  const errors = {}

  const listingType = body.listingType
  if (!LISTING_TYPES.includes(listingType)) {
    errors.listingType = 'Please choose whether this is an individual skill or a business listing.'
  }

  const name = (body.name || '').trim()
  if (!name) {
    errors.name = listingType === 'BUSINESS' ? 'Business/organization name is required.' : 'Your name is required.'
  }

  // Optional even for BUSINESS — deferred to the "complete your profile" flow after creation,
  // so the initial form only asks for what's truly needed to make the listing useful.
  const contactPersonName = (body.contactPersonName || '').trim()

  const phone = sanitizePhone(body.phone)
  if (!phone) {
    errors.phone = 'Phone number is required.'
  } else if (!isValidPhone(phone)) {
    errors.phone = 'Enter a valid phone number (digits only, 7–15 digits).'
  }

  const whatsapp = body.whatsapp ? sanitizePhone(body.whatsapp) : ''
  if (whatsapp && !isValidPhone(whatsapp)) {
    errors.whatsapp = 'Enter a valid WhatsApp number (digits only, 7–15 digits).'
  }

  const email = (body.email || '').trim()
  if (email && !isValidEmail(email)) {
    errors.email = 'Enter a valid email address.'
  }

  const category = body.category
  if (!CATEGORY_VALUES.includes(category)) {
    errors.category = 'Please choose a valid category.'
  }

  // Extra categories — BUSINESS only. Valid enum values, de-duped, never repeating the primary.
  let categories = []
  if (listingType === 'BUSINESS' && body.categories !== undefined) {
    if (!Array.isArray(body.categories)) {
      errors.categories = 'Invalid categories.'
    } else {
      const seen = new Set([category])
      for (const c of body.categories) {
        if (!CATEGORY_VALUES.includes(c)) {
          errors.categories = 'One of the extra categories is not valid.'
          break
        }
        if (seen.has(c)) continue
        seen.add(c)
        categories.push(c)
      }
      if (!errors.categories && categories.length > MAX_EXTRA_CATEGORIES) {
        errors.categories = `Add up to ${MAX_EXTRA_CATEGORIES} extra categories.`
      }
    }
  }

  const description = (body.description || '').trim()
  if (!description) {
    errors.description = 'A short description is required.'
  } else if (description.length > MAX_DESCRIPTION_CHARS) {
    errors.description = `Description must be ${MAX_DESCRIPTION_CHARS} characters or fewer (about 150 words).`
  }

  const website = (body.website || '').trim()
  if (website && !isValidUrl(website)) {
    errors.website = 'Enter a valid website URL (starting with http:// or https://).'
  }

  const preferredContact = body.preferredContact || 'PHONE'
  if (!PREFERRED_CONTACTS.includes(preferredContact)) {
    errors.preferredContact = 'Invalid preferred contact method.'
  }

  let yearsInOperation = null
  if (body.yearsInOperation !== undefined && body.yearsInOperation !== null && body.yearsInOperation !== '') {
    const n = Number(body.yearsInOperation)
    if (!Number.isInteger(n) || n < 0 || n > 150) {
      errors.yearsInOperation = 'Years in operation must be a whole number between 0 and 150.'
    } else {
      yearsInOperation = n
    }
  }

  const socialLinks = {}
  if (body.socialLinks && typeof body.socialLinks === 'object') {
    for (const key of SOCIAL_LINK_KEYS) {
      const value = body.socialLinks[key]
      if (typeof value === 'string' && value.trim()) socialLinks[key] = value.trim()
    }
  }

  // Work/personal photos for the timeline feed — images only (Cloudinary URLs), no video.
  let portfolioImages = []
  if (body.portfolioImages !== undefined) {
    if (!Array.isArray(body.portfolioImages)) {
      errors.portfolioImages = 'Invalid photos.'
    } else {
      portfolioImages = body.portfolioImages.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim())
      if (portfolioImages.length > MAX_PORTFOLIO_IMAGES) {
        errors.portfolioImages = `You can add up to ${MAX_PORTFOLIO_IMAGES} photos.`
      }
    }
  }

  // ── Portfolio fields (individual-flavoured, but stored for both types) ────────────
  const headline = str(body.headline, MAX_HEADLINE_CHARS)
  const resumeSummary = str(body.resumeSummary, MAX_SUMMARY_CHARS)
  const bannerImageUrl = str(body.bannerImageUrl, 400)
  const availability = str(body.availability, 120)
  const openToWork = Boolean(body.openToWork)

  const skillsParsed = parseStringList(body.skills, MAX_SKILLS)
  if (skillsParsed.error) errors.skills = skillsParsed.error
  const languagesParsed = parseStringList(body.languages, MAX_LANGUAGES)
  if (languagesParsed.error) errors.languages = languagesParsed.error

  const experienceParsed = parseExperience(body.experience)
  if (experienceParsed.error) errors.experience = experienceParsed.error
  const educationParsed = parseEducation(body.education)
  if (educationParsed.error) errors.education = educationParsed.error
  const projectsParsed = parseProjects(body.projects)
  if (projectsParsed.error) errors.projects = projectsParsed.error
  const teamParsed = parseTeam(body.team)
  if (teamParsed.error) errors.team = teamParsed.error

  const editContactsParsed = parseEditContacts(body.editContacts)
  if (editContactsParsed.error) errors.editContacts = editContactsParsed.error
  const editStrict = Boolean(body.editStrict)
  if (editStrict && editContactsParsed.list.length === 0) {
    errors.editStrict = 'Add at least one editor contact before restricting edit access to them only.'
  }

  if (Object.keys(errors).length > 0) {
    return { errors, data: null }
  }

  return {
    errors: null,
    data: {
      listingType,
      name,
      contactPersonName: contactPersonName || (listingType === 'INDIVIDUAL' ? name : null) || null,
      position: (body.position || '').trim() || null,
      phone,
      whatsapp: whatsapp || null,
      email: email || null,
      category,
      categories,
      subCategory: (body.subCategory || '').trim() || null,
      description,
      servicesOffered: (body.servicesOffered || '').trim() || null,
      city: (body.city || '').trim() || null,
      state: (body.state || '').trim() || null,
      country: (body.country || '').trim() || null,
      // Derived from `country` so wa.me / tel: links and display formatting have a calling
      // code to work with even when the phone was entered in local national format.
      countryDialCode: resolveDialCode((body.country || '').trim()),
      website: website || null,
      socialLinks,
      yearsInOperation,
      certifications: (body.certifications || '').trim() || null,
      logoUrl: (body.logoUrl || '').trim() || null,
      photoUrl: (body.photoUrl || '').trim() || null,
      portfolioImages,
      licenseNumber: (body.licenseNumber || '').trim() || null,
      preferredContact,
      headline: headline || null,
      resumeSummary: resumeSummary || null,
      bannerImageUrl: bannerImageUrl || null,
      availability: availability || null,
      openToWork,
      skills: skillsParsed.list,
      languages: languagesParsed.list,
      experience: experienceParsed.list,
      education: educationParsed.list,
      projects: projectsParsed.list,
      team: teamParsed.list,
      editContacts: editContactsParsed.list,
      editStrict,
    },
  }
}

/**
 * Validates a rating submission body ({ stars, comment, reviewerName, phone, email }).
 * Returns { errors, data } like validateListingInput.
 */
export function validateRatingInput(body = {}) {
  const errors = {}

  const stars = Number(body.stars)
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    errors.stars = 'Rating must be a whole number from 1 to 5.'
  }

  const reviewerName = (body.reviewerName || '').trim()
  if (!reviewerName) {
    errors.reviewerName = 'Your name is required.'
  }

  const phone = body.phone ? sanitizePhone(body.phone) : ''
  const email = (body.email || '').trim()
  if (!phone && !email) {
    errors.contact = 'Please provide your phone number or email so we can verify your review.'
  } else if (phone && !isValidPhone(phone)) {
    errors.phone = 'Enter a valid phone number (digits only, 7–15 digits).'
  } else if (!phone && email && !isValidEmail(email)) {
    errors.email = 'Enter a valid email address.'
  }

  const comment = (body.comment || '').trim()

  if (Object.keys(errors).length > 0) {
    return { errors, data: null }
  }

  return {
    errors: null,
    data: {
      stars,
      reviewerName,
      comment: comment || null,
      // Prefer phone for the dedupe contact when both are given — see spec/theyellowpages.md
      // "Decisions" for why this is an intentional, documented simplification.
      contact: phone || email.toLowerCase(),
    },
  }
}

/** Derives the public-safe display name for a rating: "Jane D." from "Jane Doe", "Cher" from "Cher". */
export function publicReviewerName(reviewerName) {
  const parts = (reviewerName || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Anonymous'
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}
