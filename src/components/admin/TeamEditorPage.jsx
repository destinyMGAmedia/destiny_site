'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import TeamEditor from './TeamEditor'

export default function TeamEditorPage({ assembly, initialMembers }) {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/admin/assemblies/${assembly.slug}/content`)}
          className="text-gray-400 hover:text-gray-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Pastors & Leadership
          </h1>
          <p className="text-xs text-gray-400">{assembly.name}</p>
        </div>
      </div>

      <div className="card p-6">
        <TeamEditor assembly={assembly} initialMembers={initialMembers} />
      </div>
    </div>
  )
}
