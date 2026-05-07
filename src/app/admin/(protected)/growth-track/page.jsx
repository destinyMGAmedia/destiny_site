import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import GrowthTrackManager from '@/components/admin/GrowthTrackManager'
import PromotionRecommendations from '@/components/admin/PromotionRecommendations'

export const metadata = { title: 'Growth Track Management' }

export const dynamic = 'force-dynamic'

export default async function GrowthTrackPage() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    redirect('/admin/dashboard')
  }

  return (
    <div className="space-y-8 fade-in p-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Growth Track Management
        </h1>
        <p className="text-gray-500 mt-1">Manage curriculum content and review promotion recommendations from assembly admins.</p>
      </div>

      <PromotionRecommendations />

      <GrowthTrackManager />
    </div>
  )
}
