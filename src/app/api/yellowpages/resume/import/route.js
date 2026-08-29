import { extractCvText, CV_MAX_BYTES } from '@/lib/yellowpages/resumeParse'
import { parseResumeFromText, aiConfigured } from '@/lib/yellowpages/ai'

// POST /api/yellowpages/resume/import — multipart/form-data, field `file` (PDF or .docx).
// Extracts the text, structures it with the AI, and returns the fields for an INDIVIDUAL
// listing/portfolio. No auth: it's the uploader's own CV and the response is just structured
// data they review and edit before saving — same trust level as the public listing form.
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req) {
  let form
  try {
    form = await req.formData()
  } catch {
    return Response.json({ error: 'Expected a file upload (multipart/form-data).' }, { status: 400 })
  }

  const file = form.get('file')
  if (!file || typeof file.arrayBuffer !== 'function') {
    return Response.json({ error: 'No file received.' }, { status: 400 })
  }
  if (file.size > CV_MAX_BYTES) {
    return Response.json({ error: 'That file is too large. Keep it under 4 MB.' }, { status: 413 })
  }

  if (!aiConfigured()) {
    return Response.json(
      { error: "CV import isn't available right now — add your details manually below.", code: 'ai_unconfigured' },
      { status: 503 },
    )
  }

  let text
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const extracted = await extractCvText({ buffer, mimeType: file.type, filename: file.name })
    text = extracted.text
  } catch (err) {
    return Response.json({ error: err.message || 'Could not read that file.' }, { status: err.status || 422 })
  }

  const parsed = await parseResumeFromText({ text })
  if (!parsed) {
    return Response.json(
      { error: "We couldn't pull structured details from that CV. Please fill the form manually." },
      { status: 502 },
    )
  }

  return Response.json({ parsed, provider: parsed.provider })
}
