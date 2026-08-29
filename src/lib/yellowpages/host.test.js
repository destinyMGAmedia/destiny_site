import { getYellowPagesBase, DEFAULT_YELLOWPAGES_HOST } from './host'

describe('getYellowPagesBase', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns "" for the default yellow pages host', () => {
    expect(getYellowPagesBase(DEFAULT_YELLOWPAGES_HOST)).toBe('')
  })

  it('returns "" for the default yellow pages host when a port is present', () => {
    expect(getYellowPagesBase(`${DEFAULT_YELLOWPAGES_HOST}:3000`)).toBe('')
  })

  it('returns "/yellowpages" for a non-matching host', () => {
    expect(getYellowPagesBase('www.destinymissionglobal.org')).toBe('/yellowpages')
  })

  it('returns "/yellowpages" for an empty/undefined host', () => {
    expect(getYellowPagesBase('')).toBe('/yellowpages')
    expect(getYellowPagesBase(undefined)).toBe('/yellowpages')
  })

  it('honors the YELLOWPAGES_HOST env override', () => {
    vi.stubEnv('YELLOWPAGES_HOST', 'custom.example.com')
    expect(getYellowPagesBase('custom.example.com')).toBe('')
    expect(getYellowPagesBase(DEFAULT_YELLOWPAGES_HOST)).toBe('/yellowpages')
  })

  it('strips the port when matching against an overridden YELLOWPAGES_HOST', () => {
    vi.stubEnv('YELLOWPAGES_HOST', 'custom.example.com')
    expect(getYellowPagesBase('custom.example.com:8080')).toBe('')
  })
})
