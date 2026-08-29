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

  // --- provider-reply shapes that must resolve to null (the try/catch + guard branches) ---

  it('returns null when the Gemini text is not valid JSON', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '',
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'not json at all' }] } }] }),
    })
    expect(await optimizeResume({ model: baseModel })).toBeNull()
  })

  it('returns null when the Gemini response carries no candidates (empty text -> JSON.parse throws)', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '',
      json: async () => ({}),
    })
    expect(await optimizeResume({ model: baseModel })).toBeNull()
  })

  it('returns null when the model reply parses to a bare number', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    vi.spyOn(global, 'fetch').mockResolvedValue(
      { ok: true, text: async () => '', json: async () => ({ candidates: [{ content: { parts: [{ text: '42' }] } }] }) },
    )
    expect(await optimizeResume({ model: baseModel })).toBeNull()
  })

  it('logs and returns null when fetch itself rejects', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'))
    expect(await optimizeResume({ model: baseModel })).toBeNull()
    expect(errSpy).toHaveBeenCalledWith(
      '[YELLOWPAGES:AI] optimizeResume failed:',
      'network down',
    )
  })

  // --- defensive shaping details ---

  it('drops AI experience entries beyond the count supplied in the input', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    vi.spyOn(global, 'fetch').mockResolvedValue(
      geminiReply({
        summary: 's',
        skills: ['x'],
        experience: [
          { title: 'A', organization: 'A Co', bullets: ['a1'] },
          { title: 'B', organization: 'B Co', bullets: ['b1'] },
          { title: 'C', organization: 'C Co', bullets: ['c1'] }, // no third input role -> dropped
        ],
      }),
    )
    const out = await optimizeResume({ model: baseModel })
    expect(out.experience).toHaveLength(2)
    expect(out.experience.map((e) => e.title)).toEqual(['A', 'B'])
  })

  it('trims and de-blanks skills, discarding non-string members', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    vi.spyOn(global, 'fetch').mockResolvedValue(
      geminiReply({ summary: 's', skills: ['  React  ', '', '   ', 42, null, 'Node'], experience: [] }),
    )
    const out = await optimizeResume({ model: baseModel })
    expect(out.skills).toEqual(['React', 'Node'])
    // experience still aligns to the 2 input roles, falling back to their bullets
    expect(out.experience.map((e) => e.title)).toEqual(['Dev', 'Intern'])
  })

  it('does not append a whitespace-only job description to the payload', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(geminiReply({ summary: 's', skills: ['x'], experience: [] }))
    await optimizeResume({ model: baseModel, jobDescription: '   \n\t  ' })
    const sentText = JSON.parse(fetchSpy.mock.calls[0][1].body).contents[0].parts[0].text
    expect(sentText).toContain('RÉSUMÉ CONTENT (JSON)')
    expect(sentText).not.toContain('TARGET JOB DESCRIPTION')
  })

  it('defaults to American spelling in the system instruction when the model omits spelling', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(geminiReply({ summary: 's', skills: ['x'], experience: [] }))
    const { spelling, ...noSpelling } = baseModel
    await optimizeResume({ model: noSpelling })
    const sysText = JSON.parse(fetchSpy.mock.calls[0][1].body).systemInstruction.parts[0].text
    expect(sysText).toContain('American English spelling')
  })

  it('threads the model spelling through to the system instruction', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(geminiReply({ summary: 's', skills: ['x'], experience: [] }))
    await optimizeResume({ model: baseModel }) // spelling: 'British'
    const sysText = JSON.parse(fetchSpy.mock.calls[0][1].body).systemInstruction.parts[0].text
    expect(sysText).toContain('British English spelling')
  })

  it('serialises the full résumé model (education + projects) into the Gemini payload', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(geminiReply({ summary: 's', skills: ['x'], experience: [] }))
    const model = {
      ...baseModel,
      education: [{ heading: 'BSc CS', org: 'State Uni', meta: '2016', description: 'first class' }],
      projects: [{ heading: 'OSS lib', description: 'a widely used parser' }],
    }
    await optimizeResume({ model })
    const sentText = JSON.parse(fetchSpy.mock.calls[0][1].body).contents[0].parts[0].text
    const jsonBlock = JSON.parse(sentText.replace('RÉSUMÉ CONTENT (JSON):\n', ''))
    expect(jsonBlock.education).toEqual([{ heading: 'BSc CS', org: 'State Uni', meta: '2016', description: 'first class' }])
    expect(jsonBlock.projects).toEqual([{ heading: 'OSS lib', description: 'a widely used parser' }])
    expect(jsonBlock.experience[0]).toMatchObject({ title: 'Dev', organization: 'Acme', bullets: ['built things'] })
  })

  it('sends the Gemini structured-output config (schema + JSON mime type)', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(geminiReply({ summary: 's', skills: ['x'], experience: [] }))
    await optimizeResume({ model: baseModel })
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toContain('gemini-3.6-flash:generateContent')
    expect(init.headers['x-goog-api-key']).toBe('k')
    const cfg = JSON.parse(init.body).generationConfig
    expect(cfg.responseMimeType).toBe('application/json')
    expect(cfg.responseSchema.required).toEqual(['summary', 'skills', 'experience'])
    expect(cfg.temperature).toBe(0.4)
  })
})

