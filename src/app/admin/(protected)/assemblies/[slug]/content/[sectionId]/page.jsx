import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import SectionEditor from '@/components/admin/SectionEditor'

// Force dynamic rendering for admin content
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  try {
    const { sectionId } = await params
    const section = await prisma.assemblySection.findUnique({ where: { id: sectionId } })
    return { title: `Edit ${section?.title || 'Section'}` }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return { title: 'Edit Section' }
  }
}

export default async function SectionEditPage({ params }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  let assembly, section

  try {
    const { slug, sectionId } = await params

    const [assemblyData, sectionData] = await Promise.all([
      prisma.assembly.findUnique({
        where: { slug },
        include: {
          givingDetails: true,
          teamMembers: { orderBy: [{ department: 'asc' }, { displayOrder: 'asc' }] },
          events: { orderBy: { startDate: 'desc' } },
        },
      }),
      prisma.assemblySection.findUnique({ where: { id: sectionId } }),
    ])

    assembly = assemblyData
    section = sectionData
  } catch (error) {
    console.error('Error loading section editor:', error)
    notFound()
  }

  if (!assembly || !section) notFound()
  if (!canUpdateContent(session, assembly.id)) redirect('/admin/dashboard?error=unauthorized')

  return (
    <SectionEditor
      assembly={assembly}
      section={section}
      role={session.user.role}
    />
  )
}
