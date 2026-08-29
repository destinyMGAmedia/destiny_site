// Phone-number helpers for The Yellow Pages. Pure + framework-agnostic (no Node/Edge APIs) so
// it is safe to import from API routes, server components, and client components alike.
//
// The problem this solves: people list a phone in local national format ("08012345678") with
// no country code. A `wa.me/08012345678` link is invalid — WhatsApp needs the full
// international number, digits only, no leading zero ("2348012345678"). We derive the calling
// code from the `country` the person selected on their listing (persisted as
// `countryDialCode`), and reuse it for tel: links and display too.

// name → E.164 calling code (digits only, no "+"). Covers every country a member plausibly
// lives in; anything unknown falls back to "best effort" (digits as-entered), i.e. no worse
// than before. Keep the ISO code so callers can map either way.
export const COUNTRIES = [
  { name: 'Nigeria', iso2: 'NG', dialCode: '234' },
  { name: 'Ghana', iso2: 'GH', dialCode: '233' },
  { name: 'Kenya', iso2: 'KE', dialCode: '254' },
  { name: 'South Africa', iso2: 'ZA', dialCode: '27' },
  { name: 'Cameroon', iso2: 'CM', dialCode: '237' },
  { name: 'Ivory Coast', iso2: 'CI', dialCode: '225' },
  { name: 'Senegal', iso2: 'SN', dialCode: '221' },
  { name: 'Tanzania', iso2: 'TZ', dialCode: '255' },
  { name: 'Uganda', iso2: 'UG', dialCode: '256' },
  { name: 'Rwanda', iso2: 'RW', dialCode: '250' },
  { name: 'Ethiopia', iso2: 'ET', dialCode: '251' },
  { name: 'Zambia', iso2: 'ZM', dialCode: '260' },
  { name: 'Zimbabwe', iso2: 'ZW', dialCode: '263' },
  { name: 'Botswana', iso2: 'BW', dialCode: '267' },
  { name: 'Namibia', iso2: 'NA', dialCode: '264' },
  { name: 'Malawi', iso2: 'MW', dialCode: '265' },
  { name: 'Mozambique', iso2: 'MZ', dialCode: '258' },
  { name: 'Angola', iso2: 'AO', dialCode: '244' },
  { name: 'Benin', iso2: 'BJ', dialCode: '229' },
  { name: 'Togo', iso2: 'TG', dialCode: '228' },
  { name: 'Burkina Faso', iso2: 'BF', dialCode: '226' },
  { name: 'Mali', iso2: 'ML', dialCode: '223' },
  { name: 'Niger', iso2: 'NE', dialCode: '227' },
  { name: 'Sierra Leone', iso2: 'SL', dialCode: '232' },
  { name: 'Liberia', iso2: 'LR', dialCode: '231' },
  { name: 'Gambia', iso2: 'GM', dialCode: '220' },
  { name: 'Guinea', iso2: 'GN', dialCode: '224' },
  { name: 'Democratic Republic of the Congo', iso2: 'CD', dialCode: '243' },
  { name: 'Republic of the Congo', iso2: 'CG', dialCode: '242' },
  { name: 'Gabon', iso2: 'GA', dialCode: '241' },
  { name: 'Egypt', iso2: 'EG', dialCode: '20' },
  { name: 'Morocco', iso2: 'MA', dialCode: '212' },
  { name: 'Algeria', iso2: 'DZ', dialCode: '213' },
  { name: 'Tunisia', iso2: 'TN', dialCode: '216' },
  { name: 'Sudan', iso2: 'SD', dialCode: '249' },
  { name: 'South Sudan', iso2: 'SS', dialCode: '211' },
  { name: 'Eswatini', iso2: 'SZ', dialCode: '268' },
  { name: 'Lesotho', iso2: 'LS', dialCode: '266' },
  { name: 'Mauritius', iso2: 'MU', dialCode: '230' },
  { name: 'United States', iso2: 'US', dialCode: '1' },
  { name: 'Canada', iso2: 'CA', dialCode: '1' },
  { name: 'United Kingdom', iso2: 'GB', dialCode: '44' },
  { name: 'Ireland', iso2: 'IE', dialCode: '353' },
  { name: 'Germany', iso2: 'DE', dialCode: '49' },
  { name: 'France', iso2: 'FR', dialCode: '33' },
  { name: 'Italy', iso2: 'IT', dialCode: '39' },
  { name: 'Spain', iso2: 'ES', dialCode: '34' },
  { name: 'Portugal', iso2: 'PT', dialCode: '351' },
  { name: 'Netherlands', iso2: 'NL', dialCode: '31' },
  { name: 'Belgium', iso2: 'BE', dialCode: '32' },
  { name: 'Switzerland', iso2: 'CH', dialCode: '41' },
  { name: 'Austria', iso2: 'AT', dialCode: '43' },
  { name: 'Sweden', iso2: 'SE', dialCode: '46' },
  { name: 'Norway', iso2: 'NO', dialCode: '47' },
  { name: 'Denmark', iso2: 'DK', dialCode: '45' },
  { name: 'Finland', iso2: 'FI', dialCode: '358' },
  { name: 'Poland', iso2: 'PL', dialCode: '48' },
  { name: 'Czech Republic', iso2: 'CZ', dialCode: '420' },
  { name: 'Greece', iso2: 'GR', dialCode: '30' },
  { name: 'Romania', iso2: 'RO', dialCode: '40' },
  { name: 'Hungary', iso2: 'HU', dialCode: '36' },
  { name: 'Russia', iso2: 'RU', dialCode: '7' },
  { name: 'Ukraine', iso2: 'UA', dialCode: '380' },
  { name: 'Turkey', iso2: 'TR', dialCode: '90' },
  { name: 'United Arab Emirates', iso2: 'AE', dialCode: '971' },
  { name: 'Saudi Arabia', iso2: 'SA', dialCode: '966' },
  { name: 'Qatar', iso2: 'QA', dialCode: '974' },
  { name: 'Kuwait', iso2: 'KW', dialCode: '965' },
  { name: 'Bahrain', iso2: 'BH', dialCode: '973' },
  { name: 'Oman', iso2: 'OM', dialCode: '968' },
  { name: 'Israel', iso2: 'IL', dialCode: '972' },
  { name: 'Lebanon', iso2: 'LB', dialCode: '961' },
  { name: 'Jordan', iso2: 'JO', dialCode: '962' },
  { name: 'India', iso2: 'IN', dialCode: '91' },
  { name: 'Pakistan', iso2: 'PK', dialCode: '92' },
  { name: 'Bangladesh', iso2: 'BD', dialCode: '880' },
  { name: 'China', iso2: 'CN', dialCode: '86' },
  { name: 'Hong Kong', iso2: 'HK', dialCode: '852' },
  { name: 'Japan', iso2: 'JP', dialCode: '81' },
  { name: 'South Korea', iso2: 'KR', dialCode: '82' },
  { name: 'Singapore', iso2: 'SG', dialCode: '65' },
  { name: 'Malaysia', iso2: 'MY', dialCode: '60' },
  { name: 'Indonesia', iso2: 'ID', dialCode: '62' },
  { name: 'Philippines', iso2: 'PH', dialCode: '63' },
  { name: 'Thailand', iso2: 'TH', dialCode: '66' },
  { name: 'Vietnam', iso2: 'VN', dialCode: '84' },
  { name: 'Australia', iso2: 'AU', dialCode: '61' },
  { name: 'New Zealand', iso2: 'NZ', dialCode: '64' },
  { name: 'Brazil', iso2: 'BR', dialCode: '55' },
  { name: 'Mexico', iso2: 'MX', dialCode: '52' },
  { name: 'Argentina', iso2: 'AR', dialCode: '54' },
  { name: 'Chile', iso2: 'CL', dialCode: '56' },
  { name: 'Colombia', iso2: 'CO', dialCode: '57' },
  { name: 'Peru', iso2: 'PE', dialCode: '51' },
  { name: 'Jamaica', iso2: 'JM', dialCode: '1' },
  { name: 'Trinidad and Tobago', iso2: 'TT', dialCode: '1' },
  { name: 'Barbados', iso2: 'BB', dialCode: '1' },
]

