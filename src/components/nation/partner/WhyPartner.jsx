import { Landmark, Briefcase, Globe2, GraduationCap, Church, Users } from 'lucide-react'
import { PARTNER_TYPES } from '@/lib/nation/gates'
import Reveal from '@/components/nation/shared/Reveal'

const ICONS = {
  Government: Landmark,
  Corporate: Briefcase,
  'Development Partners': Globe2,
  'Educational Institutions': GraduationCap,
  Churches: Church,
  Individuals: Users,
}

export default function WhyPartner() {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--gold-500)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: 'var(--purple-800)' }}>
            Who Can Partner
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Cross-Sector Partnership
          </h2>
          <p className="mb-10 max-w-2xl" style={{ color: 'rgba(45,0,96,0.75)' }}>
            Destiny Nation is built for cross-sector partnership — whoever you represent, there is a gate for you.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PARTNER_TYPES.map((type, i) => {
            const Icon = ICONS[type] || Users
            return (
              <Reveal key={type} delay={i * 0.07} y={16}>
                <div
                  className="flex items-center gap-4 rounded-xl border p-5"
                  style={{ background: 'rgba(45,0,96,0.06)', borderColor: 'rgba(45,0,96,0.15)' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(45,0,96,0.12)' }}
                  >
                    <Icon size={20} style={{ color: 'var(--purple-800)' }} />
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--purple-900)' }}>{type}</span>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
