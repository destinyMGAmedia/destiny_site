'use client'
import Link from 'next/link'
import { Search, Users, ShieldCheck, ArrowRight, LayoutGrid, FileCheck2, Building2, Star } from 'lucide-react'
import { useYellowPagesBase } from '@/components/yellowpages/shared/YellowPagesChrome'
import CategoryShowcase from '@/components/yellowpages/CategoryShowcase'
import WorkersIllustration from '@/components/yellowpages/WorkersIllustration'

const STEPS = [
  { icon: Search, title: 'Search', body: 'Browse people or businesses by skill, category, and location.' },
  { icon: Users, title: 'Connect', body: 'One tap to call, WhatsApp, or email — straight to the person, no middleman.' },
  { icon: ShieldCheck, title: 'Trust', body: 'Star ratings and reviews on every profile, so you reach out with confidence.' },
]

// The cover page — deliberately has no Nav (see src/app/yellowpages/layout.jsx). Each new
// feature gets its own "story" section written as punchy marketing copy.
export default function YellowPagesCoverPage() {
  const base = useYellowPagesBase()

  return (
    <div>
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 flex items-center gap-2 font-bold">
        <span className="inline-block w-6 h-6 rounded" style={{ background: 'var(--yp-yellow-600)' }} />
        The Yellow Pages
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full" style={{ background: 'var(--yp-yellow-100)', color: 'var(--yp-yellow-800)' }}>
            Portfolios · Résumés · Directory
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight" style={{ color: 'var(--yp-ink)' }}>
            Your portfolio and your résumé, in one link that opens doors
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--yp-ink-soft)' }}>
            Build a personal or business portfolio in minutes — then export an ATS-compliant
            résumé that sails past the bots and lands on a recruiter&rsquo;s desk. Free, no login to browse.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`${base}/register`} className="yp-btn-primary">
              Create your portfolio <ArrowRight size={16} />
            </Link>
            <Link href={`${base}/browse`} className="yp-btn-outline">
              Explore the Directory
            </Link>
          </div>
        </div>
        <WorkersIllustration />
      </section>

      {/* STORY 1 — personal e-portfolio */}
      <section className="px-4 sm:px-6 py-16" style={{ background: 'var(--yp-yellow-100)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--yp-yellow-700)' }}>
              <LayoutGrid size={15} /> For professionals &amp; artisans
            </p>
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--yp-ink)' }}>
              Everything you do, in one place worth sharing
            </h2>
            <p className="mb-5" style={{ color: 'var(--yp-ink-soft)' }}>
              Skills, experience, projects, a photo gallery, contact in one tap — a real
              e-portfolio site, not a CV buried in someone&rsquo;s inbox. Send one link and let
              your work do the talking.
            </p>
            <Link href={`${base}/register`} className="font-bold inline-flex items-center gap-1" style={{ color: 'var(--yp-yellow-700)' }}>
              Build my portfolio <ArrowRight size={15} />
            </Link>
          </div>
          <div className="yp-card p-8 text-center">
            <LayoutGrid size={40} style={{ color: 'var(--yp-yellow-600)' }} className="mx-auto mb-3" />
            <p className="font-semibold" style={{ color: 'var(--yp-ink)' }}>One link. Every skill, project, and review — beautifully laid out.</p>
          </div>
        </div>
      </section>

      {/* STORY 2 — ATS résumé */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="yp-card p-8 text-center order-2 md:order-1">
            <FileCheck2 size={40} style={{ color: 'var(--yp-yellow-600)' }} className="mx-auto mb-3" />
            <p className="font-semibold" style={{ color: 'var(--yp-ink)' }}>
              Clean, single-column, machine-readable — the format applicant tracking systems actually parse.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--yp-yellow-700)' }}>
              <FileCheck2 size={15} /> Beat the bots
            </p>
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--yp-ink)' }}>
              An ATS-compliant résumé that gets you the interview
            </h2>
            <p className="mb-5" style={{ color: 'var(--yp-ink-soft)' }}>
              Most résumés never reach a human — an applicant tracking system screens them out
              first. Export yours from your portfolio in one click: a text-based PDF that parses
              perfectly, so your name makes the shortlist instead of the shredder.
            </p>
            <Link href={`${base}/register`} className="font-bold inline-flex items-center gap-1" style={{ color: 'var(--yp-yellow-700)' }}>
              Export my résumé <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* STORY 3 — business portfolio */}
      <section className="px-4 sm:px-6 py-16" style={{ background: 'var(--yp-ink)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--yp-yellow-400)' }}>
              <Building2 size={15} /> For businesses &amp; organizations
            </p>
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--yp-cream)' }}>
              Show the world what your business can do
            </h2>
            <p className="mb-5" style={{ color: 'rgba(250,248,244,0.72)' }}>
              Services, case-study projects, your team, a gallery, and every way to reach you — a
              polished profile customers can trust before they even pick up the phone.
            </p>
            <Link href={`${base}/register`} className="font-bold inline-flex items-center gap-1" style={{ color: 'var(--yp-yellow-400)' }}>
              List my business <ArrowRight size={15} />
            </Link>
          </div>
          <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Building2 size={40} style={{ color: 'var(--yp-yellow-400)' }} className="mx-auto mb-3" />
            <p className="font-semibold" style={{ color: 'var(--yp-cream)' }}>
              Link team members to their own portfolios. Grow together, look bigger.
            </p>
          </div>
        </div>
      </section>

      {/* STORY 4 — reviews */}
      <section className="px-4 sm:px-6 py-16" style={{ background: 'var(--yp-yellow-100)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--yp-yellow-700)' }}>
            <Star size={15} /> Reputation, visible
          </p>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--yp-ink)' }}>
            Let your reviews do the selling
          </h2>
          <p style={{ color: 'var(--yp-ink-soft)' }}>
            Every portfolio collects star ratings and written reviews. Your average shows on your
            card and at the top of your page — the social proof that turns a browser into a client.
          </p>
        </div>
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

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--yp-ink)' }}>Find your people, whatever the field</h2>
        <p className="mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
          From trades to tech, hospitality to health — a growing directory of professionals and businesses.
        </p>
        <CategoryShowcase />
      </section>

      {/* FINAL CTA */}
      <section className="text-center px-4 sm:px-6 py-16" style={{ background: 'var(--yp-yellow-100)' }}>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--yp-ink)' }}>Your next opportunity is one link away</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href={`${base}/register`} className="yp-btn-primary">
            Create your portfolio <ArrowRight size={16} />
          </Link>
          <Link href={`${base}/browse`} className="yp-btn-outline">
            Explore the Directory
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
        A ministry of Destiny Mission Global Assembly
      </footer>
    </div>
  )
}