describe('empty / minimal model handling', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('handles a model with no experience array at all', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    vi.spyOn(global, 'fetch').mockResolvedValue(
      geminiReply({ summary: 'Polished.', skills: ['Rust'], experience: [{ title: 'X', bullets: ['y'] }] }),
    )
    const out = await optimizeResume({ model: { headline: 'H', summary: 'S', skills: ['s'] } })
    expect(out.experience).toEqual([]) // nothing in the input to align against
    expect(out.summary).toBe('Polished.')
    expect(out.skills).toEqual(['Rust'])
    expect(out.languages).toBeUndefined() // strList([]) is empty -> falls back to model.languages (absent)
    expect(out.certifications).toBe('')
  })

  it('coerces a non-array skills reply to the input skills', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini')
    vi.stubEnv('GEMINI_API_KEY', 'k')
    vi.spyOn(global, 'fetch').mockResolvedValue(
      geminiReply({ summary: 's', skills: 'React, Node', experience: [{ bullets: [] }, { bullets: [] }] }),
    )
    const out = await optimizeResume({ model: baseModel })
    expect(out.skills).toEqual(['react']) // strList('React, Node') -> [] -> model.skills
  })
})

describe('AI_PROVIDER casing + Groq reply shapes', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  async function loadWith(provider, key = 'gk') {
    vi.resetModules()
    vi.stubEnv('AI_PROVIDER', provider)
    vi.stubEnv('GROQ_API_KEY', key)
    return import('./ai')
  }

  it('lower-cases AI_PROVIDER so "GROQ" still selects the Groq provider', async () => {
    const mod = await loadWith('GROQ')
    expect(mod.aiProviderLabel()).toBe('Groq')
    expect(mod.aiConfigured()).toBe(true)
  })

  it('returns null for a Groq reply that is a JSON array', async () => {
    const mod = await loadWith('groq')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '',
      json: async () => ({ choices: [{ message: { content: '[1,2,3]' } }] }),
    })
    expect(await mod.optimizeResume({ model: baseModel })).toBeNull()
  })

  it('treats a Groq reply with no message content as an empty object (full fallback)', async () => {
    const mod = await loadWith('groq')
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '',
      json: async () => ({ choices: [{ message: {} }] }),
    })
    const out = await mod.optimizeResume({ model: baseModel })
    expect(out.summary).toBe('did stuff')
    expect(out.skills).toEqual(['react'])
    expect(out.experience).toHaveLength(2)
    expect(out.experience[0].bullets).toEqual(['built things'])
    expect(out.provider).toBe('Groq')
  })

  it('sends the Groq JSON-object response_format and default model', async () => {
    const mod = await loadWith('groq')
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '',
      json: async () => ({ choices: [{ message: { content: '{"summary":"s","skills":["x"],"experience":[]}' } }] }),
    })
    await mod.optimizeResume({ model: baseModel })
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.model).toBe('llama-3.3-70b-versatile')
    expect(body.response_format).toEqual({ type: 'json_object' })
    expect(body.temperature).toBe(0.4)
    expect(body.messages[0].role).toBe('system')
    expect(body.messages[0].content).toContain('Return a JSON object with keys')
  })

  it('surfaces the Groq error status text (truncated) but still resolves to null', async () => {
    const mod = await loadWith('groq')
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'x'.repeat(500),
    })
    expect(await mod.optimizeResume({ model: baseModel })).toBeNull()
    const [, msg] = errSpy.mock.calls[0]
    expect(msg).toMatch(/^Groq 503: x{300}$/)
  })
})
