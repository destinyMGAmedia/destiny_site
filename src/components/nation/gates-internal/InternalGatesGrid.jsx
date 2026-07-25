'use client'
import { useState } from 'react'
import { INTERNAL_CATEGORIES, getLegacyProjectForGate } from '@/lib/nation/gates'
import GateDetail from '@/components/nation/gates-influence/GateDetail'
import Reveal from '@/components/nation/shared/Reveal'

const BG = ['#170331', '#1c0940']

export default function InternalGatesGrid() {
  const [selected, setSelected] = useState(null)

  return (
    <>
      {INTERNAL_CATEGORIES.map((category, ci) => (
        <section key={category.key} className="py-16 sm:py-20" style={{ background: BG[ci % 2] }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal className="flex items-baseline gap-3 mb-6">
              <span className="text-xs font-bold w-8 shrink-0" style={{ color: 'var(--gold-500)' }}>
                {String(ci + 1).padStart(2, '0')}
              </span>
              <h2 className="font-bold text-xl sm:text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
                {category.name}
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.gates.map((gate, gi) => {
                const project = getLegacyProjectForGate('INTERNAL', gate)
                return (
                  <Reveal key={gate} delay={Math.min(gi * 0.04, 0.3)} y={14}>
                    <button
                      type="button"
                      onClick={() => setSelected({ gate, groupName: category.name, project })}
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
          layer="INTERNAL"
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
