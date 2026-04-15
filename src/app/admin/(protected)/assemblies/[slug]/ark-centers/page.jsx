import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ArkCentersEditor from '@/components/admin/ArkCentersEditor'

// Force dynamic rendering for admin ark-centers page with authentication
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const assembly = await prisma.assembly.findUnique({ where: { slug }, select: { name: true } })
  return { title: `Ark Centers — ${assembly?.name || slug}` }
}

export default async function ArkCentersPage({ params }) {
  const session = await getServerSession(authOptions)
  const { slug } = await params

  if (!session) redirect('/admin/login')

  const assembly = await prisma.assembly.findUnique({
    where: { slug },
    include: {
      arkCenters: {
        include: {
          leader: {
            select: { id: true, firstName: true, lastName: true }
          },
          _count: {
            select: { serviceData: true, members: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      members: {
        where: { status: 'ACTIVE' },
        select: { id: true, firstName: true, lastName: true },
        orderBy: { firstName: 'asc' }
      }
    },
  })

  if (!assembly) notFound()
  if (!canManageAssembly(session, assembly.id)) redirect('/admin/dashboard?error=unauthorized')

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          {assembly.name} — Ark Centers
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage house fellowships and record attendance.</p>
      </div>

      <ArkCentersEditor 
        assembly={assembly} 
        initialCenters={assembly.arkCenters} 
        members={assembly.members} 
      />
    </div>
  )
}
