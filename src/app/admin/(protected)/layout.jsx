'use client'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import BottomNav from '@/components/layout/BottomNav'
import { Menu, X, LogOut, User as UserIcon, ArrowLeft, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function ProtectedAdminLayout({ children }) {
  const { data: session, status, update: updateSession } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showPwModal, setShowPwModal] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Close mobile sidebar on every route change — same pattern as Navbar.
  // Without this, isSidebarOpen persists across navigations because the layout
  // is never unmounted within the route group.
  useEffect(() => { setIsSidebarOpen(false) }, [pathname])

  // Show password change modal when the user still has a generated password
  useEffect(() => {
    if (session?.user?.mustChangePassword) setShowPwModal(true)
  }, [session?.user?.mustChangePassword])

  async function handlePwSubmit(e) {
    e.preventDefault()
    setPwError('')
    if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match'); return }
    if (pwForm.next.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setPwSaving(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      })
      const data = await res.json()
      if (!res.ok) { setPwError(data.error || 'Failed to change password'); return }
      setPwSuccess(true)
      // Clear the mustChangePassword flag in the session
      await updateSession({ mustChangePassword: false })
      setTimeout(() => { setShowPwModal(false); setPwSuccess(false); setPwForm({ current: '', next: '', confirm: '' }) }, 1800)
    } catch {
      setPwError('An error occurred. Please try again.')
    } finally {
      setPwSaving(false)
    }
  }

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

  const isAdmin = ['SUPER_ADMIN', 'GLOBAL_ADMIN', 'SITE_CONTENT_ADMIN', 'ASSEMBLY_ADMIN', 'APP_ADMIN'].includes(role)
  const isUserGroup = ['CUSTOMER', 'MEMBER', 'AGENT'].includes(role)

  const isAtDashboard =
    pathname === '/admin/dashboard' ||
    (role === 'SITE_CONTENT_ADMIN' && pathname === '/admin/site-content') ||
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
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Sidebar content */}
            <div className="relative w-[280px] h-full bg-white">
              <AdminSidebar onItemClick={() => setIsSidebarOpen(false)} />
              <button 
                className="absolute top-4 right-[-48px] p-2 bg-white rounded-full text-purple-900 shadow-xl"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}

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
              {session.user.mustChangePassword && (
                <button
                  onClick={() => setShowPwModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold animate-pulse"
                  style={{ background: '#fef3c7', color: '#92400e' }}
                  title="Change your generated password"
                >
                  <ShieldAlert size={14} />
                  <span className="hidden sm:inline">Change Password</span>
                </button>
              )}
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
        </div>

        {/* Password Change Modal */}
        {showPwModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7' }}>
                  <ShieldAlert size={22} style={{ color: '#92400e' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Change Your Password</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Your account was created with a generated password. For security, please set a personal password before continuing.
                  </p>
                </div>
              </div>

              {pwSuccess ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#dcfce7' }}>
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="font-semibold text-green-700">Password changed successfully!</p>
                </div>
              ) : (
                <form onSubmit={handlePwSubmit} className="space-y-4">
                  <div>
                    <label className="form-label">Current Password</label>
                    <div className="relative">
                      <input
                        className="form-input pr-10"
                        type={showCurrent ? 'text' : 'password'}
                        value={pwForm.current}
                        onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                        required
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">New Password</label>
                    <div className="relative">
                      <input
                        className="form-input pr-10"
                        type={showNext ? 'text' : 'password'}
                        value={pwForm.next}
                        onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                        required
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowNext(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input
                      className="form-input"
                      type="password"
                      value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  {pwError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowPwModal(false)} className="btn-outline">
                      Later
                    </button>
                    <button type="submit" disabled={pwSaving} className="btn-primary flex items-center gap-2">
                      {pwSaving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> : null}
                      {pwSaving ? 'Saving...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

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
    </div>
  )
}
