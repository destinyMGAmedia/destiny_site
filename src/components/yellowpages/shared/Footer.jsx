'use client'
import Link from 'next/link'
import { useYellowPagesBase } from './YellowPagesChrome'

const QUICK_LINKS = [
  { path: '/browse', label: 'Browse the Directory' },
  { path: '/register', label: 'List Your Skill or Business' },
]

export default function Footer() {
  const base = useYellowPagesBase()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t" style={{ background: 'var(--yp-ink)', borderColor: 'var(--yp-ink)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-white/80">
        <div className="grid sm:grid-cols-3 gap-10 mb-12">
          <div>
            <p className="font-bold text-lg mb-2 flex items-center gap-2" style={{ color: 'var(--yp-yellow-400)' }}>
              <span className="inline-block w-5 h-5 rounded" style={{ background: 'var(--yp-yellow-400)' }} />
              The Yellow Pages
            </p>
            <p className="text-sm text-white/50">
              A directory of skills and businesses from across the Destiny Mission Global family — searchable by category and location.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--yp-yellow-400)' }}>Explore</h4>
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
            <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--yp-yellow-400)' }}>A Ministry Of</h4>
            <a href="https://www.destinymissionglobal.org" className="text-sm text-white/60 hover:text-white transition-colors">
              Destiny Mission Global Assembly
            </a>
            <p className="text-sm text-white/40 mt-3 leading-relaxed">
              Open to everyone in the Destiny family — no login required to browse or list.
            </p>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p>&copy; {year} Destiny Mission Global Assembly. All rights reserved.</p>
          <a href="https://www.destinymissionglobal.org" className="hover:text-white transition-colors">
            www.destinymissionglobal.org
          </a>
        </div>
      </div>
    </footer>
  )
}
