import { detectCvKind, extractCvText, CV_TEXT_CAP } from './resumeParse'

const extractTextMock = vi.fn()
const getDocumentProxyMock = vi.fn(async (u) => ({ __data: u }))
const mammothExtractRawText = vi.fn()

vi.mock('unpdf', () => ({
  extractText: (...a) => extractTextMock(...a),
  getDocumentProxy: (...a) => getDocumentProxyMock(...a),
}))
vi.mock('mammoth', () => ({
  default: { extractRawText: (...a) => mammothExtractRawText(...a) },
}))

const LONG = 'Jane Developer\nSoftware Engineer with a decade of experience building web apps.\nExperience: Acme.'

describe('detectCvKind', () => {
  it('detects PDF by mime or extension', () => {
    expect(detectCvKind({ mimeType: 'application/pdf' })).toBe('pdf')
    expect(detectCvKind({ filename: 'My CV.PDF' })).toBe('pdf')
  })
  it('detects DOCX by mime or extension', () => {
    expect(detectCvKind({ mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })).toBe('docx')
    expect(detectCvKind({ filename: 'resume.docx' })).toBe('docx')
  })
  it('returns null for anything else (incl. old .doc)', () => {
    expect(detectCvKind({ filename: 'resume.doc' })).toBeNull()
    expect(detectCvKind({ mimeType: 'text/plain', filename: 'notes.txt' })).toBeNull()
    expect(detectCvKind({})).toBeNull()
  })
})

describe('extractCvText', () => {
  beforeEach(() => vi.clearAllMocks())

  it('routes PDFs through unpdf and normalises the text', async () => {
    extractTextMock.mockResolvedValue({ text: `${LONG}\r\n\r\n\r\n  trailing   ` })
    const out = await extractCvText({ buffer: Buffer.from('x'), mimeType: 'application/pdf', filename: 'cv.pdf' })
    expect(out.kind).toBe('pdf')
    expect(getDocumentProxyMock).toHaveBeenCalled()
    expect(out.text).toContain('Jane Developer')
    expect(out.text).not.toMatch(/\n{3,}/)
    expect(mammothExtractRawText).not.toHaveBeenCalled()
  })

  it('joins an array of per-page text from unpdf', async () => {
    extractTextMock.mockResolvedValue({ text: ['Page one text here is quite long enough to pass', 'Page two also has plenty of words'] })
    const out = await extractCvText({ buffer: Buffer.from('x'), filename: 'cv.pdf' })
    expect(out.text).toContain('Page one')
    expect(out.text).toContain('Page two')
  })

  it('routes .docx through mammoth', async () => {
    mammothExtractRawText.mockResolvedValue({ value: LONG })
    const out = await extractCvText({ buffer: Buffer.from('x'), filename: 'cv.docx' })
    expect(out.kind).toBe('docx')
    expect(mammothExtractRawText).toHaveBeenCalled()
    expect(out.text).toContain('Software Engineer')
  })

  it('rejects an unsupported type with status 400', async () => {
    await expect(extractCvText({ buffer: Buffer.from('x'), filename: 'cv.doc' })).rejects.toMatchObject({ status: 400 })
  })

  it('422 when the extractor throws', async () => {
    extractTextMock.mockRejectedValue(new Error('bad pdf'))
    await expect(extractCvText({ buffer: Buffer.from('x'), filename: 'cv.pdf' })).rejects.toMatchObject({ status: 422 })
  })

  it('422 when the file yields almost no text (scanned image)', async () => {
    extractTextMock.mockResolvedValue({ text: '   \n  a  \n ' })
    await expect(extractCvText({ buffer: Buffer.from('x'), filename: 'cv.pdf' })).rejects.toMatchObject({ status: 422 })
  })

  it('caps the returned text length', async () => {
    extractTextMock.mockResolvedValue({ text: 'word '.repeat(20000) })
    const out = await extractCvText({ buffer: Buffer.from('x'), filename: 'cv.pdf' })
    expect(out.text.length).toBeLessThanOrEqual(CV_TEXT_CAP)
  })
})
