'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Compass } from 'lucide-react'
import { useNationBase } from '../shared/NationChrome'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

const CITY_IMAGE_URL =
  'https://images.unsplash.com/photo-1755148500050-2f789060fa8c?auto=format&fit=crop&w=2400&h=1400&crop=focalpoint&fp-y=0.55&fp-x=0.5&q=80'

export default function Hero() {
  const base = useNationBase()

  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-end sm:items-center">
      {/* Real photographic backdrop — a city skyline, standing in for the nations these gatekeepers are raised to influence */}
      <div className="absolute inset-0">
        <Image
          src={CITY_IMAGE_URL}
          alt="City skyline at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(100deg, rgba(20,4,40,0.75) 0%, rgba(26,5,51,0.55) 40%, rgba(26,5,51,0.25) 70%, rgba(26,5,51,0.1) 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, rgba(18,2,36,0.65) 0%, rgba(18,2,36,0) 40%)' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-32 sm:py-32 w-full">
        <div className="max-w-xl text-left">
          <motion.span
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-8 px-4 py-2 rounded-full border"
            style={{ borderColor: 'rgba(0,229,255,0.35)', color: '#67e8f9', background: 'rgba(0,229,255,0.06)' }}
          >
            <Compass size={13} /> The Gatekeepers Commission
          </motion.span>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-[1.05]"
            style={{ fontFamily: 'var(--font-serif)', textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}
          >
            This is <span style={{ color: 'var(--gold-500)' }}>Destiny Nation</span>
          </motion.h1>

          <motion.div {...fadeUp(0.2)} className="gold-bar mb-8" />

          <motion.p
            {...fadeUp(0.25)}
            className="text-base sm:text-lg font-semibold tracking-wide mb-6 text-white/90"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}
          >
            30 Gates &middot; 30 Years &middot; One Legacy
          </motion.p>

          <motion.p
            {...fadeUp(0.3)}
            className="text-lg sm:text-xl text-white/85 mb-12 leading-relaxed"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}
          >
            We don&rsquo;t just build churches. We build the leaders who build nations — raising
            ethical, kingdom-minded gatekeepers to steward influence in every sphere of society for
            the next generation.
          </motion.p>

          <motion.div {...fadeUp(0.4)} className="flex flex-col sm:flex-row items-start gap-4">
            <Link href={`${base}/partner`} className="btn-primary">
              Become a Founding Gatekeeper <ArrowRight size={16} />
            </Link>
            <Link href={`${base}/gates/influence`} className="btn-outline-white">
              Explore the 30 Gates
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
