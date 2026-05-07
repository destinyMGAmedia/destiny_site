import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin, canManageAssembly } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import AssemblyGrowthManager from '@/components/admin/AssemblyGrowthManager'

export default async function AssemblyGrowthPage({ params }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const { slug } = await params
  const assembly = await prisma.assembly.findUnique({ where: { slug } })
  if (!assembly) redirect('/admin')

  if (!isGlobalAdmin(session) && !canManageAssembly(session, assembly.id)) {
    redirect('/admin')
  }

  return <AssemblyGrowthManager assemblySlug={slug} assemblyName={assembly.name} isGlobal={isGlobalAdmin(session)} />
}
