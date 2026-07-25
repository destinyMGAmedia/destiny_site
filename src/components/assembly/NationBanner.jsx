import { ArrowRight, Sparkles } from 'lucide-react'

// Global, always-on promotional banner for Destiny Nation — The Gatekeepers Commission.
// Hardcoded church-wide (not a per-assembly toggle) per spec/destiny-nation-landing.md §5.
// Also reused across the other major public pages (media, royal-feed, about, events, assemblies)
// as the site-wide "heralding" callout — skipped only on kids/portal pages (Treasures, Games,
// Growth Track) where an adult fundraising campaign banner would be tonally out of place.
const NATION_URL = process.env.NEXT_PUBLIC_NATION_URL || '/nation'

export default function NationBanner() {
  return (
    <a
      href={NATION_URL}
      className="group flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center py-3.5 px-4 text-sm transition-colors"
      style={{ background: 'linear-gradient(90deg, var(--purple-900), var(--purple-800))' }}
    >
      <span
        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0"
        style={{ background: 'var(--gold-500)', color: 'var(--purple-900)' }}
      >
        <Sparkles size={11} /> New
      </span>
      <span>
        Introducing{' '}
        <span className="font-bold" style={{ color: 'var(--gold-500)' }}>
          Destiny Nation — The Gatekeepers Commission
        </span>
      </span>
      <span className="text-white/70">30 Gates &middot; 30 Years &middot; One Legacy</span>
      <span className="inline-flex items-center gap-1 font-bold text-white group-hover:gap-1.5 transition-all shrink-0">
        Explore Now <ArrowRight size={14} />
      </span>
    </a>
  )
}
