// Server-only (Node runtime). AI résumé optimization behind a provider shim.
//
//   AI_PROVIDER   = "gemini" (default) | "groq"
//   GEMINI_API_KEY / GEMINI_MODEL  (default model: gemini-2.5-flash)
//   GROQ_API_KEY   / GROQ_MODEL    (default model: llama-3.3-70b-versatile)
//
// If no key is configured, optimizeResume() resolves to null and the caller falls back to the
// user's own text (résumé still generates, just without the AI polish). The AI only improves
// *wording*; the ATS-safe *format* is guaranteed by the PDF templates.

const PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase()
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

export function aiConfigured() {
  return PROVIDER === 'groq' ? Boolean(process.env.GROQ_API_KEY) : Boolean(process.env.GEMINI_API_KEY)
}

export function aiProviderLabel() {
  return PROVIDER === 'groq' ? 'Groq' : 'Gemini'
}

function systemRules(spelling) {
  return [
    'You are an expert résumé writer and career coach specialising in Applicant Tracking System (ATS) optimisation.',
    'Rewrite the supplied résumé content so it is concise, professional, and ATS-optimised.',
    'HARD RULES:',
    `- Use ${spelling} English spelling, grammar, punctuation, and date conventions consistently.`,
    '- NEVER invent, add, or exaggerate facts: no fabricated employers, job titles, dates, metrics, tools, degrees, or certifications. Only rephrase what is given.',
    '- If a bullet has no number in the input, do not invent one. Keep it qualitative.',
    '- Keep the EXACT same number of experience entries, in the same order as the input.',
    '- For each role, produce 3–5 achievement bullets. Start each with a strong past-tense action verb (or present tense only for the current role). No first-person pronouns. No trailing period is fine.',
    '- Write a professional summary of 2–4 sentences. No pronouns like "I".',
    '- Return skills as a clean, de-duplicated list ordered most-relevant first.',
    '- Do NOT include any commentary, headings, or markdown — return ONLY the JSON object described.',
  ].join('\n')
}

function buildUserPayload(model, jobDescription) {
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
      `\nTARGET JOB DESCRIPTION — align terminology and surface relevant keywords that TRUTHFULLY apply to this candidate (do not claim skills they don't have):\n${jobDescription.trim().slice(0, 6000)}`
    )
  }
  return parts.join('\n')
}

// Gemini responseSchema (OpenAPI subset).
const GEMINI_SCHEMA = {
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

async function callGemini(model, jobDescription) {
  const key = process.env.GEMINI_API_KEY
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemRules(model.spelling || 'American') }] },
        contents: [{ role: 'user', parts: [{ text: buildUserPayload(model, jobDescription) }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
          responseSchema: GEMINI_SCHEMA,
        },
      }),
    }
  )
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  return JSON.parse(text)
}

async function callGroq(model, jobDescription) {
  const key = process.env.GROQ_API_KEY
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${systemRules(model.spelling || 'American')}\n\nReturn a JSON object with keys: headline, summary, skills (array), languages (array), certifications, experience (array of { title, organization, bullets (array) }).` },
        { role: 'user', content: buildUserPayload(model, jobDescription) },
      ],
    }),
  })
  if (!res.ok) {
    throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 300)}`)
  }
  const data = await res.json()
  return JSON.parse(data?.choices?.[0]?.message?.content || '{}')
}

const str = (v) => (typeof v === 'string' ? v.trim() : '')
const strList = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : [])

/**
 * @param {{ model: object, jobDescription?: string }} args  model = buildResumeModel(...) output
 * @returns {Promise<object|null>} optimized content, or null if AI is unconfigured / failed
 */
export async function optimizeResume({ model, jobDescription } = {}) {
  if (!aiConfigured() || !model) return null

  let raw
  try {
    raw = PROVIDER === 'groq' ? await callGroq(model, jobDescription) : await callGemini(model, jobDescription)
  } catch (err) {
    console.error('[YELLOWPAGES:AI] optimizeResume failed:', err?.message || err)
    return null
  }

  if (!raw || typeof raw !== 'object') return null

  // Defensive shaping — keep experience aligned to the input by index.
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
