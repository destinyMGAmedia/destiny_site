import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import SectionEditor from '@/components/admin/SectionEditor'

export async function generateMetadata({ params }) {
  const { sectionId } = await params
  const section = await prisma.assemblySection.findUnique({ where: { id: sectionId } })
  return { title: `Edit ${section?.title || 'Section'}` }
}

export default async function SectionEditPage({ params }) {
  const session = await getServerSession(authOptions)
  const { slug, sectionId } = await params

  if (!session) redirect('/admin/login')

  const [assembly, section] = await Promise.all([
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
