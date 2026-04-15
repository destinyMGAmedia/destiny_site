import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ContentDashboard from '@/components/admin/ContentDashboard'

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
      title: `Content — ${assembly?.name || slug}` 
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return { title: 'Content' }
  }
}

// Default sections created when an assembly has none
const DEFAULT_SECTIONS = [
  { type: 'HERO',         title: 'Hero Banner',       position: 10 },
  { type: 'FIND_US',      title: 'Find Us',           position: 20 },
  { type: 'FELLOWSHIPS',  title: 'Fellowships',       position: 30 },
  { type: 'ARK_CENTERS',  title: 'Ark Centers',       position: 35 },
  { type: 'DEPARTMENTS',  title: 'Departments',       position: 40 },
  { type: 'EVENTS',       title: "What's On",         position: 50 },
  { type: 'MEDIA',        title: 'Media',             position: 60 },
  { type: 'GIVING',       title: 'Giving',            position: 70 },
  { type: 'PRAYER',       title: 'Prayer Requests',   position: 80 },
  { type: 'TESTIMONIES',  title: 'Testimonies',       position: 90 },
  { type: 'CONTACT',      title: 'Contact',           position: 9999 },
]

export default async function ContentPage({ params }) {
  const { slug } = await params

  let assembly = null
  let sections = []
  let session = null   // ← Moved outside so it's available in return

  try {
    session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    // Fetch assembly with sections
    assembly = await prisma.assembly.findUnique({
      where: { slug },
      include: { 
        sections: { 
          orderBy: { position: 'asc' } 
        } 
      },
    })

    if (!assembly) notFound()

    // Permission check
    if (!canUpdateContent(session, assembly.id)) {
      redirect('/admin/dashboard?error=unauthorized')
    }

    // Auto-create default sections if none exist
    if (assembly.sections.length === 0) {
      await prisma.$transaction(
        DEFAULT_SECTIONS.map((section) =>
          prisma.assemblySection.create({
            data: {
              assemblyId: assembly.id,
              ...section,
            },
          })
        )
      )

      // Refresh sections after creation
      sections = await prisma.assemblySection.findMany({
        where: { assemblyId: assembly.id },
        orderBy: { position: 'asc' },
      })
    } else {
      sections = assembly.sections
    }

  } catch (error) {
    console.error('Error loading content page:', error)
    redirect('/admin/dashboard?error=server_error')
  }

  return (
    <ContentDashboard
      assembly={assembly}
      sections={sections}
      role={session.user.role}
    />
  )
}