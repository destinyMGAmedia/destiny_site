import { Quote } from 'lucide-react'
import Reveal from '../shared/Reveal'

const GATE_THEMES = ['Authority', 'Governance', 'Justice', 'Commerce', 'Security', 'Wisdom', 'Influence']

export default function TheologicalFoundation() {
  return (
    <section className="relative py-20 sm:py-28" style={{ background: '#150429' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-14 items-center">
        <Reveal className="text-left">
          <span
            className="text-xs font-bold uppercase tracking-[0.25em] mb-3 block"
            style={{ color: 'var(--gold-500)' }}
          >
            The Theological Foundation
          </span>
          <h2
            className="text-2xl sm:text-4xl font-bold mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Gates Were Never Merely Entrances
          </h2>
          <div className="gold-bar mb-6" />
          <p className="text-white/60 mb-8 max-w-md leading-relaxed">
            Throughout Scripture, gates were the places where a city&rsquo;s destiny was decided —
            not just passed through. Seven things happened at the gate:
          </p>

          <div className="space-y-2.5">
            {GATE_THEMES.map((theme, i) => (
              <div
                key={theme}
                className="flex items-center gap-4 py-2.5 px-4 rounded-lg border-l-2"
                style={{ borderColor: 'var(--gold-500)', background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}
              >
                <span className="text-xs font-bold w-6 shrink-0" style={{ color: 'var(--gold-500)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-semibold text-white/85">{theme}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal
          delay={0.15}
          className="relative rounded-2xl p-8 sm:p-12"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Quote size={36} style={{ color: 'var(--gold-500)' }} className="mb-6 opacity-80" />
          <p className="text-2xl sm:text-3xl italic leading-relaxed text-white/90 mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
            What are the gates God has entrusted to this house, and who will steward them into the future?
          </p>
          <div className="w-10 h-0.5" style={{ background: 'rgba(255,179,0,0.4)' }} />
        </Reveal>
      </div>
    </section>
  )
}
