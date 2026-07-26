import { NextResponse } from 'next/server'
import { getNationBase } from '@/lib/nation/host'

// Rewrites the nation subdomain (or a local dev override) to /nation/* internally,
// so it feels like its own site while staying on this same app/deploy. See spec/destiny-nation-landing.md §1.
//
// Named `proxy` (not `middleware`) and this file is named proxy.js — Next.js 16 renamed
// Middleware to Proxy; a leftover middleware.js/export function middleware is compiled
// and still shows up in the build output, but is silently never invoked at runtime.
// See https://nextjs.org/docs/messages/middleware-to-proxy.
//
// Exclusions are handled here in plain JS rather than in the matcher's regex — a
// negative-lookahead matcher (e.g. '/((?!api|_next|.*\\..*).*)') is known to behave
// inconsistently between `next dev` and the deployed Edge Runtime on some Next.js
// versions, which silently no-ops the whole proxy in production while working
// fine locally. Matching every request and filtering inside the function body is
// unambiguous and behaves identically in both environments.
export function proxy(request) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/nation') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    /\.[a-zA-Z0-9]+$/.test(pathname) // static assets, e.g. /favicon.png, /robots.txt
  ) {
    return NextResponse.next()
  }

  const host = request.headers.get('host') || ''
  const onNationHost = getNationBase(host) === ''
  const devOverride = request.nextUrl.searchParams.get('__nation') === '1'

  if (onNationHost || devOverride) {
    const url = request.nextUrl.clone()
    url.pathname = `/nation${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'],
}
