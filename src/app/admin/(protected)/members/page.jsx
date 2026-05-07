import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MemberManager from '@/components/admin/MemberManager'
import prisma from '@/lib/prisma'

export const metadata = { title: 'Members Management' }
export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  // Get assembly based on user's role
  let assemblyId = session.user.assemblyId
  let assemblyName = 'All Assemblies'

  if (assemblyId) {
    const assembly = await prisma.assembly.findUnique({
      where: { id: assemblyId },
      select: { name: true }
    })
    assemblyName = assembly?.name || 'Unknown Assembly'
  }

  // Fetch members with their progress
  const members = await prisma.member.findMany({
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

  // Get growth stages for reference
  const growthStages = await prisma.growthStage.findMany({
    orderBy: { level: 'asc' }
  })

  return (
    <div className="space-y-8 fade-in p-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Members Management
        </h1>
        <p className="text-gray-500 mt-1">Manage church members and track their growth progress - {assemblyName}</p>
      </div>

      <MemberManager 
        members={members} 
        growthStages={growthStages}
        assemblyId={assemblyId}
        canEdit={canManageAssembly(session, assemblyId)}
      />
    </div>
  )
}