// Human-friendly variants → canonical `COUNTRIES` name (all keys lowercased). Keeps the many
// ways people type their country resolvable to a calling code.
const NAME_ALIASES = {
  'usa': 'United States',
  'u.s.a': 'United States',
  'u.s.a.': 'United States',
  'us': 'United States',
  'u.s.': 'United States',
  'united states of america': 'United States',
  'america': 'United States',
  'uk': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'great britain': 'United Kingdom',
  'britain': 'United Kingdom',
  'england': 'United Kingdom',
  'scotland': 'United Kingdom',
  'wales': 'United Kingdom',
  'northern ireland': 'United Kingdom',
  'naija': 'Nigeria',
  'federal republic of nigeria': 'Nigeria',
  'republic of ireland': 'Ireland',
  'cote d’ivoire': 'Ivory Coast',
  "cote d'ivoire": 'Ivory Coast',
  'côte d’ivoire': 'Ivory Coast',
  "côte d'ivoire": 'Ivory Coast',
  'dr congo': 'Democratic Republic of the Congo',
  'drc': 'Democratic Republic of the Congo',
  'congo-kinshasa': 'Democratic Republic of the Congo',
  'congo': 'Republic of the Congo',
  'congo-brazzaville': 'Republic of the Congo',
  'uae': 'United Arab Emirates',
  'emirates': 'United Arab Emirates',
  'swaziland': 'Eswatini',
  'south korea': 'South Korea',
  'korea': 'South Korea',
  'republic of korea': 'South Korea',
  'russian federation': 'Russia',
  'holland': 'Netherlands',
  'the netherlands': 'Netherlands',
  'czechia': 'Czech Republic',
  'deutschland': 'Germany',
}

