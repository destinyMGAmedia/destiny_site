import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import {
  LayoutDashboard, Users, Calendar, DollarSign,
  ClipboardList, Settings, ArrowRight, Eye,
  MessageSquare, Star, UserCheck, Home
} from 'lucide-react'

// Force dynamic rendering for admin assembly page with authentication
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params
    const assembly = await prisma.assembly.findUnique({ where: { slug }, select: { name: true } })
    return { title: assembly?.name || 'Assembly Dashboard' }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return { title: 'Assembly Dashboard' }
  }
}

async function getAssemblyStats(assemblyId) {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    members, events, prayerPending, testimoniesPending,
    visitorsThisMonth, birthdays, arkCenters, arkAttendanceThisMonth,
    headcountThisMonth
  ] = await Promise.all([
    prisma.member.count({ where: { assemblyId, status: 'ACTIVE' } }),
    prisma.event.count({ where: { assemblyId, startDate: { gte: today } } }),
    prisma.prayerRequest.count({ where: { assemblyId, status: 'PENDING' } }),
    prisma.testimony.count({ where: { assemblyId, isApproved: false } }),
    prisma.visitor.count({ where: { assemblyId, visitDate: { gte: startOfMonth } } }),
    // Members with birthday today (month + day match)
    prisma.member.findMany({
      where: { assemblyId, status: 'ACTIVE' },
      select: { firstName: true, lastName: true, dateOfBirth: true, photo: true },
    }),
    prisma.arkCenter.count({ where: { assemblyId, isActive: true } }),
    prisma.serviceData.aggregate({
      where: {
        assemblyId,
        arkCenterId: { not: null },
        serviceDate: { gte: startOfMonth }
      },
      _sum: { attendance: true }
    }),
    prisma.serviceData.aggregate({
      where: { 
        assemblyId, 
        arkCenterId: null,
        serviceDate: { gte: startOfMonth } 
      },
      _sum: { attendance: true }
    })
  ])

  // Filter to today's birthdays
  const todayBirthdays = birthdays.filter((m) => {
    if (!m.dateOfBirth) return false
    const dob = new Date(m.dateOfBirth)
    return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate()
  })

  return { 
    members, events, prayerPending, testimoniesPending, 
    visitorsThisMonth, todayBirthdays, arkCenters,
    arkAttendanceThisMonth: arkAttendanceThisMonth._sum.attendance || 0,
    headcountThisMonth: headcountThisMonth._sum.attendance || 0
  }
}

export default async function AssemblyAdminPage({ params }) {
  try {
    const { slug } = await params
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const assembly = await prisma.assembly.findUnique({ where: { slug } })
    if (!assembly) notFound()

    if (!canManageAssembly(session, assembly.id)) redirect('/admin/dashboard?error=unauthorized')

    const stats = await getAssemblyStats(assembly.id)
  } catch (error) {
    console.error('Error loading assembly admin page:', error)
    notFound()
  }

  const mgmtLinks = [
    { href: 'content',    icon: LayoutDashboard, label: 'Content Sections', desc: 'Update page content' },
    { href: 'members',    icon: UserCheck,      label: 'Members',          desc: `${stats.members} active members` },
    { href: 'attendance', icon: Calendar,       label: 'Attendance',       desc: `${stats.headcountThisMonth} total headcount this month` },
    { href: 'ark-centers', icon: Home,          label: 'Ark Centers',      desc: `${stats.arkCenters} centers, ${stats.arkAttendanceThisMonth} attending` },
    { href: 'finance',    icon: DollarSign,     label: 'Finance',          desc: 'Offerings & expenditure' },
    { href: 'schedule',   icon: Calendar,       label: 'Schedule',         desc: 'Service schedule' },
    { href: 'reports',    icon: ClipboardList,  label: 'Reports',          desc: 'Monthly & annual reports' },
    { href: 'settings',   icon: Settings,       label: 'Settings',         desc: 'Assembly settings' },
  ]

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
          >
            {assembly.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{assembly.city}, {assembly.country}</p>
        </div>
        <Link href={`/${assembly.slug}`} target="_blank" className="btn-outline btn-sm">
          <Eye size={13} /> View Page
        </Link>
      </div>

      {/* Birthday Alert */}
      {stats.todayBirthdays.length > 0 && (
        <div
          className="rounded-xl p-4 border-l-4 flex items-start gap-3"
          style={{ background: '#fff8e1', borderColor: 'var(--gold-500)' }}
        >
          <span className="text-2xl">🎂</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#7a5100' }}>
              Birthday{stats.todayBirthdays.length > 1 ? 's' : ''} Today!
            </p>
            <p className="text-sm text-gray-700">
              {stats.todayBirthdays.map((m) => `${m.firstName} ${m.lastName}`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Members',       value: stats.members,             color: 'var(--purple-800)' },
          { label: 'Upcoming Events',      value: stats.events,              color: '#1565c0' },
          { label: 'Pending Prayers',      value: stats.prayerPending,       color: '#ad1457' },
          { label: 'Pending Testimonies',  value: stats.testimoniesPending,  color: '#e65100' },
          { label: 'Attendance (Month)',   value: stats.headcountThisMonth + stats.arkAttendanceThisMonth, color: '#2e7d32' },
          { label: 'Ark Centers',          value: stats.arkCenters,          color: 'var(--purple-800)' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Management Links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Manage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mgmtLinks.map((l) => {
            const Icon = l.icon
            return (
              <Link
                key={l.href}
                href={`/admin/assemblies/${slug}/${l.href}`}
                className="card p-5 flex items-start gap-4 hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--purple-50)' }}
                >
                  <Icon size={18} style={{ color: 'var(--purple-700)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{l.label}</p>
                  <p className="text-xs text-gray-500 truncate">{l.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 flex-shrink-0 mt-0.5" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick moderation panel */}
      {(stats.prayerPending > 0 || stats.testimoniesPending > 0) && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Needs Attention
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {stats.prayerPending > 0 && (
              <Link
                href={`/admin/assemblies/${slug}/content/${
                  /* prayer section */ 'prayer'
                }`}
                className="card p-4 flex items-center gap-3 flex-1"
              >
                <MessageSquare size={18} style={{ color: '#ad1457' }} />
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {stats.prayerPending} Prayer Request{stats.prayerPending !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-500">Awaiting prayer</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 ml-auto" />
              </Link>
            )}
            {stats.testimoniesPending > 0 && (
              <Link
                href={`/admin/assemblies/${slug}/content/testimonies`}
                className="card p-4 flex items-center gap-3 flex-1"
              >
                <Star size={18} style={{ color: '#e65100' }} />
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {stats.testimoniesPending} Testimon{stats.testimoniesPending !== 1 ? 'ies' : 'y'}
                  </p>
                  <p className="text-xs text-gray-500">Awaiting approval</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 ml-auto" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
