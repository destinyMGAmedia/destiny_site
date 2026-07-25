import { getNationBase, DEFAULT_NATION_HOST } from './host'

describe('getNationBase', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns "" for the default nation host', () => {
    expect(getNationBase(DEFAULT_NATION_HOST)).toBe('')
  })

  it('returns "" for the default nation host when a port is present', () => {
    expect(getNationBase(`${DEFAULT_NATION_HOST}:3000`)).toBe('')
  })

  it('returns "/nation" for a non-matching host', () => {
    expect(getNationBase('www.destinymissionglobal.org')).toBe('/nation')
  })

  it('returns "/nation" for an empty/undefined host', () => {
    expect(getNationBase('')).toBe('/nation')
    expect(getNationBase(undefined)).toBe('/nation')
  })

  it('honors the NATION_HOST env override', () => {
    vi.stubEnv('NATION_HOST', 'custom.example.com')
    expect(getNationBase('custom.example.com')).toBe('')
    expect(getNationBase(DEFAULT_NATION_HOST)).toBe('/nation')
  })

  it('strips the port when matching against an overridden NATION_HOST', () => {
    vi.stubEnv('NATION_HOST', 'custom.example.com')
    expect(getNationBase('custom.example.com:8080')).toBe('')
  })
})
