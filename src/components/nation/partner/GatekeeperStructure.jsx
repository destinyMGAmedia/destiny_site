import { Crown, UserCog, Sprout } from 'lucide-react'
import { GATEKEEPER_ROLES } from '@/lib/nation/gates'
import Reveal from '@/components/nation/shared/Reveal'

const ICONS = [Crown, UserCog, Sprout]

export default function GatekeeperStructure() {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--gold-300)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: 'var(--purple-800)' }}>
            The Gatekeeper Structure
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Every Gate, Three Roles
          </h2>
          <p className="mb-10 max-w-2xl" style={{ color: 'rgba(45,0,96,0.75)' }}>
            Coordinated quarterly by the Gatekeeper Council — Senior Pastor, Executive Pastor, Legacy
            Director, Internal Gate Leaders, and Influence Gate Leaders.
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-6">
          {GATEKEEPER_ROLES.map((r, i) => {
            const Icon = ICONS[i]
            return (
              <Reveal key={r.role} delay={i * 0.1} y={20}>
                <div
                  className="h-full rounded-2xl border p-6"
                  style={{ background: 'rgba(45,0,96,0.05)', borderColor: 'rgba(45,0,96,0.15)' }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(45,0,96,0.12)' }}
                  >
                    <Icon size={22} style={{ color: 'var(--purple-800)' }} />
                  </div>
                  <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>{r.role}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(45,0,96,0.7)' }}>{r.description}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
