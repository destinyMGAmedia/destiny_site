'use client'
import Link from 'next/link'
import { X } from 'lucide-react'
import { GATEKEEPER_ROLES } from '@/lib/nation/gates'
import { useNationBase } from '@/components/nation/shared/NationChrome'

// Shared by InfluenceGatesGrid and InternalGatesGrid — role structure is generic per gate (§ Gatekeeper
// Structure), so this renders the same three roles plus the gate's Legacy Project, if the source names one.
export default function GateDetail({ gate, groupName, project, layer, onClose }) {
  const base = useNationBase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a0533] p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-1">
          <p className="text-xs uppercase tracking-wider text-cyan-300">{groupName}</p>
          <button onClick={onClose} aria-label="Close" className="text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: 'var(--gold-500)' }}>{gate}</h2>

        <div className="space-y-4 mb-6">
          {GATEKEEPER_ROLES.map((r) => (
            <div key={r.role} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-sm mb-1">{r.role}</p>
              <p className="text-sm text-white/60">{r.description}</p>
            </div>
          ))}
        </div>

        {project && (
          <div className="rounded-xl border border-white/10 bg-white/10 p-4 mb-6">
            <p className="text-xs uppercase tracking-wider text-cyan-300 mb-1">Legacy Project</p>
            <p className="font-bold mb-1">{project.project}</p>
            <p className="text-sm text-white/70">{project.outcome}</p>
          </div>
        )}

        {layer === 'INFLUENCE' && (
          <Link
            href={`${base}/partner`}
            className="block text-center py-3 rounded-lg font-bold text-[#1a0533]"
            style={{ background: 'var(--gold-500)' }}
          >
            Get Involved with this Gate
          </Link>
        )}
      </div>
    </div>
  )
}
