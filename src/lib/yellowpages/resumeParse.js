// Server-only (Node runtime). Pulls raw text out of an uploaded CV. Detects PDF vs Word
// (.docx) from the MIME type and/or filename and calls the matching extractor.
//   PDF  -> unpdf  (serverless-friendly pdfjs build; no canvas/DOM)
//   DOCX -> mammoth (extractRawText)
// Old binary .doc is not supported — the caller should tell the user to save as PDF or .docx.

export const CV_MAX_BYTES = 4 * 1024 * 1024 // 4 MB
export const CV_TEXT_CAP = 15000 // chars sent onward to the AI

const PDF_TYPES = ['application/pdf']
const DOCX_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword+xml',
]

/** @returns {'pdf'|'docx'|null} */
export function detectCvKind({ mimeType = '', filename = '' } = {}) {
  const type = String(mimeType).toLowerCase()
  const name = String(filename).toLowerCase()
  if (PDF_TYPES.includes(type) || name.endsWith('.pdf')) return 'pdf'
  if (DOCX_TYPES.includes(type) || name.endsWith('.docx')) return 'docx'
  // Some browsers send octet-stream — fall back to the extension only.
  if (name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.docx')) return 'docx'
  return null
}

async function extractPdf(buffer) {
  const { extractText, getDocumentProxy } = await import('unpdf')
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await extractText(pdf, { mergePages: true })
  return Array.isArray(text) ? text.join('\n') : text
}

async function extractDocx(buffer) {
  const mammoth = (await import('mammoth')).default || (await import('mammoth'))
  const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
  return value
}

/**
 * @param {{ buffer: ArrayBuffer|Buffer|Uint8Array, mimeType?: string, filename?: string }} file
 * @returns {Promise<{ kind: 'pdf'|'docx', text: string }>}
 * @throws {Error} with a user-facing message on unsupported type / unreadable file
 */
export async function extractCvText(file = {}) {
  const kind = detectCvKind(file)
  if (!kind) {
    const err = new Error('Unsupported file type. Upload a PDF or a Word (.docx) file.')
    err.status = 400
    throw err
  }

  const buffer = file.buffer
  let raw
  try {
    raw = kind === 'pdf' ? await extractPdf(buffer) : await extractDocx(buffer)
  } catch (cause) {
    console.error('[YELLOWPAGES] CV text extraction failed:', cause?.message || cause)
    const err = new Error("We couldn't read that file. Make sure it's a normal PDF or .docx (not a scan/image).")
    err.status = 422
    throw err
  }

  const text = (raw || '').replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (text.replace(/\s/g, '').length < 40) {
    const err = new Error("That file has almost no selectable text — it may be a scanned image. Upload a text-based PDF or .docx.")
    err.status = 422
    throw err
  }

  return { kind, text: text.slice(0, CV_TEXT_CAP) }
}
