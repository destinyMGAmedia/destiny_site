// Server-only (Node runtime). AI features behind a provider shim.
//
//   AI_PROVIDER   = "gemini" (default) | "groq"
//   GEMINI_API_KEY / GEMINI_MODEL  (default model: gemini-3.6-flash)
//   GROQ_API_KEY   / GROQ_MODEL    (default model: llama-3.3-70b-versatile)
//
// Two features:
//   optimizeResume()      — improves the *wording* of an existing résumé model (never format).
//   parseResumeFromText() — structures raw CV text into our listing fields (never invents).
// If no key is configured both resolve to null and the caller falls back gracefully.

const PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase()
// gemini-2.5-flash was retired for new projects (Aug 2026) — 3.6-flash is the current fast tier.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

export function aiConfigured() {
  return PROVIDER === 'groq' ? Boolean(process.env.GROQ_API_KEY) : Boolean(process.env.GEMINI_API_KEY)
}

export function aiProviderLabel() {
  return PROVIDER === 'groq' ? 'Groq' : 'Gemini'
}

// ── Provider plumbing ─────────────────────────────────────────────────────────

async function callGemini({ system, user, schema }) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          ...(schema ? { responseSchema: schema } : {}),
        },
      }),
    },
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  // Empty text (blocked / no candidates) -> JSON.parse throws -> caller resolves to null.
  return JSON.parse(data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '')
}

async function callGroq({ system, user }) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  return JSON.parse(data?.choices?.[0]?.message?.content || '{}')
}

function callAI(args) {
  return PROVIDER === 'groq' ? callGroq(args) : callGemini(args)
}

const str = (v) => (typeof v === 'string' ? v.trim() : '')
const strList = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : [])
const bool = (v) => v === true || v === 'true'

function dedupeList(v) {
  const seen = new Set()
  const out = []
  for (const s of strList(v)) {
    const key = s.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
  }
  return out
}

// ── Feature 1: optimise wording ──────────────────────────────────────────────

function optimiseSystem(spelling) {
  return [
    'You are an expert résumé writer specialising in Applicant Tracking System (ATS) optimisation.',
    'Rewrite the supplied résumé content so it is concise, professional, and ATS-optimised.',
    'HARD RULES:',
    `- Use ${spelling} English spelling, grammar, punctuation, and date conventions consistently.`,
    '- NEVER invent, add, or exaggerate facts: no fabricated employers, job titles, dates, metrics, tools, degrees, or certifications. Only rephrase what is given.',
    '- If a bullet has no number in the input, do not invent one. Keep it qualitative.',
    '- Keep the EXACT same number of experience entries, in the same order as the input.',
    '- For each role, produce 3–5 achievement bullets. Start each with a strong past-tense action verb (present tense only for a current role). No first-person pronouns.',
    '- Write a professional summary of 2–4 sentences. No pronouns like "I".',
    '- Return skills as a clean, de-duplicated list ordered most-relevant first.',
    '- Return ONLY the JSON object described. No commentary, no markdown.',
    '- Return a JSON object with keys: headline, summary, skills (array), languages (array), certifications, experience (array of { title, organization, bullets (array) }).',
  ].join('\n')
}

const OPTIMISE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    headline: { type: 'STRING' },
    summary: { type: 'STRING' },
    skills: { type: 'ARRAY', items: { type: 'STRING' } },
    languages: { type: 'ARRAY', items: { type: 'STRING' } },
    certifications: { type: 'STRING' },
    experience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          organization: { type: 'STRING' },
          bullets: { type: 'ARRAY', items: { type: 'STRING' } },
        },
      },
    },
  },
  required: ['summary', 'skills', 'experience'],
}

function optimiseUser(model, jobDescription) {
  const input = {
    headline: model.headline || '',
    summary: model.summary || '',
    skills: model.skills || [],
    languages: model.languages || [],
    certifications: model.certifications || '',
    experience: (model.experience || []).map((e) => ({
      title: e.title || '',
      organization: e.organization || '',
      location: e.location || '',
      dateRange: e.dateRange || '',
      bullets: e.bullets && e.bullets.length ? e.bullets : [],
    })),
    education: (model.education || []).map((e) => ({ heading: e.heading, org: e.org, meta: e.meta, description: e.description })),
    projects: (model.projects || []).map((p) => ({ heading: p.heading, description: p.description })),
  }
  const parts = [`RÉSUMÉ CONTENT (JSON):\n${JSON.stringify(input, null, 2)}`]
  if (jobDescription && jobDescription.trim()) {
    parts.push(
      `\nTARGET JOB DESCRIPTION — align terminology and surface relevant keywords that TRUTHFULLY apply to this candidate (do not claim skills they don't have):\n${jobDescription.trim().slice(0, 6000)}`,
    )
  }
  return parts.join('\n')
}

/**
 * @param {{ model: object, jobDescription?: string }} args  model = buildResumeModel(...) output
 * @returns {Promise<object|null>}
 */
