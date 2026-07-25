'use client'
import { useState } from 'react'
import { INFLUENCE_SECTORS, getLegacyProjectForGate } from '@/lib/nation/gates'
import GateDetail from './GateDetail'
import Reveal from '@/components/nation/shared/Reveal'

const BG = ['#170331', '#1c0940']

export default function InfluenceGatesGrid() {
  const [selected, setSelected] = useState(null)

  return (
    <>
      {INFLUENCE_SECTORS.map((sector, si) => (
        <section key={sector.key} className="py-16 sm:py-20" style={{ background: BG[si % 2] }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal className="flex items-baseline gap-3 mb-6">
              <span className="text-xs font-bold w-8 shrink-0" style={{ color: 'var(--gold-500)' }}>
                {String(si + 1).padStart(2, '0')}
              </span>
              <h2 className="font-bold text-xl sm:text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
                {sector.name}
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sector.gates.map((gate, gi) => {
                const project = getLegacyProjectForGate('INFLUENCE', gate)
                return (
                  <Reveal key={gate} delay={Math.min(gi * 0.04, 0.3)} y={14}>
                    <button
                      type="button"
                      onClick={() => setSelected({ gate, groupName: sector.name, project })}
                      className="w-full text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[rgba(255,179,0,0.3)] transition-colors p-4"
                    >
                      <p className="font-semibold text-sm">{gate}</p>
                      {project && (
                        <p className="text-xs text-cyan-300 mt-1">Legacy Project: {project.project}</p>
                      )}
                    </button>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
      ))}

      {selected && (
        <GateDetail
          gate={selected.gate}
          groupName={selected.groupName}
          project={selected.project}
          layer="INFLUENCE"
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
