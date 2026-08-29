import { LEGACY_PROJECT_TESTS, getGroupName } from '@/lib/nation/gates'

// Every named Legacy Project passes all 4 tests per the source framing
// ("The 30 Legacy Project Framework") — the badge lists all four for each card.
export default function ProjectCard({ item }) {
  const groupName = getGroupName(item.layer, item.groupKey)

  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-[rgba(255,179,0,0.3)] transition-colors p-6">
      <p className="text-xs uppercase tracking-wider text-cyan-300 mb-1">
        {item.gate} Gate · {groupName}
      </p>
      <p className="font-bold text-lg mb-1" style={{ color: 'var(--gold-500)' }}>{item.project}</p>
      <p className="text-sm text-white/70 mb-4">{item.outcome}</p>

      <div className="grid grid-cols-2 gap-1.5">
        {LEGACY_PROJECT_TESTS.map((test) => (
          <span key={test} className="text-[11px] leading-tight rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/60">
            ✓ {test}
          </span>
        ))}
      </div>
    </div>
  )
}
