import InfluenceGatesGrid from '@/components/nation/gates-influence/InfluenceGatesGrid'
import PageHero from '@/components/nation/shared/PageHero'

export const metadata = { title: 'The 30 Gates of Influence — Destiny Nation' }

export default function InfluenceGatesPage() {
  return (
    <>
      <PageHero
        imageKey="influenceGates"
        eyebrow="Layer 3 · Influence Gates"
        title="30 Societal Territories Where We Partner"
        subtitle="Six sectors, five gates each — the public-facing centerpiece of Destiny Nation, where government, enterprise, education, and culture partner with the church to raise ethical leaders."
      />
      <InfluenceGatesGrid />
    </>
  )
}
