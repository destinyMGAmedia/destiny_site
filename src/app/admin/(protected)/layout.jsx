import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function ProtectedAdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  // APP_ADMIN gets a minimal layout — no sidebar
  if (session.user.role === 'APP_ADMIN') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--ivory)' }}>
        <header
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
          style={{ background: 'var(--purple-900)' }}
        >
          <div>
            <p className="text-white text-sm font-bold leading-none">DMGA Content Admin</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--gold-500)' }}>
              {session.user.assemblyName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-xs">{session.user.name}</span>
            <a
              href="/api/auth/signout"
              className="text-xs text-white/50 hover:text-red-400 transition-colors"
            >
              Sign Out
            </a>
          </div>
        </header>
        <div className="pt-14">
          <main className="px-4 py-4">{children}</main>
        </div>
      </div>
    )
  }

  // ASSEMBLY_ADMIN, GLOBAL_ADMIN, SUPER_ADMIN get full sidebar layout
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ivory)' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex-shrink-0 flex items-center justify-between px-6 h-14 bg-white border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">{session.user.email}</span>
            <span
              className="pill pill-purple text-xs"
              style={{ fontSize: '0.7rem' }}
            >
              {session.user.role?.replace('_', ' ')}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
