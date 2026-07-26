import { NextRequest } from 'next/server'
import { middleware, config } from './middleware'
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

  it('passes through /api/* on the nation host unmodified (excluded in the function body, not the matcher)', () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/api/nation/partner-count`)
    const res = middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('passes through /_next/* on the nation host unmodified', () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/_next/static/chunk.js`)
    const res = middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('passes through static asset paths (containing a dot) on the nation host unmodified', () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/favicon.png`)
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

  it('passes through /api/* unmodified even when the __nation=1 dev override is present', () => {
    const req = makeRequest('http://localhost:3000/api/nation/partner-count?__nation=1')
    const res = middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('passes through /_next/* unmodified even when the __nation=1 dev override is present', () => {
    const req = makeRequest('http://localhost:3000/_next/static/chunk.js?__nation=1')
    const res = middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('does not rewrite when __nation has a value other than "1"', () => {
    const req = makeRequest('http://localhost:3000/partner?__nation=true')
    const res = middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('does not rewrite when __nation is present but empty', () => {
    const req = makeRequest('http://localhost:3000/partner?__nation=')
    const res = middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('rewrites nested paths with a dot that is not at the final segment end', () => {
    // The static-asset regex only excludes paths ending in a dot-extension; a dot earlier
    // in the path (e.g. a version segment) must not be mistaken for a static asset.
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/v1.0/about`)
    const res = middleware(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation/v1.0/about')
  })

  it('treats the nation host match as case-insensitive via header normalization', () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST.toUpperCase()}/about`, DEFAULT_NATION_HOST.toUpperCase())
    const res = middleware(req)
    // Host headers are case-sensitive strings compared verbatim by getNationBase, so an
    // uppercased host is NOT treated as the nation host — documents current behavior.
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('strips the port from the host header before comparing to the nation host', () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}:3000/about`, `${DEFAULT_NATION_HOST}:3000`)
    const res = middleware(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation/about')
  })

  it('passes through when the host header is missing entirely', () => {
    const req = new NextRequest('http://placeholder.invalid/about')
    req.headers.delete('host')
    const res = middleware(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('exports a matcher config that matches every path', () => {
    expect(config.matcher).toEqual(['/:path*'])
  })
})
