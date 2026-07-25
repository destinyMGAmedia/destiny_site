'use client'
import Link from 'next/link'
import { useNationBase } from './NationChrome'

const QUICK_LINKS = [
  { path: '/gates/internal', label: 'Internal Gates' },
  { path: '/gates/influence', label: 'Influence Gates' },
  { path: '/projects', label: 'Legacy Projects' },
  { path: '/partner', label: 'Get Involved' },
]

export default function Footer() {
  const base = useNationBase()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16" style={{ background: 'var(--purple-900)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-10 mb-12">
          <div>
            <p className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-500)' }}>
              Destiny Nation
            </p>
            <p className="text-sm text-white/50 mb-1">The Gatekeepers Commission</p>
            <p className="text-sm font-semibold text-white/70">30 Gates &middot; 30 Years &middot; One Legacy</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--gold-500)' }}>Explore</h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.path}>
                  <Link href={`${base}${link.path}`} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--gold-500)' }}>A Ministry Of</h4>
            <a
              href="https://www.destinymissionglobal.org"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Destiny Mission Global Assembly
            </a>
            <p className="text-sm text-white/40 mt-3 leading-relaxed">
              We don&rsquo;t just build churches. We build the leaders who build nations.
            </p>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p>&copy; {year} Destiny Mission Global Assembly. All rights reserved.</p>
          <a href="https://www.destinymissionglobal.org" className="hover:text-white transition-colors">
            www.destinymissionglobal.org
          </a>
        </div>
      </div>
    </footer>
  )
}
