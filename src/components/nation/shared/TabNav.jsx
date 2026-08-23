'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useNationBase } from './NationChrome'

const MAIN_SITE_URL = 'https://www.destinymissionglobal.org'

const TABS = [
  { path: '', label: 'Overview' },
  { path: '/gates/internal', label: 'Internal Gates' },
  { path: '/gates/influence', label: 'Influence Gates' },
  { path: '/projects', label: 'Legacy Projects' },
  { path: '/partner', label: 'Get Involved', accent: true },
]

export default function TabNav() {
  const base = useNationBase()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const homePath = base === '' ? '/' : base

  const hrefFor = (tabPath) => (tabPath === '' ? homePath : `${base}${tabPath}`)
  const isActive = (tabPath) =>
    tabPath === '' ? pathname === homePath : pathname.startsWith(hrefFor(tabPath))

  return (
    <header className="sticky top-0 z-50 bg-[#1a0533]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
        <Link href={homePath} className="font-bold tracking-wide text-sm sm:text-base shrink-0" style={{ fontFamily: 'var(--font-serif)' }}>
          <span style={{ color: 'var(--gold-500)' }}>Destiny Nation</span>
          <span className="hidden lg:inline text-white/50 font-normal"> — The Gatekeepers Commission</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {TABS.map((tab) => (
            <Link
              key={tab.path}
              href={hrefFor(tab.path)}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                isActive(tab.path)
                  ? 'text-[#1a0533] bg-white'
                  : tab.accent
                  ? 'hover:bg-white/10'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              style={!isActive(tab.path) && tab.accent ? { color: 'var(--gold-500)' } : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <a
          href={MAIN_SITE_URL}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border shrink-0 transition-colors hover:bg-white/10"
          style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)' }}
        >
          Main Site <ArrowUpRight size={13} />
        </a>

        <button
          className="md:hidden p-2 text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col px-4 pb-4 gap-1 border-t border-white/10">
          {TABS.map((tab) => (
            <Link
              key={tab.path}
              href={hrefFor(tab.path)}
              onClick={() => setOpen(false)}
              className={`px-3 py-3 text-sm font-semibold rounded-lg ${
                isActive(tab.path) ? 'text-[#1a0533] bg-white' : tab.accent ? '' : 'text-white/80'
              }`}
              style={!isActive(tab.path) && tab.accent ? { color: 'var(--gold-500)' } : undefined}
            >
              {tab.label}
            </Link>
          ))}
          <a
            href={MAIN_SITE_URL}
            className="flex items-center justify-center gap-1.5 mt-2 px-3 py-3 text-sm font-bold rounded-lg border"
            style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.9)' }}
          >
            Destiny Mission Global Assembly <ArrowUpRight size={14} />
          </a>
        </nav>
      )}
    </header>
  )
}
