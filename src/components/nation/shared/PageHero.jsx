import Image from 'next/image'
import { imgUrl, NATION_IMAGES } from '@/lib/nation/images'
import Reveal from './Reveal'

// Shared banner for the four sub-pages (Internal Gates, Influence Gates, Legacy Projects, Partner) —
// each uses its own theme photo (not the hero's city skyline) per its subject matter.
export default function PageHero({ imageKey, eyebrow, title, subtitle }) {
  const image = NATION_IMAGES[imageKey]

  return (
    <section className="relative overflow-hidden min-h-[52vh] sm:min-h-[58vh] flex items-center">
      <div className="absolute inset-0">
        <Image src={imgUrl(imageKey, { w: 2000 })} alt={image.alt} fill priority sizes="100vw" className="object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(100deg, rgba(20,4,40,0.8) 0%, rgba(26,5,51,0.6) 45%, rgba(26,5,51,0.3) 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, rgba(18,2,36,0.55) 0%, rgba(18,2,36,0) 40%)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-24 w-full text-left">
        <Reveal>
          <span
            className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-5 px-4 py-2 rounded-full border"
            style={{ borderColor: 'rgba(255,179,0,0.35)', color: 'var(--gold-300)', background: 'rgba(255,179,0,0.06)' }}
          >
            {eyebrow}
          </span>
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-5 leading-[1.08]"
            style={{ fontFamily: 'var(--font-serif)', textShadow: '0 2px 24px rgba(0,0,0,0.55)' }}
          >
            {title}
          </h1>
          <div className="gold-bar mb-6" />
          <p className="text-lg sm:text-xl text-white/85 max-w-2xl leading-relaxed" style={{ textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}>
            {subtitle}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
