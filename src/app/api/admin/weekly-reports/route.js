import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isGlobalAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const weekStart = searchParams.get('weekStart')
  const assemblyId = searchParams.get('assemblyId')
  const reportStatus = searchParams.get('status')

  const [reports, allAssemblies] = await Promise.all([
    prisma.weeklyReport.findMany({
      where: {
        ...(weekStart ? { weekStart: new Date(weekStart) } : {}),
        ...(assemblyId ? { assemblyId } : {}),
        ...(reportStatus ? { status: reportStatus } : {}),
      },
      include: {
        assembly: { select: { id: true, name: true, slug: true, city: true } },
      },
      orderBy: [{ weekStart: 'desc' }, { assembly: { name: 'asc' } }],
      take: 200,
    }),
    prisma.assembly.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, city: true },
      orderBy: { name: 'asc' },
    }),
  ])

  // Build submission status map for the requested week
  let submissionStatus = []
  if (weekStart) {
    const submittedIds = new Set(reports.filter(r => r.weekStart.toISOString().startsWith(weekStart.slice(0, 10))).map(r => r.assemblyId))
    const draftIds = new Set(reports.filter(r => r.status === 'DRAFT' && r.weekStart.toISOString().startsWith(weekStart.slice(0, 10))).map(r => r.assemblyId))
    submissionStatus = allAssemblies.map(a => {
      const weekReport = reports.find(r => r.assemblyId === a.id && r.weekStart.toISOString().startsWith(weekStart.slice(0, 10)))
      return {
        ...a,
        reportStatus: weekReport?.status || 'NOT_SUBMITTED',
        reportId: weekReport?.id || null,
      }
    })
  }

  return NextResponse.json({ reports, allAssemblies, submissionStatus })
}
