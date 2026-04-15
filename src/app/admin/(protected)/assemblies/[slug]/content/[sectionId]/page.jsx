import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import SectionEditor from '@/components/admin/SectionEditor'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  try {
    const { sectionId } = await params
    const section = await prisma.assemblySection.findUnique({
      where: { id: sectionId },
      select: { title: true }
    })
    return { 
      title: `Edit ${section?.title || 'Section'}` 
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return { title: 'Edit Section' }
  }
}

export default async function SectionEditPage({ params }) {
  const { slug, sectionId } = await params

  let assembly = null
  let section = null
  let session = null   // ← Moved outside so it's available in return

  try {
    session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    // Fetch assembly and section in parallel
    const [assemblyData, sectionData] = await Promise.all([
      prisma.assembly.findUnique({
        where: { slug },
        include: {
          givingDetails: true,
          teamMembers: { 
            orderBy: [{ department: 'asc' }, { displayOrder: 'asc' }] 
          },
          events: { 
            orderBy: { startDate: 'desc' } 
          },
        },
      }),
      prisma.assemblySection.findUnique({ 
        where: { id: sectionId } 
      }),
    ])

    assembly = assemblyData
    section = sectionData

    if (!assembly || !section) notFound()

    // Permission check
    if (!canUpdateContent(session, assembly.id)) {
      redirect('/admin/dashboard?error=unauthorized')
    }

  } catch (error) {
    console.error('Error loading section editor page:', error)
    // Graceful fallback instead of hard notFound()
    redirect('/admin/dashboard?error=server_error')
  }

  return (
    <SectionEditor
      assembly={assembly}
      section={section}
      role={session.user.role}
    />
  )
}