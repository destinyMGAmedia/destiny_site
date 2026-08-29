import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import NationContributionsTable from '@/components/admin/NationContributionsTable'

export const metadata = { title: 'Destiny Nation — Contributions' }
export const dynamic = 'force-dynamic'

export default async function NationAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')
  if (!isGlobalAdmin(session)) redirect('/admin/dashboard')

  let contributions = []
  let error = null
  try {
    contributions = await prisma.destinyNationContribution.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (err) {
    console.error('[NationAdminPage] DB error:', err)
    error = 'Failed to load contributions. The database may need a schema update — run npm run db:push.'
  }

  return (
    <div className="space-y-8 fade-in p-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Destiny Nation — Contributions
        </h1>
        <p className="text-gray-500 mt-1">Giving Ladder and Founders&rsquo; Circle contributions, pledges, and manual gifts.</p>
      </div>

      {error ? (
        <div className="card p-6 border border-red-200 bg-red-50">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      ) : (
        <NationContributionsTable contributions={contributions} />
      )}
    </div>
  )
}
