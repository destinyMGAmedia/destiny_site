'use client'
import Link from 'next/link'
import { Search, Users, ShieldCheck, ArrowRight, LayoutGrid, FileCheck2, Star } from 'lucide-react'
import { useYellowPagesBase } from '@/components/yellowpages/shared/YellowPagesChrome'
import CategoryShowcase from '@/components/yellowpages/CategoryShowcase'
import WorkersIllustration from '@/components/yellowpages/WorkersIllustration'

const STEPS = [
  { icon: Search, title: 'Search', body: 'Look up a skill, service, or business by category and location.' },
  { icon: Users, title: 'Connect', body: 'One tap to call, WhatsApp, or email — straight to the person, no middleman.' },
  { icon: ShieldCheck, title: 'Trust', body: 'Star ratings and reviews on every profile, so you reach out with confidence.' },
]

// Every listing also gets these — framed as bonuses on top of the core "find help / get found"
// pitch, not as the headline of the product.
const PERKS = [
  { icon: LayoutGrid, title: 'Every listing is a portfolio', body: 'Banner, work gallery, projects, and contact in one tap — a real page you can share, not just a row in a list.' },
  { icon: FileCheck2, title: 'ATS résumé for professionals', body: 'Personal listings can export an ATS-compliant résumé straight from their portfolio — a bonus for members job-hunting.' },
  { icon: Star, title: 'Reviews build your reputation', body: 'Ratings and written reviews on every profile — your average shows on your card and page.' },
]

// The cover page — deliberately has no Nav (see src/app/yellowpages/layout.jsx). Leads with
// the core value (find trusted help / get found), with the portfolio + résumé features as perks.
export default function YellowPagesCoverPage() {
  const base = useYellowPagesBase()

  return (
    <div>
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 flex items-center gap-2 font-bold">
        <span className="inline-block w-6 h-6 rounded" style={{ background: 'var(--yp-yellow-600)' }} />
        The Yellow Pages
      </header>

      {/* HERO — the core pitch: find the right person */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight" style={{ color: 'var(--yp-ink)' }}>
            Need it done? Find the right person, right here in the family
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--yp-ink-soft)' }}>
            The Yellow Pages is a directory of members&rsquo; skills and businesses. Search by
            category and location, then reach out directly — phone, WhatsApp, or email. Free to
            search, free to list.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`${base}/browse`} className="yp-btn-primary">
              Explore the Directory <ArrowRight size={16} />
            </Link>
            <Link href={`${base}/register`} className="yp-btn-outline">
              List your skill or business
            </Link>
          </div>
        </div>
        <WorkersIllustration />
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-6">
        {STEPS.map((step) => (
          <div key={step.title} className="yp-card p-6">
            <step.icon size={22} style={{ color: 'var(--yp-yellow-600)' }} className="mb-3" />
            <h3 className="font-bold mb-1">{step.title}</h3>
            <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>{step.body}</p>
          </div>
        ))}
      </section>

      {/* GET FOUND — the other half of the core pitch */}
      <section className="px-4 sm:px-6 py-16" style={{ background: 'var(--yp-yellow-100)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--yp-ink)' }}>
              Offer a skill? Run a business? Get found.
            </h2>
            <p className="mb-5" style={{ color: 'var(--yp-ink-soft)' }}>
              List what you do — for free — and let people looking for exactly that reach out to
              you. Already a registered member? List with the phone or email on your record and
              your listing links to your profile automatically.
            </p>
            <Link href={`${base}/register`} className="yp-btn-primary">
              List your skill or business <ArrowRight size={16} />
            </Link>
          </div>
          <div className="yp-card p-8 text-center">
            <Search size={40} style={{ color: 'var(--yp-yellow-600)' }} className="mx-auto mb-3" />
            <p className="font-semibold" style={{ color: 'var(--yp-ink)' }}>
              People search this directory every day to find trusted help. Be the result they find.
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--yp-ink)' }}>What&rsquo;s in the directory</h2>
        <p className="mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
          From trades to tech, hospitality to health — a growing list of categories.
        </p>
        <CategoryShowcase />
      </section>

      {/* PERKS — added features, clearly secondary */}
      <section className="px-4 sm:px-6 py-14" style={{ background: 'var(--yp-cream)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--yp-yellow-700)' }}>
            And every listing does more
          </p>
          <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--yp-ink)' }}>
            More than a line in a phone book
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {PERKS.map((perk) => (
              <div key={perk.title} className="yp-card p-6">
                <perk.icon size={22} style={{ color: 'var(--yp-yellow-600)' }} className="mb-3" />
                <h3 className="font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>{perk.title}</h3>
                <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>{perk.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="text-center px-4 sm:px-6 py-16" style={{ background: 'var(--yp-yellow-100)' }}>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--yp-ink)' }}>Find who you need. Or get found.</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href={`${base}/browse`} className="yp-btn-primary">
            Explore the Directory <ArrowRight size={16} />
          </Link>
          <Link href={`${base}/register`} className="yp-btn-outline">
            List your skill or business
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
        A ministry of Destiny Mission Global Assembly
      </footer>
    </div>
  )
}
