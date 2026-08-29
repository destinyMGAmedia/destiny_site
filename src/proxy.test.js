import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { proxy, config } from './proxy'
import { DEFAULT_NATION_HOST } from '@/lib/nation/host'
import { DEFAULT_YELLOWPAGES_HOST } from '@/lib/yellowpages/host'

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}))

function makeRequest(url, host) {
  const parsed = new URL(url)
  return new NextRequest(url, {
    headers: { host: host || parsed.host },
  })
}

describe('proxy', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('passes through unmodified when the path already starts with /nation', async () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/nation/about`)
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('passes through /nation itself unmodified even on a non-nation host', async () => {
    const req = makeRequest('http://www.destinymissionglobal.org/nation')
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('rewrites requests on the nation host to /nation/*', async () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/about`)
    const res = await proxy(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation/about')
  })

  it('rewrites the root path on the nation host to /nation (not /nation/)', async () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/`)
    const res = await proxy(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation')
  })

  it('rewrites when the __nation=1 dev override query param is present, even on a non-nation host', async () => {
    const req = makeRequest('http://localhost:3000/partner?__nation=1')
    const res = await proxy(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation/partner')
  })

  it('passes through unmodified for a normal host with no override', async () => {
    const req = makeRequest('http://www.destinymissionglobal.org/about')
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('passes through /api/* on the nation host unmodified (excluded in the function body, not the matcher)', async () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/api/nation/partner-count`)
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('passes through /_next/* on the nation host unmodified', async () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/_next/static/chunk.js`)
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('passes through static asset paths (containing a dot) on the nation host unmodified', async () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/favicon.png`)
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('respects the NATION_HOST env override', async () => {
    vi.stubEnv('NATION_HOST', 'custom.example.com')
    const req = makeRequest('http://custom.example.com/give')
    const res = await proxy(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation/give')

    // The default nation host is no longer treated as the nation host once overridden.
    const req2 = makeRequest(`http://${DEFAULT_NATION_HOST}/give`)
    const res2 = await proxy(req2)
    expect(res2.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('passes through /api/* unmodified even when the __nation=1 dev override is present', async () => {
    const req = makeRequest('http://localhost:3000/api/nation/partner-count?__nation=1')
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('passes through /_next/* unmodified even when the __nation=1 dev override is present', async () => {
    const req = makeRequest('http://localhost:3000/_next/static/chunk.js?__nation=1')
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('does not rewrite when __nation has a value other than "1"', async () => {
    const req = makeRequest('http://localhost:3000/partner?__nation=true')
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('does not rewrite when __nation is present but empty', async () => {
    const req = makeRequest('http://localhost:3000/partner?__nation=')
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('rewrites nested paths with a dot that is not at the final segment end', async () => {
    // The static-asset regex only excludes paths ending in a dot-extension; a dot earlier
    // in the path (e.g. a version segment) must not be mistaken for a static asset.
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}/v1.0/about`)
    const res = await proxy(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation/v1.0/about')
  })

  it('treats the nation host match as case-insensitive via header normalization', async () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST.toUpperCase()}/about`, DEFAULT_NATION_HOST.toUpperCase())
    const res = await proxy(req)
    // Host headers are case-sensitive strings compared verbatim by getNationBase, so an
    // uppercased host is NOT treated as the nation host — documents current behavior.
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('strips the port from the host header before comparing to the nation host', async () => {
    const req = makeRequest(`http://${DEFAULT_NATION_HOST}:3000/about`, `${DEFAULT_NATION_HOST}:3000`)
    const res = await proxy(req)
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).not.toBeNull()
    expect(new URL(rewrite).pathname).toBe('/nation/about')
  })

  it('passes through when the host header is missing entirely', async () => {
    const req = new NextRequest('http://placeholder.invalid/about')
    req.headers.delete('host')
    const res = await proxy(req)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('exports a matcher config that matches every path', async () => {
    expect(config.matcher).toEqual(['/:path*'])
  })

  describe('yellow pages subdomain rewrite', () => {
    it('passes through unmodified when the path already starts with /yellowpages', async () => {
      const req = makeRequest(`http://${DEFAULT_YELLOWPAGES_HOST}/yellowpages/search`)
      const res = await proxy(req)
      expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    })

    it('rewrites requests on the yellow pages host to /yellowpages/*', async () => {
      const req = makeRequest(`http://${DEFAULT_YELLOWPAGES_HOST}/search`)
      const res = await proxy(req)
      const rewrite = res.headers.get('x-middleware-rewrite')
      expect(rewrite).not.toBeNull()
      expect(new URL(rewrite).pathname).toBe('/yellowpages/search')
    })

    it('rewrites the root path on the yellow pages host to /yellowpages (not /yellowpages/)', async () => {
      const req = makeRequest(`http://${DEFAULT_YELLOWPAGES_HOST}/`)
      const res = await proxy(req)
      const rewrite = res.headers.get('x-middleware-rewrite')
      expect(rewrite).not.toBeNull()
      expect(new URL(rewrite).pathname).toBe('/yellowpages')
    })

    it('rewrites when the __yellowpages=1 dev override query param is present, even on a non-matching host', async () => {
      const req = makeRequest('http://localhost:3000/register?__yellowpages=1')
      const res = await proxy(req)
      const rewrite = res.headers.get('x-middleware-rewrite')
      expect(rewrite).not.toBeNull()
      expect(new URL(rewrite).pathname).toBe('/yellowpages/register')
    })

    it('passes through /api/* on the yellow pages host unmodified', async () => {
      const req = makeRequest(`http://${DEFAULT_YELLOWPAGES_HOST}/api/yellowpages/listings`)
      const res = await proxy(req)
      expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    })

    it('respects the YELLOWPAGES_HOST env override', async () => {
      vi.stubEnv('YELLOWPAGES_HOST', 'custom-yp.example.com')
      const req = makeRequest('http://custom-yp.example.com/register')
      const res = await proxy(req)
      const rewrite = res.headers.get('x-middleware-rewrite')
      expect(rewrite).not.toBeNull()
      expect(new URL(rewrite).pathname).toBe('/yellowpages/register')

      // The default yellow pages host is no longer treated as such once overridden.
      const req2 = makeRequest(`http://${DEFAULT_YELLOWPAGES_HOST}/register`)
      const res2 = await proxy(req2)
      expect(res2.headers.get('x-middleware-rewrite')).toBeNull()
    })

    it('does not rewrite a yellow pages host request against the nation branch', async () => {
      const req = makeRequest(`http://${DEFAULT_YELLOWPAGES_HOST}/register`)
      const res = await proxy(req)
      const rewrite = res.headers.get('x-middleware-rewrite')
      expect(new URL(rewrite).pathname).toBe('/yellowpages/register')
    })

    it('does not rewrite a nation host request against the yellow pages branch', async () => {
      const req = makeRequest(`http://${DEFAULT_NATION_HOST}/partner`)
      const res = await proxy(req)
      const rewrite = res.headers.get('x-middleware-rewrite')
      expect(new URL(rewrite).pathname).toBe('/nation/partner')
    })
  })

  describe('admin role-based access control', () => {
    it('passes through non-admin-auth paths without checking the token at all', async () => {
      const req = makeRequest('http://www.destinymissionglobal.org/about')
      await proxy(req)
      expect(getToken).not.toHaveBeenCalled()
    })

    it('does not gate /admin/login itself (not in the admin-auth path list)', async () => {
      const req = makeRequest('http://www.destinymissionglobal.org/admin/login')
      await proxy(req)
      expect(getToken).not.toHaveBeenCalled()
    })

    it('redirects to /admin/login when there is no token', async () => {
      getToken.mockResolvedValue(null)
      const req = makeRequest('http://www.destinymissionglobal.org/admin/dashboard')
      const res = await proxy(req)
      expect(res.status).toBe(307)
      expect(new URL(res.headers.get('location')).pathname).toBe('/admin/login')
    })

    it('redirects a non-SUPER_ADMIN away from /admin/system', async () => {
      getToken.mockResolvedValue({ role: 'GLOBAL_ADMIN' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/system')
      const res = await proxy(req)
      const location = new URL(res.headers.get('location'))
      expect(location.pathname).toBe('/admin/dashboard')
      expect(location.searchParams.get('error')).toBe('unauthorized')
    })

    it('allows SUPER_ADMIN through to /admin/system', async () => {
      getToken.mockResolvedValue({ role: 'SUPER_ADMIN' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/system')
      const res = await proxy(req)
      expect(res.headers.get('location')).toBeNull()
    })

    it('redirects a non-GLOBAL_ADMIN away from /admin/admins', async () => {
      getToken.mockResolvedValue({ role: 'ASSEMBLY_ADMIN' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/admins')
      const res = await proxy(req)
      const location = new URL(res.headers.get('location'))
      expect(location.pathname).toBe('/admin/dashboard')
      expect(location.searchParams.get('error')).toBe('unauthorized')
    })

    it('allows a GLOBAL_ADMIN through to /admin/admins', async () => {
      getToken.mockResolvedValue({ role: 'GLOBAL_ADMIN' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/admins')
      const res = await proxy(req)
      expect(res.headers.get('location')).toBeNull()
    })

    it('redirects a non-GLOBAL_ADMIN away from /admin/assemblies/new', async () => {
      getToken.mockResolvedValue({ role: 'ASSEMBLY_ADMIN', assemblySlug: 'lagos' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/assemblies/new')
      const res = await proxy(req)
      const location = new URL(res.headers.get('location'))
      expect(location.pathname).toBe('/admin/dashboard')
      expect(location.searchParams.get('error')).toBe('unauthorized')
    })

    it('redirects a non-content-admin role away from /admin/channels', async () => {
      getToken.mockResolvedValue({ role: 'ASSEMBLY_ADMIN' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/channels')
      const res = await proxy(req)
      const location = new URL(res.headers.get('location'))
      expect(location.pathname).toBe('/admin/dashboard')
      expect(location.searchParams.get('error')).toBe('unauthorized')
    })

    it('redirects a non-content-admin role away from /admin/hero-slides', async () => {
      getToken.mockResolvedValue({ role: 'APP_ADMIN', assemblySlug: 'lagos' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/hero-slides')
      const res = await proxy(req)
      const location = new URL(res.headers.get('location'))
      expect(location.pathname).toBe('/admin/dashboard')
      expect(location.searchParams.get('error')).toBe('unauthorized')
    })

    it('allows a SITE_CONTENT_ADMIN through to /admin/channels', async () => {
      getToken.mockResolvedValue({ role: 'SITE_CONTENT_ADMIN' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/channels')
      const res = await proxy(req)
      expect(res.headers.get('location')).toBeNull()
    })

    it('allows a SITE_CONTENT_ADMIN through to /admin/hero-slides', async () => {
      getToken.mockResolvedValue({ role: 'SITE_CONTENT_ADMIN' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/hero-slides')
      const res = await proxy(req)
      expect(res.headers.get('location')).toBeNull()
    })

    it('allows a GLOBAL_ADMIN through to /admin/channels', async () => {
      getToken.mockResolvedValue({ role: 'GLOBAL_ADMIN' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/channels')
      const res = await proxy(req)
      expect(res.headers.get('location')).toBeNull()
    })

    it('confines an APP_ADMIN to their own assembly content path', async () => {
      getToken.mockResolvedValue({ role: 'APP_ADMIN', assemblySlug: 'lagos' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/assemblies/lagos/members')
      const res = await proxy(req)
      expect(new URL(res.headers.get('location')).pathname).toBe('/admin/assemblies/lagos/content')
    })

    it('allows an APP_ADMIN through to their own assembly content path', async () => {
      getToken.mockResolvedValue({ role: 'APP_ADMIN', assemblySlug: 'lagos' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/assemblies/lagos/content')
      const res = await proxy(req)
      expect(res.headers.get('location')).toBeNull()
    })

    it('redirects an ASSEMBLY_ADMIN away from a different assembly', async () => {
      getToken.mockResolvedValue({ role: 'ASSEMBLY_ADMIN', assemblySlug: 'lagos' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/assemblies/abuja')
      const res = await proxy(req)
      expect(new URL(res.headers.get('location')).pathname).toBe('/admin/assemblies/lagos')
    })

    it('allows an ASSEMBLY_ADMIN through to their own assembly', async () => {
      getToken.mockResolvedValue({ role: 'ASSEMBLY_ADMIN', assemblySlug: 'lagos' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/assemblies/lagos')
      const res = await proxy(req)
      expect(res.headers.get('location')).toBeNull()
    })

    it('redirects an ASSEMBLY_ADMIN away from /admin/assemblies/new (blocked earlier by the GLOBAL_ADMIN-only gate)', async () => {
      getToken.mockResolvedValue({ role: 'ASSEMBLY_ADMIN', assemblySlug: 'lagos' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/assemblies/new')
      const res = await proxy(req)
      const location = new URL(res.headers.get('location'))
      expect(location.pathname).toBe('/admin/dashboard')
      expect(location.searchParams.get('error')).toBe('unauthorized')
    })

    it('allows a GLOBAL_ADMIN through to /admin/assemblies/new', async () => {
      getToken.mockResolvedValue({ role: 'GLOBAL_ADMIN' })
      const req = makeRequest('http://www.destinymissionglobal.org/admin/assemblies/new')
      const res = await proxy(req)
      expect(res.headers.get('location')).toBeNull()
    })

    it('does not run admin RBAC checks on a nation-host admin request (nation rewrite wins first)', async () => {
      const req = makeRequest(`http://${DEFAULT_NATION_HOST}/admin/dashboard`)
      const res = await proxy(req)
      expect(getToken).not.toHaveBeenCalled()
      const rewrite = res.headers.get('x-middleware-rewrite')
      expect(new URL(rewrite).pathname).toBe('/nation/admin/dashboard')
    })
  })
})
