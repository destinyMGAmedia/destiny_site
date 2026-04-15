import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ArkCentersEditor from '@/components/admin/ArkCentersEditor'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params
    const assembly = await prisma.assembly.findUnique({
      where: { slug },
      select: { name: true }
    })
    return { 
      title: `Ark Centers — ${assembly?.name || slug}` 
    }
  } catch (error) {
    console.error('Error generating metadata for ark centers page:', error)
    return { title: 'Ark Centers' }
  }
}

export default async function ArkCentersPage({ params }) {
  const { slug } = await params

  let assembly = null

  try {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    // Fetch assembly with related data
    assembly = await prisma.assembly.findUnique({
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

    // Permission check
    if (!canManageAssembly(session, assembly.id)) {
      redirect('/admin/dashboard?error=unauthorized')
    }

  } catch (error) {
    console.error('Error loading ark centers page:', error)
    redirect('/admin/dashboard?error=server_error')
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 
          className="text-2xl font-bold" 
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
        >
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