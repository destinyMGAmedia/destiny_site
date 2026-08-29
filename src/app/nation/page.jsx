import Hero from '@/components/nation/landing/Hero'
import TheologicalFoundation from '@/components/nation/landing/TheologicalFoundation'
import ModelSummary from '@/components/nation/landing/ModelSummary'
import Reveal from '@/components/nation/shared/Reveal'

export default function NationLandingPage() {
  return (
    <>
      <Hero />
      <TheologicalFoundation />
      <ModelSummary />
      <section className="relative text-center py-20 sm:py-28 px-4 overflow-hidden" style={{ background: '#150429' }}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(60% 100% at 50% 100%, rgba(255,179,0,0.08) 0%, transparent 70%)' }}
        />
        <Reveal
          className="relative text-2xl sm:text-4xl font-bold max-w-3xl mx-auto leading-snug"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-500)' }}
          as="p"
        >
          One Church. One Mission. Thirty Gates. Infinite Impact.
        </Reveal>
      </section>
    </>
  )
}
