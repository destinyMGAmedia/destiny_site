'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useYellowPagesBase } from './YellowPagesChrome'

const MAIN_SITE_URL = 'https://www.destinymissionglobal.org'

const TABS = [
  { path: '', label: 'Home' },
  { path: '/search', label: 'Browse' },
  { path: '/register', label: 'List Your Skill or Business', accent: true },
]

export default function Nav() {
  const base = useYellowPagesBase()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const homePath = base === '' ? '/' : base

  const hrefFor = (tabPath) => (tabPath === '' ? homePath : `${base}${tabPath}`)
  const isActive = (tabPath) =>
    tabPath === '' ? pathname === homePath : pathname.startsWith(hrefFor(tabPath))

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b" style={{ background: 'rgba(255, 252, 245, 0.95)', borderColor: 'var(--yp-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
        <Link href={homePath} className="font-bold tracking-wide text-sm sm:text-base shrink-0 flex items-center gap-1.5">
          <span className="inline-block w-6 h-6 rounded" style={{ background: 'var(--yp-yellow-500)' }} />
          <span>The Yellow Pages</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {TABS.map((tab) => (
            <Link
              key={tab.path}
              href={hrefFor(tab.path)}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                tab.accent
                  ? 'yp-btn-primary !py-2 !px-4'
                  : isActive(tab.path)
                  ? ''
                  : 'hover:opacity-70'
              }`}
              style={
                !tab.accent
                  ? { color: 'var(--yp-ink)', background: isActive(tab.path) ? 'var(--yp-yellow-100)' : 'transparent' }
                  : undefined
              }
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <a
          href={MAIN_SITE_URL}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border shrink-0 transition-colors hover:opacity-70"
          style={{ borderColor: 'var(--yp-ink)', color: 'var(--yp-ink)' }}
        >
          Main Site <ArrowUpRight size={13} />
        </a>

        <button
          className="md:hidden p-2"
          style={{ color: 'var(--yp-ink)' }}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col px-4 pb-4 gap-1 border-t" style={{ borderColor: 'var(--yp-border)' }}>
          {TABS.map((tab) => (
            <Link
              key={tab.path}
              href={hrefFor(tab.path)}
              onClick={() => setOpen(false)}
              className={`px-3 py-3 text-sm font-semibold rounded-lg ${tab.accent ? 'yp-btn-primary' : ''}`}
              style={!tab.accent ? { color: 'var(--yp-ink)', background: isActive(tab.path) ? 'var(--yp-yellow-100)' : 'transparent' } : undefined}
            >
              {tab.label}
            </Link>
          ))}
          <a
            href={MAIN_SITE_URL}
            className="flex items-center justify-center gap-1.5 mt-2 px-3 py-3 text-sm font-bold rounded-lg border"
            style={{ borderColor: 'var(--yp-ink)', color: 'var(--yp-ink)' }}
          >
            Destiny Mission Global Assembly <ArrowUpRight size={14} />
          </a>
        </nav>
      )}
    </header>
  )
}
