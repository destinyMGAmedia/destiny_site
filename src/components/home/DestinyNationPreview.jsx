import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'
import { imgUrl } from '@/lib/nation/images'

const NATION_URL = process.env.NEXT_PUBLIC_NATION_URL || '/nation'

export default function DestinyNationPreview() {
  return (
    <section className="section-lavender">
      <div className="section-container">
        <div
          className="relative rounded-3xl overflow-hidden grid lg:grid-cols-2 items-stretch"
          style={{ background: 'var(--purple-900)' }}
        >
          <div className="relative z-10 p-8 md:p-12 lg:p-14 flex flex-col justify-center">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full w-fit"
              style={{ background: 'var(--gold-500)', color: 'var(--purple-900)' }}
            >
              <Sparkles size={13} /> New · 30th Anniversary Initiative
            </span>

            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Introducing Destiny Nation
            </h2>
            <p className="text-lg font-semibold mb-5" style={{ color: 'var(--gold-500)' }}>
              The Gatekeepers Commission &mdash; 30 Gates &middot; 30 Years &middot; One Legacy
            </p>

            <p className="text-white/70 leading-relaxed mb-8 max-w-md">
              To mark 30 years of Destiny Mission Global Assembly, we&rsquo;re raising ethical,
              kingdom-minded leaders to steward influence across government, enterprise, education,
              and culture. Explore the 30 Gates, the Legacy Projects they carry, and how you can
              become one of the first 100 Founding Gatekeepers.
            </p>

            <a href={NATION_URL} className="btn-primary w-fit">
              Explore Destiny Nation <ArrowRight size={16} />
            </a>
          </div>

          <div className="relative min-h-[260px] lg:min-h-0">
            <Image
              src={imgUrl('hero', { w: 1200 })}
              alt="City skyline at dusk"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, var(--purple-900) 0%, rgba(45,0,96,0.2) 35%, transparent 60%)' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
