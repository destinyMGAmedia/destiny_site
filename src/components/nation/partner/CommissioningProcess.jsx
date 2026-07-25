import { COMMISSIONING_PHASES } from '@/lib/nation/gates'
import Reveal from '@/components/nation/shared/Reveal'

export default function CommissioningProcess() {
  return (
    <section className="py-16 sm:py-20" style={{ background: '#170331' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: '#67e8f9' }}>
            The Commissioning Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            Five Phases, Not Self-Nomination
          </h2>
          <p className="text-white/65 mb-12 max-w-2xl">
            Gatekeepers are recognized and formed by senior leadership through five phases — leadership
            roles are assigned, not self-applied for.
          </p>
        </Reveal>

        <div className="relative">
          <div className="absolute left-[18px] top-2 bottom-2 w-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <ol className="space-y-8">
            {COMMISSIONING_PHASES.map((p, i) => (
              <Reveal key={p.phase} as="li" delay={i * 0.08} y={16} className="relative flex gap-5 pl-0">
                <span
                  className="relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-[#1a0533]"
                  style={{ background: 'var(--gold-500)' }}
                >
                  {i + 1}
                </span>
                <div className="pt-1">
                  <h3 className="font-bold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>{p.phase}</h3>
                  <p className="text-sm text-white/65 leading-relaxed">{p.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
