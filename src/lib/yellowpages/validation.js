// Shared validators for The Yellow Pages public forms/routes. Mirrors the validation style
// already used in src/app/(public)/[slug]/join/page.jsx (sanitizePhone/isValidPhone/isValidEmail).

import { LISTING_TYPES, PREFERRED_CONTACTS, CATEGORY_VALUES, SOCIAL_LINK_KEYS, MAX_DESCRIPTION_CHARS, MAX_PORTFOLIO_IMAGES } from './constants'

export const sanitizePhone = (value) => (value || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
export const isValidPhone = (value) => /^\+?\d{7,15}$/.test((value || '').trim())
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim())
// Light validation only — the field is optional and free-form; just reject obviously-not-a-URL input.
export const isValidUrl = (value) => /^https?:\/\/.+\..+/i.test((value || '').trim())

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
      subCategory: (body.subCategory || '').trim() || null,
      description,
      servicesOffered: (body.servicesOffered || '').trim() || null,
      city: (body.city || '').trim() || null,
      state: (body.state || '').trim() || null,
      country: (body.country || '').trim() || null,
      website: website || null,
      socialLinks,
      yearsInOperation,
      certifications: (body.certifications || '').trim() || null,
      logoUrl: (body.logoUrl || '').trim() || null,
      photoUrl: (body.photoUrl || '').trim() || null,
      portfolioImages,
      licenseNumber: (body.licenseNumber || '').trim() || null,
      preferredContact,
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
