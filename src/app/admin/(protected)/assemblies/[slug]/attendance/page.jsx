import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import BackButton from '@/components/ui/BackButton'
import ServiceDataManager from '@/components/admin/attendance/ServiceDataManager'
import { Calendar, Users, TrendingUp } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AssemblyAttendancePage({ params }) {
  const { slug } = await params

  let assembly = null
  let headcountStats = null
  let arkStats = null

  try {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    // Fetch assembly
    assembly = await prisma.assembly.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            serviceData: true,
            arkCenters: true,
          },
        },
      },
    })

    if (!assembly) notFound()

    // Permission check
    if (!canManageAssembly(session, assembly.id)) {
      redirect('/admin/dashboard?error=unauthorized')
    }

    // Get attendance stats for current month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [headcountData, arkData] = await Promise.all([
      prisma.serviceData.aggregate({
        where: {
          assemblyId: assembly.id,
          arkCenterId: null,
          serviceDate: { gte: firstDayOfMonth },
        },
        _sum: { attendance: true },
        _avg: { attendance: true },
      }),
      prisma.serviceData.aggregate({
        where: {
          assemblyId: assembly.id,
          arkCenterId: { not: null },
          serviceDate: { gte: firstDayOfMonth },
        },
        _sum: { attendance: true },
      }),
    ])

    headcountStats = headcountData
    arkStats = arkData

  } catch (error) {
    console.error('Error loading attendance page:', error)
    redirect('/admin/dashboard?error=server_error')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <BackButton href={`/admin/assemblies/${slug}`} variant="outline" className="mb-4" />
          <h1 
            className="text-3xl font-bold text-gray-900" 
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Attendance & Headcounts
          </h1>
          <p className="text-gray-500">{assembly.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card p-6 bg-white border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-purple-600">
            <Users size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Service Avg (This Month)</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {Math.round(headcountStats?._avg?.attendance || 0)}
          </p>
        </div>

        <div className="card p-6 bg-white border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-purple-600">
            <TrendingUp size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Total Service (This Month)</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {headcountStats?._sum?.attendance || 0}
          </p>
        </div>

        <div className="card p-6 bg-white border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-purple-600">
            <Calendar size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Total Ark (This Month)</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {arkStats?._sum?.attendance || 0}
          </p>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">General & Ark Center Service Records</h2>
            <p className="text-sm text-gray-500">
              Record attendance, offering, and other service details for main assembly and Ark Center services.
            </p>
          </div>
          <ServiceDataManager assemblyId={assembly.id} />
        </section>

        <section className="pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ark Centers Attendance</h2>
              <p className="text-sm text-gray-500">Manage attendance for your house fellowships.</p>
            </div>
            <a 
              href={`/admin/assemblies/${slug}/ark-centers`}
              className="btn btn-outline btn-sm"
            >
              Manage Ark Centers
            </a>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
            <p className="text-sm text-purple-900 font-medium mb-4">
              Ark Centers are currently managed on their own dedicated page where you can create/edit centers and record history for each.
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-purple-100 text-xs font-bold">
                {assembly._count?.arkCenters || 0} Centers Active
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}