const byNameLower = new Map()
const byIso = new Map()
for (const c of COUNTRIES) {
  if (!byNameLower.has(c.name.toLowerCase())) byNameLower.set(c.name.toLowerCase(), c)
  if (!byIso.has(c.iso2)) byIso.set(c.iso2, c)
}

/** Sorted list of canonical country names, for a <select>. */
export const COUNTRY_NAMES = [...new Set(COUNTRIES.map((c) => c.name))].sort()

/**
 * Country string (canonical name, alias, or ISO-2 code) → E.164 calling code (digits, no "+"),
 * or null when it can't be resolved.
 */
export function resolveDialCode(country) {
  if (!country) return null
  const raw = String(country).trim()
  if (!raw) return null
  const lower = raw.toLowerCase()

  if (raw.length === 2 && byIso.has(raw.toUpperCase())) return byIso.get(raw.toUpperCase()).dialCode

  const canonical = NAME_ALIASES[lower] || raw
  const hit = byNameLower.get(canonical.toLowerCase())
  return hit ? hit.dialCode : null
}

/**
 * Normalise a raw phone string to international digits (no "+", no spaces, no leading zero),
 * using the given country / calling code for local-format numbers.
 *
 *   toInternationalDigits('080 1234 5678', { country: 'Nigeria' })  -> '2348012345678'
 *   toInternationalDigits('+2348012345678')                         -> '2348012345678'
 *   toInternationalDigits('0044 7911 123456')                       -> '447911123456'
 *   toInternationalDigits('08012345678', {})                        -> '8012345678'  (best effort)
 */
export function toInternationalDigits(rawPhone, { country, dialCode } = {}) {
  if (rawPhone == null) return ''
  const str = String(rawPhone).trim()
  if (!str) return ''

  const startsWithPlus = str.startsWith('+')
  let digits = str.replace(/\D/g, '')
  if (!digits) return ''

  // Already international.
  if (startsWithPlus) return digits
  if (digits.startsWith('00')) return digits.replace(/^0+/, '')

  const code = String(dialCode || resolveDialCode(country) || '').replace(/\D/g, '')
  if (!code) return digits.replace(/^0+/, '') || digits // no country context — strip trunk zero, best effort

  // Local national format: drop the single trunk "0", then prepend the calling code.
  const national = digits.replace(/^0+/, '')

  // Guard against double-prefixing a number that already carries its calling code.
  if (digits.startsWith(code) && digits.length - code.length >= 6) return digits
  if (national.startsWith(code) && national.length - code.length >= 6) return national

  return code + national
}

/** wa.me deep link, or null when the number can't be normalised. */
export function whatsappUrl(rawPhone, opts) {
  const digits = toInternationalDigits(rawPhone, opts || {})
  return digits ? `https://wa.me/${digits}` : null
}

/** tel: href in +E.164 form, falling back to the raw value if it can't be normalised. */
export function telHref(rawPhone, opts) {
  const digits = toInternationalDigits(rawPhone, opts || {})
  if (digits) return `tel:+${digits}`
  return rawPhone ? `tel:${rawPhone}` : null
}

/** Display form, e.g. "+234 8012345678". Falls back to the raw value. */
export function formatInternational(rawPhone, opts) {
  const digits = toInternationalDigits(rawPhone, opts || {})
  if (!digits) return rawPhone || ''
  const code = String(opts?.dialCode || resolveDialCode(opts?.country) || '').replace(/\D/g, '')
  if (code && digits.startsWith(code)) return `+${code} ${digits.slice(code.length)}`
  return `+${digits}`
}
