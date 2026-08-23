import { hashContact } from './contact'

describe('hashContact', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('produces a deterministic hash for the same input', () => {
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret')
    expect(hashContact('08012345678')).toBe(hashContact('08012345678'))
  })

  it('produces different hashes for different contacts', () => {
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret')
    expect(hashContact('08012345678')).not.toBe(hashContact('08099999999'))
  })

  it('produces different hashes under different salts', () => {
    vi.stubEnv('NEXTAUTH_SECRET', 'secret-a')
    const a = hashContact('jane@example.com')
    vi.stubEnv('NEXTAUTH_SECRET', 'secret-b')
    const b = hashContact('jane@example.com')
    expect(a).not.toBe(b)
  })

  it('never returns the raw contact value', () => {
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret')
    const hash = hashContact('jane@example.com')
    expect(hash).not.toContain('jane@example.com')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})
