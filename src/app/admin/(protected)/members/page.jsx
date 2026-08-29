import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly, isGlobalAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MemberManager from '@/components/admin/MemberManager'
import prisma from '@/lib/prisma'

export const metadata = { title: 'Members Management' }
export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  let assemblyId = session.user.assemblyId
  let assemblyName = 'All Assemblies'
  let members = []
  let growthStages = []
  let error = null

  try {
    if (assemblyId) {
      const assembly = await prisma.assembly.findUnique({
        where: { id: assemblyId },
        select: { name: true }
      })
      assemblyName = assembly?.name || 'Unknown Assembly'
    }

    members = await prisma.member.findMany({
      where: assemblyId ? { assemblyId } : {},
      include: {
        assembly: true,
        arkCenter: true,
        progress: {
          include: {
            stage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    growthStages = await prisma.growthStage.findMany({
      orderBy: { level: 'asc' }
    })
  } catch (err) {
    console.error('[MembersPage] DB error:', err)
    error = 'Failed to load members. The database may need a schema update — run npm run db:push.'
  }

  return (
    <div className="space-y-8 fade-in p-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Members Management
        </h1>
        <p className="text-gray-500 mt-1">Manage church members and track their growth progress - {assemblyName}</p>
      </div>

      {error ? (
        <div className="card p-6 border border-red-200 bg-red-50">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      ) : (
        <MemberManager
          members={members}
          growthStages={growthStages}
          assemblyId={assemblyId}
          canEdit={canManageAssembly(session, assemblyId)}
          canDelete={isGlobalAdmin(session)}
        />
      )}
    </div>
  )
}