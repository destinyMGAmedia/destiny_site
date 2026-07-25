import { NextRequest } from 'next/server'
import { middleware } from './middleware'
import { DEFAULT_NATION_HOST } from '@/lib/nation/host'

function makeRequest(url, host) {
  const parsed = new URL(url)
  return new NextRequest(url, {
    headers: { host: host || parsed.host },
  })
}

describe('middleware', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('passes through unmodified when the path already starts with /nation', () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/nation/about`)
    const res = middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('passes through /nation itself unmodified even on a non-nation host', () => {
    const req = makeRequest('http://www.destinymissionglobal.org/nation')
    const res = middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('rewrites requests on the nation host to /nation/*', () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/about`)
    const res = middleware(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation/about')
  })

  it('rewrites the root path on the nation host to /nation (not /nation/)', () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/`)
    const res = middleware(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation')
  })

  it('rewrites when the __nation=1 dev override query param is present, even on a non-nation host', () => {
    const req = makeRequest('http://localhost:3000/partner?__nation=1')
    const res = middleware(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation/partner')
  })

  it('passes through unmodified for a normal host with no override', () => {
    const req = makeRequest('http://www.destinymissionglobal.org/about')
    const res = middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('respects the NATION_HOST env override', () => {
    vi.stubEnv('NATION_HOST', 'custom.example.com')
    const req = makeRequest('http://custom.example.com/give')
    const res = middleware(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation/give')

    // The default nation host is no longer treated as the nation host once overridden.
    const req2 = makeRequest(`http://${DEFAULT_NATION_HOST}/give`)
    const res2 = middleware(req2)
    expect(res2.headers.get('x-middleware-rewrite')).toBeNull()
  })
})
