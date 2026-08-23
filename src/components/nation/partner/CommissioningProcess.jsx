import { COMMISSIONING_PHASES } from '@/lib/nation/gates'
import Reveal from '@/components/nation/shared/Reveal'

export default function CommissioningProcess() {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--gold-500)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: 'var(--purple-800)' }}>
            The Commissioning Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Five Phases, Not Self-Nomination
          </h2>
          <p className="mb-12 max-w-2xl" style={{ color: 'rgba(45,0,96,0.75)' }}>
            Gatekeepers are recognized and formed by senior leadership through five phases — leadership
            roles are assigned, not self-applied for.
          </p>
        </Reveal>

        <div className="relative">
          <div className="absolute left-[18px] top-2 bottom-2 w-px" style={{ background: 'rgba(45,0,96,0.18)' }} />
          <ol className="space-y-8">
            {COMMISSIONING_PHASES.map((p, i) => (
              <Reveal key={p.phase} as="li" delay={i * 0.08} y={16} className="relative flex gap-5 pl-0">
                <span
                  className="relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ background: 'var(--purple-800)' }}
                >
                  {i + 1}
                </span>
                <div className="pt-1">
                  <h3 className="font-bold mb-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>{p.phase}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(45,0,96,0.7)' }}>{p.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
