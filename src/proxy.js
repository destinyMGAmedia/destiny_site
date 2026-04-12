import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function proxy(req) {
  const { pathname } = req.nextUrl
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
  const globalOnlyPaths = ['/admin/admins', '/admin/assemblies/new', '/admin/channels', '/admin/hero-slides']
  if (
    globalOnlyPaths.some((p) => pathname.startsWith(p)) &&
    !['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(role)
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/assemblies/:path*',
    '/admin/admins/:path*',
    '/admin/channels/:path*',
    '/admin/hero-slides/:path*',
    '/admin/system/:path*',
  ],
}
