'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Rss, Plus, UserCog, Search } from 'lucide-react'
import { useYellowPagesBase } from './YellowPagesChrome'

const TABS = [
  { path: '/browse', icon: Rss, label: 'Home feed' },
  { path: '/register', icon: Plus, label: 'List your skill or business', accent: true },
  { path: '/manage', icon: UserCog, label: 'Manage my listing' },
]

export default function Nav() {
  const base = useYellowPagesBase()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const hrefFor = (path) => `${base}${path}`
  const isActive = (path) => pathname.startsWith(hrefFor(path))
  const showFilters = pathname.startsWith(hrefFor('/browse')) || pathname.includes('/category/')

  const [q, setQ] = useState(searchParams.get('q') || '')
  const [assemblySlug, setAssemblySlug] = useState(searchParams.get('assemblySlug') || '')
  const [assemblies, setAssemblies] = useState([])

  useEffect(() => {
    if (!showFilters) return
    fetch('/api/assemblies')
      .then((res) => res.json())
      .then((data) => setAssemblies(Array.isArray(data) ? data : []))
      .catch(() => setAssemblies([]))
  }, [showFilters])

  // Keep local inputs in sync if the URL changes from elsewhere (e.g. a category chip reset).
  useEffect(() => {
    setQ(searchParams.get('q') || '')
    setAssemblySlug(searchParams.get('assemblySlug') || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('q'), searchParams.get('assemblySlug')])

  const pushParams = (mutate) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Debounced text search.
  useEffect(() => {
    if (!showFilters) return
    const timeout = setTimeout(() => {
      if (q === (searchParams.get('q') || '')) return
      pushParams((params) => (q.trim() ? params.set('q', q.trim()) : params.delete('q')))
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, showFilters])

  const handleAssemblyChange = (value) => {
    setAssemblySlug(value)
    pushParams((params) => (value ? params.set('assemblySlug', value) : params.delete('assemblySlug')))
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b" style={{ background: 'rgba(255, 252, 245, 0.95)', borderColor: 'var(--yp-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
        <Link href={hrefFor('/browse')} className="font-bold tracking-wide text-sm sm:text-base shrink-0 flex items-center gap-1.5">
          <span className="inline-block w-6 h-6 rounded" style={{ background: 'var(--yp-yellow-600)' }} />
          <span className="hidden sm:inline">The Yellow Pages</span>
        </Link>

        {showFilters && (
          <div className="flex-1 min-w-0 flex items-center gap-2 max-w-xl">
            <div className="relative flex-1 min-w-0">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--yp-ink-soft)' }} />
              <input
                className="yp-input !pl-8 !py-1.5 text-sm"
                placeholder="Search skills, services, businesses…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search"
              />
            </div>
            <select
              className="yp-select !py-1.5 !w-auto text-sm hidden sm:block"
              value={assemblySlug}
              onChange={(e) => handleAssemblyChange(e.target.value)}
              aria-label="Assembly"
            >
              <option value="">All Assemblies</option>
              {assemblies.map((a) => (
                <option key={a.slug} value={a.slug}>{a.name}</option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex items-center gap-1.5 shrink-0">
          {TABS.map((tab) => (
            <Link
              key={tab.path}
              href={hrefFor(tab.path)}
              aria-label={tab.label}
              title={tab.label}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${tab.accent ? 'yp-btn-primary !w-10 !h-10 !p-0' : ''}`}
              style={
                !tab.accent
                  ? { color: 'var(--yp-ink)', background: isActive(tab.path) ? 'var(--yp-yellow-100)' : 'transparent' }
                  : undefined
              }
            >
              <tab.icon size={18} />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
