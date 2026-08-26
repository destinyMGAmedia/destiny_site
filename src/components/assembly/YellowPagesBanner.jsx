import { ArrowRight } from 'lucide-react'

const YELLOWPAGES_URL = process.env.NEXT_PUBLIC_YELLOWPAGES_URL || '/yellowpages'

// The Yellow Pages palette is scoped under `.yp-theme` in globals.css and isn't in scope on
// the main site, so the brand colours are inlined here as literals (kept in sync with the
// --yp-* custom properties).
const YP = {
  ink: '#211d16',
  yellow: '#b68920',
  cream: '#faf8f4',
}

// Per-assembly CTA into The Yellow Pages directory. Speaks to existing members first — their
// listing auto-links to their member profile when they register with the phone/email already
// on their member record (see /api/yellowpages/member-lookup) — but non-members can list too.
export default function YellowPagesBanner({ assemblySlug, assemblyName }) {
  const href = `${YELLOWPAGES_URL}/register?assemblySlug=${encodeURIComponent(assemblySlug)}`

  return (
    <section className="relative overflow-hidden" style={{ background: YP.ink }}>
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{ background: YP.yellow }}
      />

      <div className="relative max-w-5xl mx-auto px-6 py-14 sm:py-16">
        <span
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full w-fit"
          style={{ background: YP.yellow, color: YP.ink }}
        >
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: YP.ink }} />
          The Yellow Pages
        </span>

        <h2
          className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
          style={{ fontFamily: 'var(--font-serif)', color: YP.cream }}
        >
          Offer a skill or run a business? List it in the directory.
        </h2>

        <p className="leading-relaxed mb-8 max-w-2xl" style={{ color: 'rgba(250, 248, 244, 0.72)' }}>
          {assemblyName ? `As part of ${assemblyName}, you` : 'You'} can add your skill or business
          to The Yellow Pages — the church-wide directory people search to find trusted help.
          Already registered as a member? You won&rsquo;t sign up again: list with the phone or
          email on your member record and your listing links to your profile automatically.
        </p>

        <a
          href={href}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-transform hover:-translate-y-0.5"
          style={{ background: YP.yellow, color: YP.ink }}
        >
          List your skill or business <ArrowRight size={16} />
        </a>
      </div>
    </section>
  )
}
