import { sendSms } from './sms'

// sms.js has no provider wired, so `deliver()` always returns false. There is no external
// service to reach and nothing to mock — we assert the documented fallback contract.

describe('sendSms', () => {
  let infoSpy

  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  })
  afterEach(() => {
    infoSpy.mockRestore()
    vi.unstubAllEnvs()
  })

  it('reports delivered:false when no provider is configured', async () => {
    const res = await sendSms({ to: '2348012345678', body: 'code 123456' })
    expect(res.delivered).toBe(false)
  })

  it('logs the would-be message so an operator can still read the code in dev', async () => {
    await sendSms({ to: '2348012345678', body: 'code 123456' })
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('2348012345678'))
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('code 123456'))
  })

  it('includes a devHint outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const res = await sendSms({ to: '2348012345678', body: 'hello world' })
    expect(res).toEqual({ delivered: false, devHint: 'hello world' })
  })

  it('omits the devHint in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const res = await sendSms({ to: '2348012345678', body: 'hello world' })
    expect(res).toEqual({ delivered: false })
    expect(res).not.toHaveProperty('devHint')
  })

  it('handles empty recipient / body without throwing', async () => {
    await expect(sendSms({ to: '', body: '' })).resolves.toMatchObject({ delivered: false })
  })
})
