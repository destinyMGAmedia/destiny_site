import { aiConfigured, aiProviderLabel, optimizeResume } from './ai'

const baseModel = {
  spelling: 'British',
  headline: 'Engineer',
  summary: 'did stuff',
  skills: ['react'],
  languages: ['English'],
  certifications: '',
  experience: [
    { title: 'Dev', organization: 'Acme', location: '', dateRange: '2020 – 2024', bullets: ['built things'] },
    { title: 'Intern', organization: 'Beta', location: '', dateRange: '2019', bullets: [] },
  ],
  education: [],
  projects: [],
}

const geminiReply = (obj) => ({
  ok: true,
  text: async () => '',
  json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(obj) }] } }] }),
})

// Groq speaks the OpenAI chat-completions shape.
const groqReply = (obj) => ({
  ok: true,
  text: async () => '',
  json: async () => ({ choices: [{ message: { content: JSON.stringify(obj) } }] }),
})

describe('aiConfigured', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('is false with no key', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', '')
    expect(aiConfigured()).toBe(false)
  })

  it('is true once a Gemini key is set', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    expect(aiConfigured()).toBe(true)
  })
})

describe('aiProviderLabel', () => {
  it('labels the default (Gemini) provider', () => {
    expect(aiProviderLabel()).toBe('Gemini')
  })
})

// PROVIDER / model names are resolved once at module load, so the Groq branch of
// aiConfigured / aiProviderLabel / optimizeResume can only be reached by re-importing
// the module with AI_PROVIDER=groq stubbed first.
describe('AI_PROVIDER=groq', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  async function loadGroq({ key = 'gk' } = {}) {
    vi.resetModules()
    vi.stubEnv('AI_PROVIDER', 'groq')
    vi.stubEnv('GROQ_API_KEY', key)
    return import('./ai')
  }

  it('aiConfigured tracks GROQ_API_KEY and aiProviderLabel is "Groq"', async () => {
    const mod = await loadGroq({ key: '' })
    expect(mod.aiConfigured()).toBe(false)
    expect(mod.aiProviderLabel()).toBe('Groq')

    const mod2 = await loadGroq({ key: 'gk' })
    expect(mod2.aiConfigured()).toBe(true)
  })

  it('calls the Groq endpoint with a Bearer token and maps the completion', async () => {
    const mod = await loadGroq()
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      groqReply({
        headline: 'Senior Engineer',
        summary: 'Groq-polished summary.',
        skills: ['Go', 'Kubernetes'],
        languages: ['English'],
        certifications: 'CKA',
        experience: [{ title: 'Dev', organization: 'Acme', bullets: ['Shipped X', 'Cut Y'] }],
      }),
    )
    const out = await mod.optimizeResume({ model: baseModel, jobDescription: '  Senior Go role  ' })

    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions')
    expect(init.headers.Authorization).toBe('Bearer gk')
    expect(JSON.parse(init.body).messages[1].content).toContain('Senior Go role')

    expect(out.summary).toBe('Groq-polished summary.')
    expect(out.skills).toEqual(['Go', 'Kubernetes'])
    expect(out.certifications).toBe('CKA')
    expect(out.experience[0].bullets).toEqual(['Shipped X', 'Cut Y'])
    expect(out.provider).toBe('Groq')
    expect(typeof out.generatedAt).toBe('string')
  })

  it('returns null when Groq responds non-OK', async () => {
    const mod = await loadGroq()
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' })
    expect(await mod.optimizeResume({ model: baseModel })).toBeNull()
  })
})

describe('optimizeResume', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('returns null (no call) when unconfigured', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')
    const fetchSpy = vi.spyOn(global, 'fetch')
    expect(await optimizeResume({ model: baseModel })).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('maps the model response, keeping experience aligned by index', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    vi.spyOn(global, 'fetch').mockResolvedValue(
      geminiReply({
        summary: 'Polished summary.',
        skills: ['React', 'TypeScript'],
        experience: [
          { title: 'Software Engineer', organization: 'Acme', bullets: ['Delivered A', 'Improved B'] },
          // second entry omitted by the model -> falls back to input
        ],
      }),
    )
    const out = await optimizeResume({ model: baseModel })
    expect(out.summary).toBe('Polished summary.')
    expect(out.skills).toEqual(['React', 'TypeScript'])
    expect(out.experience).toHaveLength(2)
    expect(out.experience[0].bullets).toEqual(['Delivered A', 'Improved B'])
    // model omitted entry 1 -> falls back to the input's bullets (empty here) and title/org
    expect(out.experience[1].bullets).toEqual([])
    expect(out.experience[1].title).toBe('Intern')
    expect(out.provider).toBe('Gemini')
  })

  it('returns null when the provider errors', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k')
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 429, text: async () => 'rate limited' })
    expect(await optimizeResume({ model: baseModel })).toBeNull()
  })

  it('returns null when there is no model', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k')
    expect(await optimizeResume({ model: null })).toBeNull()
    expect(await optimizeResume()).toBeNull()
  })

  it('returns null when the model reply parses to a non-object', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    // valid JSON, but an array — not the object shape optimizeResume expects
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '',
      json: async () => ({ candidates: [{ content: { parts: [{ text: '[1,2,3]' }] } }] }),
    })
    expect(await optimizeResume({ model: baseModel })).toBeNull()
  })

  it('forwards a trimmed, truncated job description into the Gemini payload', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(geminiReply({ summary: 's', skills: ['x'], experience: [] }))
    const jd = `  ${'d'.repeat(7000)}  `
    await optimizeResume({ model: baseModel, jobDescription: jd })
    const sentText = JSON.parse(fetchSpy.mock.calls[0][1].body).contents[0].parts[0].text
    expect(sentText).toContain('TARGET JOB DESCRIPTION')
    // trimmed then capped at 6000 chars
    expect(sentText).toContain('d'.repeat(6000))
    expect(sentText).not.toContain('d'.repeat(6001))
  })

  it('falls back to the input model for any field the AI leaves blank', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    vi.spyOn(global, 'fetch').mockResolvedValue(
      geminiReply({ summary: '   ', skills: [], languages: [], experience: [{ bullets: [] }, { bullets: [] }] }),
    )
    const out = await optimizeResume({ model: baseModel })
    expect(out.summary).toBe('did stuff')
    expect(out.skills).toEqual(['react'])
    expect(out.languages).toEqual(['English'])
    expect(out.headline).toBe('Engineer')
    expect(out.experience[0].bullets).toEqual(['built things'])
    expect(out.experience[0].title).toBe('Dev')
  })
})
