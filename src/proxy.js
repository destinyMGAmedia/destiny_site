import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { getNationBase } from '@/lib/nation/host'
import { getYellowPagesBase } from '@/lib/yellowpages/host'

// Next.js only supports a single proxy.js per project, so this combines three
// previously-separate concerns that both need to run before routing:
// 1. Destiny Nation subdomain rewrite (host-based, or ?__nation=1 dev override) —
//    see spec/destiny-nation-landing.md §1.
// 2. The Yellow Pages subdomain rewrite (host-based, or ?__yellowpages=1 dev override) —
//    see spec/theyellowpages.md. Independent of the nation rewrite above — a request only
//    ever matches one subdomain host, so at most one of these two blocks fires.
// 3. Admin role-based access control (redirects unauthenticated/unauthorized admin requests) —
//    pre-existing logic, unchanged from before this file absorbed the subdomain rewrites.
//
// A second root-level middleware.js/proxy.js previously lived alongside this file and was
// silently never invoked at runtime (Next.js only wires up the one canonical proxy file,
// which for a `src/app` project must be src/proxy.js) — that duplicate has been removed.
export async function proxy(req) {
  const { pathname } = req.nextUrl

  if (
    !pathname.startsWith('/nation') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !/\.[a-zA-Z0-9]+$/.test(pathname) // static assets, e.g. /favicon.png, /robots.txt
  ) {
    const host = req.headers.get('host') || ''
    const onNationHost = getNationBase(host) === ''
    const devOverride = req.nextUrl.searchParams.get('__nation') === '1'

    if (onNationHost || devOverride) {
      const url = req.nextUrl.clone()
      url.pathname = `/nation${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }
  }

  if (
    !pathname.startsWith('/yellowpages') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !/\.[a-zA-Z0-9]+$/.test(pathname) // static assets, e.g. /favicon.png, /robots.txt
  ) {
    const host = req.headers.get('host') || ''
    const onYellowPagesHost = getYellowPagesBase(host) === ''
    const devOverride = req.nextUrl.searchParams.get('__yellowpages') === '1'

    if (onYellowPagesHost || devOverride) {
      const url = req.nextUrl.clone()
      url.pathname = `/yellowpages${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }
  }

  const ADMIN_AUTH_PATHS = [
    '/admin/dashboard',
    '/admin/assemblies',
    '/admin/admins',
    '/admin/channels',
    '/admin/hero-slides',
    '/admin/system',
    '/admin/yellowpages',
  ]
  if (ADMIN_AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    const role = token.role
    const assemblySlug = token.assemblySlug

    // ── SUPER_ADMIN only ─────────────────────────────
    if (pathname.startsWith('/admin/system') && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard?error=unauthorized', req.url))
    }

    // ── GLOBAL_ADMIN and above only ──────────────────
    const globalOnlyPaths = ['/admin/admins', '/admin/assemblies/new', '/admin/yellowpages']
    if (
      globalOnlyPaths.some((p) => pathname.startsWith(p)) &&
      !['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(role)
    ) {
      return NextResponse.redirect(new URL('/admin/dashboard?error=unauthorized', req.url))
    }

    // ── GLOBAL_ADMIN + SITE_CONTENT_ADMIN ────────────
    const contentAdminPaths = ['/admin/channels', '/admin/hero-slides']
    if (
      contentAdminPaths.some((p) => pathname.startsWith(p)) &&
      !['SUPER_ADMIN', 'GLOBAL_ADMIN', 'SITE_CONTENT_ADMIN'].includes(role)
    ) {
      return NextResponse.redirect(new URL('/admin/dashboard?error=unauthorized', req.url))
    }

    // ── APP_ADMIN restrictions ───────────────────────
    if (role === 'APP_ADMIN') {
      const allowedPrefix = `/admin/assemblies/${assemblySlug}/content`
      if (!pathname.startsWith(allowedPrefix) && !pathname.startsWith('/api/upload')) {
        return NextResponse.redirect(new URL(allowedPrefix, req.url))
      }
    }

    // ── ASSEMBLY_ADMIN restrictions ──────────────────
    if (role === 'ASSEMBLY_ADMIN' && pathname.startsWith('/admin/assemblies/')) {
      const slug = pathname.split('/')[3]
      if (slug && slug !== assemblySlug && slug !== 'new') {
        return NextResponse.redirect(new URL(`/admin/assemblies/${assemblySlug}`, req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'],
}
