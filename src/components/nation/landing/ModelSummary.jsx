'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Church, Compass, Landmark, HeartHandshake, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useNationBase } from '../shared/NationChrome'
import Reveal from '../shared/Reveal'
import { LEGACY_PROJECT_TESTS } from '@/lib/nation/gates'
import { imgUrl, NATION_IMAGES } from '@/lib/nation/images'

const FEATURES = [
  {
    n: '02',
    icon: Church,
    imageKey: 'internalGates',
    eyebrow: 'Layer 2 · Internal Gates',
    title: 'The Ministries That Already Carry Us',
    body: "Every ministry and operational system already active within Destiny Mission Global Assembly — from Pastoral Leadership to Worship, Family Life to Strategic Development — is recognized and elevated into a gate. We aren't creating new structures; we're stewarding the ones God has already given us with greater intentionality.",
    fact: '30 Gates · 5 Categories',
    cta: 'Explore Internal Gates',
    path: '/gates/internal',
  },
  {
    n: '03',
    icon: Compass,
    imageKey: 'influenceGates',
    eyebrow: 'Layer 3 · Influence Gates',
    title: '30 Societal Territories Where We Partner',
    body: 'These are not departments — they are the sectors that shape a nation: Governance & Public Leadership, Economy & Enterprise, Science/Innovation & Infrastructure, Human Development, Culture & Media, and Global Development. Six sectors, five gates each, forming a parallel structure where government, enterprise, education, and culture partner with the church to raise ethical leaders.',
    fact: '30 Gates · 6 Sectors',
    cta: 'Explore the 30 Gates of Influence',
    path: '/gates/influence',
  },
]

const PARTNER_FEATURE = {
  n: '05',
  icon: HeartHandshake,
  imageKey: 'partner',
  eyebrow: 'Become a Gatekeeper',
  title: 'Join the First 100 Founding Gatekeepers',
  body: "Every gate is stewarded by a Gate Patron, Chief Gatekeeper, and Emerging Gatekeeper, formed through a five-phase Commissioning Process. Whether you're a government official, business leader, educator, or individual believer, there's a seat at the gate for you — through project-tied giving on the Gatekeeper Giving Ladder, or an endowment-level gift through the Founders' Circle.",
  fact: 'First 100 Partners',
  cta: 'Get Involved',
  path: '/partner',
}

function SectionBackdrop({ imageKey }) {
  const image = NATION_IMAGES[imageKey]
  return (
    <div className="absolute inset-0">
      <Image src={imgUrl(imageKey, { w: 1800 })} alt={image.alt} fill sizes="100vw" className="object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(100deg, rgba(18,3,36,0.72) 0%, rgba(18,3,36,0.5) 45%, rgba(18,3,36,0.35) 100%)' }}
      />
    </div>
  )
}

function VisualPanel({ Icon, n }) {
  return (
    <div className="relative flex items-center justify-center py-10 lg:py-0">
      <span
        className="absolute text-[10rem] sm:text-[13rem] font-black leading-none select-none"
        style={{ fontFamily: 'var(--font-serif)', color: 'rgba(255,255,255,0.06)' }}
      >
        {n}
      </span>
      <div
        className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
        style={{ background: 'rgba(255,179,0,0.14)', border: '1px solid rgba(255,179,0,0.25)', backdropFilter: 'blur(4px)' }}
      >
        <Icon size={40} style={{ color: 'var(--gold-500)' }} />
      </div>
    </div>
  )
}

function FeatureRow({ f, reverse, base }) {
  const Icon = f.icon
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <SectionBackdrop imageKey={f.imageKey} />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal delay={reverse ? 0.1 : 0} y={32} className={reverse ? 'lg:order-2' : ''}>
          <VisualPanel Icon={Icon} n={f.n} />
        </Reveal>

        <Reveal delay={reverse ? 0 : 0.1} className={reverse ? 'lg:order-1 text-left' : 'text-left'}>
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#67e8f9', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            {f.eyebrow}
          </span>
          <h3
            className="text-2xl sm:text-3xl font-bold mt-3 mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-serif)', textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
          >
            {f.title}
          </h3>
          <p className="text-white/85 leading-relaxed mb-8 text-base sm:text-lg max-w-xl" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.45)' }}>
            {f.body}
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <span
              className="px-4 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,179,0,0.12)', color: 'var(--gold-300)' }}
            >
              {f.fact}
            </span>
            <Link href={`${base}${f.path}`} className="btn-primary">
              {f.cta} <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function ModelSummary() {
  const base = useNationBase()

  return (
    <>
      {/* Layer 1 intro band */}
      <section className="py-16 sm:py-20 text-center px-4 sm:px-6" style={{ background: '#120224' }}>
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-[0.25em] mb-3 block" style={{ color: 'var(--gold-500)' }}>
            The Gatekeepers Commission Model
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold mb-5" style={{ fontFamily: 'var(--font-serif)' }}>
            Four Layers, One Legacy
          </h2>
          <div className="gold-bar mx-auto mb-6" />
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            <span className="font-semibold text-white/80">Layer 1 — The House.</span> The church itself:
            the source, the altar, the training ground. Everything below flows from here.
          </p>
        </Reveal>
      </section>

      <FeatureRow f={FEATURES[0]} reverse={false} base={base} />
      <FeatureRow f={FEATURES[1]} reverse={true} base={base} />

      {/* Layer 4 — Legacy Projects, technological backdrop + PDF-style 4-test grid, not centered prose */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <SectionBackdrop imageKey="legacyProjects" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal className="text-left">
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#67e8f9', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
              Layer 4 · Legacy Projects
            </span>
            <h3
              className="text-2xl sm:text-3xl font-bold mt-3 mb-5 leading-tight"
              style={{ fontFamily: 'var(--font-serif)', textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
            >
              Every Gate Owns a Legacy Project
            </h3>
            <p className="text-white/85 leading-relaxed mb-8 text-base sm:text-lg max-w-xl" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.45)' }}>
              A gate without a project is just a title. From the Destiny Leadership Institute to the
              Technology &amp; AI Innovation Lab, these are the tangible works our gatekeepers are
              raised to build — and every one of them must pass four tests.
            </p>
            <Link href={`${base}/projects`} className="btn-primary">
              See the Legacy Projects <ArrowRight size={16} />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-4">
            {LEGACY_PROJECT_TESTS.map((test, i) => (
              <Reveal
                key={test}
                delay={0.1 + i * 0.08}
                y={16}
                className="rounded-2xl p-5 sm:p-6 flex flex-col gap-3"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)' }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} style={{ color: 'var(--gold-500)' }} />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50">Test {i + 1}</span>
                </div>
                <p className="text-sm font-semibold text-white/90 leading-snug">{test}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FeatureRow f={PARTNER_FEATURE} reverse={false} base={base} />
    </>
  )
}
