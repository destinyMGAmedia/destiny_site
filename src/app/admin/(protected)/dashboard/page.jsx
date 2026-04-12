import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import {
  Users, MapPin, Calendar, BookOpen,
  Grid3x3, ImageIcon, Video, Plus, ArrowRight
} from 'lucide-react'
import { MdOutlineChurch } from 'react-icons/md'

export const metadata = { title: 'Dashboard' }

async function getStats() {
  const [assemblies, admins, events, devotionals] = await Promise.all([
    prisma.assembly.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.event.count({ where: { startDate: { gte: new Date() } } }),
    prisma.devotional.count({ where: { scheduledDate: { gte: new Date() } } }),
  ])
  return { assemblies, admins, events, devotionals }
}

async function getAssemblies() {
  return prisma.assembly.findMany({
    where: { isActive: true },
    select: {
      slug: true, name: true, city: true, country: true, isHQ: true,
      _count: { select: { members: true, events: true } },
    },
    orderBy: [{ isHQ: 'desc' }, { name: 'asc' }],
  })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) redirect('/admin/login')

  const [stats, assemblies] = await Promise.all([getStats(), getAssemblies()])

  const statCards = [
    { label: 'Active Assemblies', value: stats.assemblies, icon: MdOutlineChurch, color: 'var(--purple-800)', bg: 'var(--purple-50)' },
    { label: 'Admin Accounts',    value: stats.admins,     icon: Users,           color: '#1565c0', bg: '#e3f2fd' },
    { label: 'Upcoming Events',   value: stats.events,     icon: Calendar,        color: '#ad1457', bg: '#fce4ec' },
    { label: 'Scheduled Devotionals', value: stats.devotionals, icon: BookOpen,   color: '#2e7d32', bg: '#e8f5e9' },
  ]

  const quickLinks = [
    { href: '/admin/assemblies/new', icon: Plus,      label: 'New Assembly' },
    { href: '/admin/admins',         icon: Users,     label: 'Manage Admins' },
    { href: '/admin/devotionals',    icon: BookOpen,  label: 'Schedule Devotional' },
    { href: '/admin/games',          icon: Grid3x3,   label: 'Manage Games' },
    { href: '/admin/hero-slides',    icon: ImageIcon, label: 'Hero Slides' },
    { href: '/admin/channels',       icon: Video,   label: 'YouTube Channels' },
  ]

  return (
    <div className="space-y-8 fade-in">
      {/* Welcome */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
        >
          Welcome back, {session.user.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Destiny Mission Global Assembly — Admin Dashboard
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.bg }}
                >
                  <Icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: 'var(--purple-900)' }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((l) => {
            const Icon = l.icon
            return (
              <Link
                key={l.href}
                href={l.href}
                className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-lg transition-shadow"
              >
                <Icon size={20} style={{ color: 'var(--purple-700)' }} />
                <span className="text-xs font-semibold text-gray-700">{l.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Assemblies List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            All Assemblies
          </h2>
          <Link href="/admin/assemblies/new" className="btn-primary btn-sm">
            <Plus size={13} /> New
          </Link>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--ivory)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assembly</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Location</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Members</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Events</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {assemblies.map((a) => (
                <tr key={a.slug} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MdOutlineChurch size={16} style={{ color: 'var(--purple-700)' }} />
                      <div>
                        <p className="font-semibold text-gray-900">{a.name}</p>
                        {a.isHQ && (
                          <span className="pill pill-gold text-xs">HQ</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    <MapPin size={12} className="inline mr-1" />
                    {a.city}, {a.country}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 hidden md:table-cell">{a._count.members}</td>
                  <td className="px-4 py-3 text-center text-gray-700 hidden md:table-cell">{a._count.events}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/assemblies/${a.slug}`}
                      className="flex items-center gap-1 text-xs font-semibold"
                      style={{ color: 'var(--purple-700)' }}
                    >
                      Manage <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
