'use client'
import Link from 'next/link'
import { Search, Users, ShieldCheck, ArrowRight } from 'lucide-react'
import { useYellowPagesBase } from '@/components/yellowpages/shared/YellowPagesChrome'
import CategoryShowcase from '@/components/yellowpages/CategoryShowcase'
import WorkersIllustration from '@/components/yellowpages/WorkersIllustration'

const STEPS = [
  { icon: Search, title: 'Search', body: 'Look up a skill, service, or business by category or location.' },
  { icon: Users, title: 'Connect', body: 'Reach out directly by phone, WhatsApp, or email — no middleman.' },
  { icon: ShieldCheck, title: 'Trust', body: 'See ratings from others in the Destiny family before you reach out.' },
]

// The cover page — deliberately has no Nav (see src/app/yellowpages/layout.jsx). Just
// branding, an explanation of what the directory is, and one CTA into the real app.
export default function YellowPagesCoverPage() {
  const base = useYellowPagesBase()

  return (
    <div>
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 flex items-center gap-2 font-bold">
        <span className="inline-block w-6 h-6 rounded" style={{ background: 'var(--yp-yellow-600)' }} />
        The Yellow Pages
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--yp-ink)' }}>
            Skills &amp; Businesses, Right Here in the Family
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--yp-ink-soft)' }}>
            A directory of members&rsquo; skills and businesses from across Destiny Mission Global —
            find who&rsquo;s offering what you need, wherever you are.
          </p>
          <Link href={`${base}/browse`} className="yp-btn-primary">
            Explore the Directory <ArrowRight size={16} />
          </Link>
        </div>
        <WorkersIllustration />
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-6">
        {STEPS.map((step) => (
          <div key={step.title} className="yp-card p-6">
            <step.icon size={22} style={{ color: 'var(--yp-yellow-600)' }} className="mb-3" />
            <h3 className="font-bold mb-1">{step.title}</h3>
            <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>{step.body}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--yp-ink)' }}>What&rsquo;s In the Directory</h2>
        <p className="mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
          From trades to tech, hospitality to health — a growing list of categories.
        </p>
        <CategoryShowcase />
      </section>

      <section className="text-center px-4 sm:px-6 py-16" style={{ background: 'var(--yp-yellow-100)' }}>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--yp-ink)' }}>Ready to look around?</h2>
        <Link href={`${base}/browse`} className="yp-btn-primary">
          Explore the Directory <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="text-center py-6 text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
        A ministry of Destiny Mission Global Assembly
      </footer>
    </div>
  )
}
