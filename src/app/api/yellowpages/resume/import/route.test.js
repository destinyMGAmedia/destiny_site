// @vitest-environment node
import { POST } from './route'
import { extractCvText } from '@/lib/yellowpages/resumeParse'
import { parseResumeFromText, aiConfigured } from '@/lib/yellowpages/ai'

vi.mock('@/lib/yellowpages/resumeParse', async (orig) => ({
  ...(await orig()),
  extractCvText: vi.fn(),
}))
vi.mock('@/lib/yellowpages/ai', () => ({
  parseResumeFromText: vi.fn(),
  aiConfigured: vi.fn(),
}))

function fileReq(file) {
  const fd = new FormData()
  if (file) fd.append('file', file)
  return new Request('http://localhost/api/yellowpages/resume/import', { method: 'POST', body: fd })
}
const pdf = (bytes = 500) => new File([new Uint8Array(bytes)], 'cv.pdf', { type: 'application/pdf' })

describe('POST /api/yellowpages/resume/import', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    aiConfigured.mockReturnValue(true)
    extractCvText.mockResolvedValue({ kind: 'pdf', text: 'Jane Developer — Software Engineer. Ten years of experience.' })
    parseResumeFromText.mockResolvedValue({ name: 'Jane Developer', skills: ['React'], experience: [], education: [], provider: 'Gemini' })
  })

  it('400 when no file is sent', async () => {
    expect((await POST(fileReq(null))).status).toBe(400)
  })

  it('413 when the file is over 4 MB', async () => {
    const big = new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'cv.pdf', { type: 'application/pdf' })
    expect((await POST(fileReq(big))).status).toBe(413)
  })

  it('503 when AI is not configured', async () => {
    aiConfigured.mockReturnValue(false)
    const res = await POST(fileReq(pdf()))
    expect(res.status).toBe(503)
    expect((await res.json()).code).toBe('ai_unconfigured')
    expect(extractCvText).not.toHaveBeenCalled()
  })

  it('surfaces the extractor status + message', async () => {
    const err = new Error('Unsupported file type.')
    err.status = 400
    extractCvText.mockRejectedValue(err)
    const res = await POST(fileReq(pdf()))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Unsupported/)
  })

  it('502 when the AI cannot structure the text', async () => {
    parseResumeFromText.mockResolvedValue(null)
    expect((await POST(fileReq(pdf()))).status).toBe(502)
  })

  it('returns the parsed fields on success', async () => {
    const res = await POST(fileReq(pdf()))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.parsed.name).toBe('Jane Developer')
    expect(body.provider).toBe('Gemini')
    expect(parseResumeFromText).toHaveBeenCalledWith({ text: expect.stringContaining('Jane Developer') })
  })
})
