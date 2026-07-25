import { CheckCircle2 } from 'lucide-react'
import { LEGACY_PROJECT_TESTS, LEGACY_PROJECTS } from '@/lib/nation/gates'
import ProjectCard from './ProjectCard'
import Reveal from '@/components/nation/shared/Reveal'

export default function LegacyProjectsCatalogue() {
  return (
    <>
      <section className="py-16 sm:py-20" style={{ background: '#170331' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-xs font-bold uppercase tracking-[0.2em] mb-6 block" style={{ color: '#67e8f9' }}>
            The 4-Test Framework
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LEGACY_PROJECT_TESTS.map((test, i) => (
              <Reveal
                key={test}
                delay={i * 0.08}
                className="rounded-xl border p-5 flex items-start gap-3"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <CheckCircle2 size={20} style={{ color: 'var(--gold-500)' }} className="shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-white/85 leading-snug">{test}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" style={{ background: '#1c0940' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
              Named Examples
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEGACY_PROJECTS.map((item, i) => (
              <Reveal key={item.gate} delay={Math.min(i * 0.08, 0.32)} y={20}>
                <ProjectCard item={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
