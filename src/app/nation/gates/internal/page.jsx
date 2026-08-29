import InternalGatesGrid from '@/components/nation/gates-internal/InternalGatesGrid'
import PageHero from '@/components/nation/shared/PageHero'

export const metadata = { title: 'Internal Gates — Destiny Nation' }

export default function InternalGatesPage() {
  return (
    <>
      <PageHero
        imageKey="internalGates"
        eyebrow="Layer 2 · Internal Gates"
        title="The Ministries That Already Carry Us"
        subtitle="30 gates across 5 categories — the church's own ministries and operations, recognized and elevated with greater intentionality. Informational only; these aren't gates an external partner acts on directly."
      />
      <InternalGatesGrid />
    </>
  )
}
