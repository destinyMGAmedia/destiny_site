import Link from 'next/link'
import { ArrowRight, Search, Users, ShieldCheck } from 'lucide-react'

const YELLOWPAGES_URL = process.env.NEXT_PUBLIC_YELLOWPAGES_URL || '/yellowpages'

// The Yellow Pages palette is scoped under `.yp-theme` in globals.css and isn't in scope on
// the main site, so the brand colours are inlined here as literals (kept in sync with the
// --yp-* custom properties).
const YP = {
  ink: '#211d16',
  yellow: '#b68920',
  yellow400: '#e3bd63',
  cream: '#faf8f4',
}

const FEATURES = [
  { icon: Search, title: 'Search', body: 'Find a skill, service, or business by category and location.' },
  { icon: Users, title: 'Connect', body: 'Reach out directly — phone, WhatsApp, or email. No middleman.' },
  { icon: ShieldCheck, title: 'Trust', body: 'See ratings from others in the family before you reach out.' },
]

// Full-bleed CTA band for The Yellow Pages directory. Deliberately edge-to-edge (unlike the
// contained Destiny Nation card) so it reads as its own product within the home page.
export default function YellowPagesPreview() {
  return (
    <section className="relative overflow-hidden" style={{ background: YP.ink }}>
      {/* soft brand glow, top-right */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: YP.yellow }}
      />

      <div className="relative section-container">
        <div className="max-w-3xl">
          <span
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full w-fit"
            style={{ background: YP.yellow, color: YP.ink }}
          >
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: YP.ink }} />
            New · Community Directory
          </span>

          <h2
            className="text-3xl md:text-4xl font-bold mb-3 leading-tight"
            style={{ fontFamily: 'var(--font-serif)', color: YP.cream }}
          >
            The Yellow Pages
          </h2>
          <p className="text-lg font-semibold mb-5" style={{ color: YP.yellow400 }}>
            Skills &amp; businesses, right here in the family
          </p>

          <p className="leading-relaxed mb-10 max-w-2xl" style={{ color: 'rgba(250, 248, 244, 0.72)' }}>
            A directory of members&rsquo; skills and businesses from across Destiny Mission Global
            Assembly. Whether you need a plumber, a designer, a caterer, or a tutor — search by
            category and location, then reach out directly. Members can list their own skill or
            business for free.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <f.icon size={20} style={{ color: YP.yellow400 }} className="mb-2" />
                <h3 className="font-bold mb-1" style={{ color: YP.cream }}>{f.title}</h3>
                <p className="text-sm" style={{ color: 'rgba(250, 248, 244, 0.6)' }}>{f.body}</p>
              </div>
            ))}
          </div>

          <Link
            href={YELLOWPAGES_URL}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-transform hover:-translate-y-0.5"
            style={{ background: YP.yellow, color: YP.ink }}
          >
            Explore the Directory <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