export async function optimizeResume({ model, jobDescription } = {}) {
  if (!aiConfigured() || !model) return null

  let raw
  try {
    raw = await callAI({
      system: optimiseSystem(model.spelling || 'American'),
      user: optimiseUser(model, jobDescription),
      schema: OPTIMISE_SCHEMA,
    })
  } catch (err) {
    console.error('[YELLOWPAGES:AI] optimizeResume failed:', err?.message || err)
    return null
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const inputExp = model.experience || []
  const rawExp = Array.isArray(raw.experience) ? raw.experience : []
  const experience = inputExp.map((src, i) => {
    const got = rawExp[i] || {}
    const bullets = strList(got.bullets)
    return {
      title: str(got.title) || src.title,
      organization: str(got.organization) || src.organization,
      bullets: bullets.length ? bullets : src.bullets,
    }
  })

  return {
    headline: str(raw.headline) || model.headline || '',
    summary: str(raw.summary) || model.summary || '',
    skills: strList(raw.skills).length ? strList(raw.skills) : model.skills,
    languages: strList(raw.languages).length ? strList(raw.languages) : model.languages,
    certifications: str(raw.certifications) || model.certifications || '',
    experience,
    generatedAt: new Date().toISOString(),
    provider: aiProviderLabel(),
  }
}

// ── Feature 2: structure a CV into listing fields ────────────────────────────

const PARSE_SYSTEM = [
  'You extract structured data from a résumé / CV. Return ONLY the JSON object described.',
  'HARD RULES:',
  '- Extract only what is explicitly present in the text. NEVER guess, infer, or invent anything (no made-up dates, employers, degrees, skills, or contact details).',
  '- If a field is not in the text, leave it empty ("" for strings, [] for arrays). Do not use placeholders like "N/A".',
  '- headline: the person\'s current role/title as one short line, only if stated.',
  '- summary: the candidate\'s own professional summary / profile paragraph, verbatim or lightly cleaned. If there is none, leave it empty — do not write one.',
  '- experience[].bullets: the responsibility/achievement lines for that role, each as a separate string, cleaned of bullet characters.',
  '- Dates: copy them as written (e.g. "Jan 2021", "2019"). Set current=true only if the text says "Present"/"Current"/"to date".',
  '- skills / languages: split into individual items, de-duplicated.',
  '- No commentary, no markdown.',
].join('\n')

const PARSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    headline: { type: 'STRING' },
    summary: { type: 'STRING' },
    email: { type: 'STRING' },
    phone: { type: 'STRING' },
    city: { type: 'STRING' },
    state: { type: 'STRING' },
    country: { type: 'STRING' },
    website: { type: 'STRING' },
    linkedin: { type: 'STRING' },
    github: { type: 'STRING' },
    twitter: { type: 'STRING' },
    skills: { type: 'ARRAY', items: { type: 'STRING' } },
    languages: { type: 'ARRAY', items: { type: 'STRING' } },
    certifications: { type: 'STRING' },
    experience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          organization: { type: 'STRING' },
          location: { type: 'STRING' },
          startDate: { type: 'STRING' },
          endDate: { type: 'STRING' },
          current: { type: 'BOOLEAN' },
          bullets: { type: 'ARRAY', items: { type: 'STRING' } },
        },
      },
    },
    education: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          school: { type: 'STRING' },
          degree: { type: 'STRING' },
          field: { type: 'STRING' },
          startYear: { type: 'STRING' },
          endYear: { type: 'STRING' },
          description: { type: 'STRING' },
        },
      },
    },
    projects: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          role: { type: 'STRING' },
          url: { type: 'STRING' },
          description: { type: 'STRING' },
        },
      },
    },
  },
  required: ['skills', 'experience', 'education'],
}

/**
 * Structures raw CV text into the individual listing / portfolio shape. Only fields actually
 * found in the CV are populated. Returns null if AI is unconfigured or the call fails.
 * @param {{ text: string }} args
 */
export async function parseResumeFromText({ text } = {}) {
  const cv = str(text)
  if (!aiConfigured() || cv.length < 40) return null

  let raw
  try {
    raw = await callAI({
      system: PARSE_SYSTEM,
      user: `CV TEXT:\n${cv.slice(0, 15000)}`,
      schema: PARSE_SCHEMA,
    })
  } catch (err) {
    console.error('[YELLOWPAGES:AI] parseResumeFromText failed:', err?.message || err)
    return null
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const experience = (Array.isArray(raw.experience) ? raw.experience : [])
    .map((e) => ({
      title: str(e.title),
      organization: str(e.organization),
      location: str(e.location),
      startDate: str(e.startDate),
      endDate: str(e.endDate),
      current: bool(e.current),
      bullets: strList(e.bullets),
    }))
    .filter((e) => e.title || e.organization)

  const education = (Array.isArray(raw.education) ? raw.education : [])
    .map((e) => ({
      school: str(e.school),
      degree: str(e.degree),
      field: str(e.field),
      startYear: str(e.startYear),
      endYear: str(e.endYear),
      description: str(e.description),
    }))
    .filter((e) => e.school || e.degree)

  const projects = (Array.isArray(raw.projects) ? raw.projects : [])
    .map((p) => ({ name: str(p.name), role: str(p.role), url: str(p.url), description: str(p.description) }))
    .filter((p) => p.name)

  const socialLinks = {}
  for (const k of ['linkedin', 'github', 'twitter']) {
    if (str(raw[k])) socialLinks[k] = str(raw[k])
  }

  return {
    name: str(raw.name),
    headline: str(raw.headline),
    summary: str(raw.summary),
    email: str(raw.email),
    phone: str(raw.phone),
    city: str(raw.city),
    state: str(raw.state),
    country: str(raw.country),
    website: str(raw.website),
    socialLinks,
    skills: dedupeList(raw.skills),
    languages: dedupeList(raw.languages),
    certifications: str(raw.certifications),
    experience,
    education,
    projects,
    provider: aiProviderLabel(),
  }
}
