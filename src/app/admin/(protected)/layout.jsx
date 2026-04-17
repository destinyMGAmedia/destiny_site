'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import BottomNav from '@/components/layout/BottomNav';
import { Menu, X, LogOut, User as UserIcon, ArrowLeft } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function ProtectedAdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    }
  }, [status, router]);

  // Close sidebar on navigation to prevent stuck overlays
  const handleSidebarClose = () => setIsSidebarOpen(false);

  // Show loading spinner while session is being fetched
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F7F5]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-900" />
      </div>
    );
  }

  // If no session after loading → return null (the useEffect will redirect)
  if (!session) {
    return null;
  }

  const role = session.user?.role;
  const slug = session.user?.assemblySlug;

  const isAdmin = ['SUPER_ADMIN', 'GLOBAL_ADMIN', 'ASSEMBLY_ADMIN', 'APP_ADMIN'].includes(role);
  const isUserGroup = ['CUSTOMER', 'MEMBER', 'AGENT'].includes(role);

  const isAtDashboard =
    pathname === '/admin/dashboard' ||
    (role === 'ASSEMBLY_ADMIN' && pathname === `/admin/assemblies/${slug}`) ||
    (role === 'APP_ADMIN' && pathname === `/admin/assemblies/${slug}/content`);

  const showBackButton = !isAtDashboard && (isAdmin || isUserGroup);

  // Admin Layout (Desktop + Mobile Sidebar)
  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-[#F9F7F5]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[280px] flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`lg:hidden fixed inset-0 z-[100] flex transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleSidebarClose}
          />
          <div
            className={`relative w-[280px] h-full transition-transform duration-300 transform ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <AdminSidebar onItemClick={handleSidebarClose} />
            <button
              className="absolute top-4 right-[-48px] p-2 bg-white rounded-full text-purple-900 shadow-xl"
              onClick={handleSidebarClose}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content */}
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
                <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">
                  {session.user.name}
                </span>
                <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
                  {session.user.email}
                </span>
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
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  // User Group Layout (Customer / Member / Agent)
  if (isUserGroup) {
    return (
      <div className="min-h-screen bg-[#F9F7F5] flex flex-col">
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

        <main className="flex-1 mt-14 mb-16 p-4 overflow-y-auto">
          <div className="mx-auto max-w-2xl">{children}</div>
        </main>

        <BottomNav role={role} />
      </div>
    );
  }

  // Fallback for unauthorized roles
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F7F5] p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Restricted Access</h1>
      <p className="text-gray-600 mb-6 max-w-xs mx-auto">
        Your account role does not have access to this area.
      </p>
      <button
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="px-8 py-3 bg-purple-900 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-200 transition-all active:scale-95"
      >
        Back to Login
      </button>
    </div>
  );
}