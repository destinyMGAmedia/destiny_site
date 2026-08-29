import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly, isGlobalAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import FirstTimerManager from '@/components/admin/FirstTimerManager'
import prisma from '@/lib/prisma'

export const metadata = { title: 'First Timers Management' }
export const dynamic = 'force-dynamic'

export default async function FirstTimersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  let assemblyId = session.user.assemblyId
  let assemblyName = 'All Assemblies'
  let firstTimers = []
  let error = null

  try {
    if (assemblyId) {
      const assembly = await prisma.assembly.findUnique({
        where: { id: assemblyId },
        select: { name: true }
      })
      assemblyName = assembly?.name || 'Unknown Assembly'
    }

    firstTimers = await prisma.firstTimer.findMany({
      where: assemblyId ? { assemblyId } : {},
      include: {
        assembly: true,
        member: true
      },
      orderBy: { registeredAt: 'desc' }
    })
  } catch (err) {
    console.error('[FirstTimersPage] DB error:', err)
    error = 'Failed to load first timers. The database may need a schema update — run npm run db:push.'
  }

  return (
    <div className="space-y-8 fade-in p-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          First Timers Management
        </h1>
        <p className="text-gray-500 mt-1">Manage and follow up with first-time visitors - {assemblyName}</p>
      </div>

      {error ? (
        <div className="card p-6 border border-red-200 bg-red-50">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      ) : (
        <FirstTimerManager
          firstTimers={firstTimers}
          assemblyId={assemblyId}
          canEdit={canManageAssembly(session, assemblyId)}
          canDelete={isGlobalAdmin(session)}
        />
      )}
    </div>
  )
}