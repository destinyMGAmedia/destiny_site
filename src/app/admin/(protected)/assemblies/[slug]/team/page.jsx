import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import TeamEditorPage from '@/components/admin/TeamEditorPage'

<<<<<<< HEAD
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
      title: `Leadership — ${assembly?.name || slug}` 
    }
  } catch (error) {
    console.error('Error generating metadata for team page:', error)
    return { title: 'Leadership' }
  }
}

export default async function TeamPage({ params }) {
  const { slug } = await params

  let assembly = null

  try {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    // Fetch assembly with team members
    assembly = await prisma.assembly.findUnique({
      where: { slug },
      include: {
        teamMembers: { 
          orderBy: [{ department: 'asc' }, { displayOrder: 'asc' }] 
        },
      },
    })

    if (!assembly) notFound()

    // Permission check
    if (!canUpdateContent(session, assembly.id)) {
      redirect('/admin/dashboard?error=unauthorized')
    }

  } catch (error) {
    console.error('Error loading team page:', error)
    redirect('/admin/dashboard?error=server_error')
  }

  return (
    <TeamEditorPage 
      assembly={assembly} 
      initialMembers={assembly.teamMembers} 
    />
  )
}
=======
export async function generateMetadata({ params }) {
  const { slug } = await params
  const assembly = await prisma.assembly.findUnique({ where: { slug }, select: { name: true } })
  return { title: `Leadership — ${assembly?.name || slug}` }
}

export default async function TeamPage({ params }) {
  const session = await getServerSession(authOptions)
  const { slug } = await params

  if (!session) redirect('/admin/login')

  const assembly = await prisma.assembly.findUnique({
    where: { slug },
    include: {
      teamMembers: { orderBy: [{ department: 'asc' }, { displayOrder: 'asc' }] },
    },
  })

  if (!assembly) notFound()
  if (!canUpdateContent(session, assembly.id)) redirect('/admin/dashboard?error=unauthorized')

  return <TeamEditorPage assembly={assembly} initialMembers={assembly.teamMembers} />
}
>>>>>>> origin/main
