import { NextResponse } from 'next/server'
import { getNationBase } from '@/lib/nation/host'

// Rewrites the nation subdomain (or a local dev override) to /nation/* internally,
// so it feels like its own site while staying on this same app/deploy. See spec/destiny-nation-landing.md §1.
export function middleware(request) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/nation')) return NextResponse.next()

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
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
