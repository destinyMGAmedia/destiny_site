import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, MapPin, Users, Star, Settings } from 'lucide-react'
import { MdOutlineChurch } from 'react-icons/md'

export const metadata = { title: 'All Assemblies' }
export const dynamic = 'force-dynamic'

export default async function AllAssembliesPage() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) redirect('/admin/dashboard')

  const assemblies = await prisma.assembly.findMany({
    orderBy: [{ isHQ: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      country: true,
      isHQ: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { members: true, teamMembers: true, arkCenters: true },
      },
    },
  })

  const active = assemblies.filter(a => a.isActive).length
  const inactive = assemblies.length - active

  return (
    <div className="space-y-6 fade-in p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            All Assemblies
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {assemblies.length} assemblies &mdash; {active} active, {inactive} inactive
          </p>
        </div>
        <Link href="/admin/assemblies/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Assembly
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: assemblies.length, color: 'var(--purple-800)', bg: 'var(--purple-50)' },
          { label: 'Active', value: active, color: '#2e7d32', bg: '#e8f5e9' },
          { label: 'Inactive', value: inactive, color: '#c62828', bg: '#ffebee' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
              <MdOutlineChurch size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--ivory)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assembly</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Members</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Leaders</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Ark Centers</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {assemblies.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--purple-50)' }}>
                        <MdOutlineChurch size={18} style={{ color: 'var(--purple-700)' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900">{a.name}</p>
                          {a.isHQ && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">
                              <Star size={9} /> HQ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-mono">{a.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      {a.city}, {a.country}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-700">
                      <Users size={13} className="text-gray-400" />
                      {a._count.members}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center text-gray-700">
                    {a._count.teamMembers}
                  </td>
                  <td className="px-5 py-4 text-center text-gray-700">
                    {a._count.arkCenters}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${a.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/assemblies/${a.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-purple-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-50"
                    >
                      <Settings size={13} /> Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {assemblies.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    No assemblies found. <Link href="/admin/assemblies/new" className="text-purple-600 hover:underline">Create the first one.</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
