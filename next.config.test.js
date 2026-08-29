import nextConfig from './next.config.js'

describe('next.config.js', () => {
  it('exports a plain config object', () => {
    expect(nextConfig).toBeTypeOf('object')
    expect(nextConfig).not.toBeNull()
  })

  it('pins outputFileTracingRoot to the project directory', () => {
    expect(nextConfig.outputFileTracingRoot).toBe(__dirname)
    expect(nextConfig.outputFileTracingRoot).not.toMatch(/vercel.*vercel/)
  })

  it('externalises @react-pdf/renderer and force-includes pdfkit assets for the résumé route', () => {
    expect(nextConfig.serverExternalPackages).toContain('@react-pdf/renderer')
    const includes = nextConfig.outputFileTracingIncludes
    expect(includes['/api/yellowpages/listings/[id]/resume']).toEqual(
      expect.arrayContaining(['./node_modules/pdfkit/js/**/*'])
    )
  })

  describe('images config', () => {
    it('allows SVGs and forces attachment content-disposition', () => {
      expect(nextConfig.images.dangerouslyAllowSVG).toBe(true)
      expect(nextConfig.images.contentDispositionType).toBe('attachment')
    })

    it('sets a locked-down content security policy for served images', () => {
      const csp = nextConfig.images.contentSecurityPolicy
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("script-src 'none'")
      expect(csp).toContain('sandbox')
    })

    it('defines remotePatterns as a non-empty array', () => {
      expect(Array.isArray(nextConfig.images.remotePatterns)).toBe(true)
      expect(nextConfig.images.remotePatterns.length).toBeGreaterThan(0)
    })

    it('whitelists the expected image hosts over https', () => {
      const hostnames = nextConfig.images.remotePatterns.map((p) => p.hostname)
      expect(hostnames).toEqual(
        expect.arrayContaining([
          'res.cloudinary.com',
          'i.ytimg.com',
          'img.youtube.com',
          'placehold.co',
          '**.unsplash.com',
        ])
      )
      nextConfig.images.remotePatterns.forEach((pattern) => {
        expect(pattern.protocol).toBe('https')
      })
    })

    it('scopes the unsplash wildcard pattern to all paths', () => {
      const unsplash = nextConfig.images.remotePatterns.find((p) => p.hostname === '**.unsplash.com')
      expect(unsplash).toBeDefined()
      expect(unsplash.pathname).toBe('/**')
    })

    it('does not include any insecure http remote patterns', () => {
      nextConfig.images.remotePatterns.forEach((pattern) => {
        expect(pattern.protocol).not.toBe('http')
      })
    })
  })
})
