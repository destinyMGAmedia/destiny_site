<<<<<<< HEAD
'use client'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import BottomNav from '@/components/layout/BottomNav'
import { Menu, X, LogOut, User as UserIcon, ArrowLeft } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function ProtectedAdminLayout({ children }) {
  const { data: session, status } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F7F5]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-900" />
      </div>
    )
  }

  if (!session) return null

  const role = session.user.role
  const slug = session.user.assemblySlug
  const pathname = usePathname()

  const isAdmin = ['SUPER_ADMIN', 'GLOBAL_ADMIN', 'ASSEMBLY_ADMIN', 'APP_ADMIN'].includes(role)
  const isUserGroup = ['CUSTOMER', 'MEMBER', 'AGENT'].includes(role)

  const isAtDashboard = 
    pathname === '/admin/dashboard' || 
    (role === 'ASSEMBLY_ADMIN' && pathname === `/admin/assemblies/${slug}`) ||
    (role === 'APP_ADMIN' && pathname === `/admin/assemblies/${slug}/content`)

  const showBackButton = !isAtDashboard && (isAdmin || isUserGroup)

  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-[#F9F7F5]">
        {/* Sidebar for Desktop */}
        <div className="hidden lg:block w-[280px] flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Sidebar for Mobile (Docked/Slide-out) */}
        <div 
          className={`lg:hidden fixed inset-0 z-[100] flex transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Sidebar content */}
          <div 
            className={`relative w-[280px] h-full transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <AdminSidebar onItemClick={() => setIsSidebarOpen(false)} />
            <button 
              className="absolute top-4 right-[-48px] p-2 bg-white rounded-full text-purple-900 shadow-xl"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="flex-shrink-0 flex items-center justify-between px-4 lg:px-8 h-16 bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className="flex items-center gap-2 lg:gap-4">
              <button 
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={24} className="text-purple-900" />
              </button>

              {showBackButton && (
                <button 
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-purple-900 flex items-center gap-1.5 font-semibold text-sm"
                  title="Go Back"
                >
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}

              <h1 className="text-sm font-bold text-gray-900 truncate">
                {role?.replace('_', ' ')} Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{session.user.name}</span>
                <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{session.user.email}</span>
              </div>
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-900 shadow-inner">
                <UserIcon size={18} />
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-gray-400 group"
                title="Sign Out"
              >
                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
=======
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
>>>>>>> origin/main
        </div>
      </div>
    )
  }

<<<<<<< HEAD
  if (isUserGroup) {
    return (
      <div className="min-h-screen bg-[#F9F7F5] flex flex-col">
        {/* Header for Customers/Members/Agents */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b h-14 flex items-center px-4 justify-between shadow-sm">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button 
                onClick={() => router.back()}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-purple-900"
                title="Go Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {session.user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="font-bold text-purple-900 text-sm tracking-tight">
              DMGA {role?.charAt(0) + role?.slice(1).toLowerCase()}
            </span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 mt-14 mb-16 p-4 overflow-y-auto">
          <div className="mx-auto max-w-2xl">
            {children}
          </div>
        </main>

        {/* Footer Tabs */}
        <BottomNav role={role} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F7F5] p-6 text-center">
       <h1 className="text-2xl font-bold text-gray-900 mb-2">Restricted Access</h1>
       <p className="text-gray-600 mb-6 max-w-xs mx-auto">Your account role does not have access to this area.</p>
       <button 
         onClick={() => signOut({ callbackUrl: '/admin/login' })}
         className="px-8 py-3 bg-purple-900 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-200 transition-all active:scale-95"
       >
         Back to Login
       </button>
=======
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
>>>>>>> origin/main
    </div>
  )
}
