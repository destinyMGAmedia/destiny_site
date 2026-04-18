'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  Home, Users, Settings, LogOut, ChevronRight,
  LayoutDashboard, Calendar, DollarSign, BarChart2,
  Globe, Video, BookOpen, Grid3x3, ImageIcon,
  UserCheck, ClipboardList,
} from 'lucide-react'
import { MdOutlineChurch } from 'react-icons/md'

function NavItem({ href, icon: Icon, label, active, onClick }) {
  return (
    <Link
      href={href}
      className={`admin-nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <Icon size={17} />
      <span>{label}</span>
      {active && <ChevronRight size={14} className="ml-auto" style={{ color: 'var(--gold-500)' }} />}
    </Link>
  )
}

function NavSection({ title, children }) {
  return (
    <div className="mb-2">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-white/30">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

export default function AdminSidebar({ onItemClick }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role
  const slug = session?.user?.assemblySlug
  const assemblyName = session?.user?.assemblyName

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/')
  const assemblyBase = `/admin/assemblies/${slug}`

  return (
    <aside className="admin-sidebar flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Image
            src="https://res.cloudinary.com/diun1hy3v/image/upload/c_scale,q_auto,f_auto,w_120/v1776444621/dmga-logo_ucjzvl.png"
            alt="DMGA"
            width={120}
            height={48}
            className="object-contain shrink-0 h-12 w-auto max-w-none"
            unoptimized={false}
            priority={false}
          />
          <div>
            <p className="text-white text-sm font-bold leading-tight">DMGA Admin</p>
            <p className="text-xs leading-tight mt-0.5" style={{ color: 'var(--gold-500)' }}>
              {role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        {(role === 'ASSEMBLY_ADMIN') && assemblyName && (
          <div className="mt-3 px-2 py-1.5 rounded-lg text-xs text-white/60 bg-white/5">
            {assemblyName}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

        {/* SUPER_ADMIN + GLOBAL_ADMIN nav */}
        {(role === 'SUPER_ADMIN' || role === 'GLOBAL_ADMIN') && (
          <>
            <NavSection title="Overview">
              <NavItem href="/admin/dashboard" icon={Home} label="Dashboard" active={isActive('/admin/dashboard')} onClick={onItemClick} />
            </NavSection>

            <NavSection title="Assemblies">
              <NavItem href="/admin/assemblies" icon={MdOutlineChurch} label="All Assemblies" active={pathname === '/admin/assemblies'} onClick={onItemClick} />
              <NavItem href="/admin/assemblies/new" icon={Globe} label="New Assembly" active={isActive('/admin/assemblies/new')} onClick={onItemClick} />
            </NavSection>

            <NavSection title="Users">
              <NavItem href="/admin/admins" icon={Users} label="Manage Admins" active={isActive('/admin/admins')} onClick={onItemClick} />
            </NavSection>

            <NavSection title="Global Content">
              <NavItem href="/admin/devotionals" icon={BookOpen} label="Royal Feed" active={isActive('/admin/devotionals')} onClick={onItemClick} />
              <NavItem href="/admin/growth-track" icon={UserCheck} label="Growth Track" active={isActive('/admin/growth-track')} onClick={onItemClick} />
              <NavItem href="/admin/games" icon={Grid3x3} label="Bible Games" active={isActive('/admin/games')} onClick={onItemClick} />
              <NavItem href="/admin/hero-slides" icon={ImageIcon} label="Hero Slides" active={isActive('/admin/hero-slides')} onClick={onItemClick} />
              <NavItem href="/admin/channels" icon={Video} label="YouTube Channels" active={isActive('/admin/channels')} onClick={onItemClick} />
            </NavSection>
          </>
        )}

        {/* SUPER_ADMIN only */}
        {role === 'SUPER_ADMIN' && (
          <NavSection title="System">
            <NavItem href="/admin/system" icon={BarChart2} label="Analytics" active={isActive('/admin/system')} onClick={onItemClick} />
            <NavItem href="/admin/system/settings" icon={Settings} label="System Settings" active={isActive('/admin/system/settings')} onClick={onItemClick} />
          </NavSection>
        )}

        {/* ASSEMBLY_ADMIN nav */}
        {role === 'ASSEMBLY_ADMIN' && slug && (
          <>
            <NavSection title="Overview">
              <NavItem href={assemblyBase} icon={Home} label="Dashboard" active={pathname === assemblyBase} onClick={onItemClick} />
            </NavSection>

            <NavSection title="Page Content">
              <NavItem href={`${assemblyBase}/content`} icon={LayoutDashboard} label="Content Sections" active={isActive(`${assemblyBase}/content`)} onClick={onItemClick} />
            </NavSection>

            <NavSection title="Church Management">
              <NavItem href={`${assemblyBase}/members`} icon={UserCheck} label="Members" active={isActive(`${assemblyBase}/members`)} onClick={onItemClick} />
              <NavItem href={`${assemblyBase}/attendance`} icon={Calendar} label="Attendance" active={isActive(`${assemblyBase}/attendance`)} onClick={onItemClick} />
              <NavItem href={`${assemblyBase}/finance`} icon={DollarSign} label="Finance" active={isActive(`${assemblyBase}/finance`)} onClick={onItemClick} />
              <NavItem href={`${assemblyBase}/schedule`} icon={Calendar} label="Schedule" active={isActive(`${assemblyBase}/schedule`)} onClick={onItemClick} />
              <NavItem href={`${assemblyBase}/reports`} icon={ClipboardList} label="Reports" active={isActive(`${assemblyBase}/reports`)} onClick={onItemClick} />
            </NavSection>

            <NavSection title="Account">
              <NavItem href={`${assemblyBase}/settings`} icon={Settings} label="Settings" active={isActive(`${assemblyBase}/settings`)} onClick={onItemClick} />
            </NavSection>
          </>
        )}

        {/* APP_ADMIN nav */}
        {role === 'APP_ADMIN' && slug && (
          <>
            <NavSection title="Content">
              <NavItem href={`${assemblyBase}/content`} icon={LayoutDashboard} label="Page Sections" active={isActive(`${assemblyBase}/content`)} onClick={onItemClick} />
            </NavSection>
            <NavSection title="Account">
              <NavItem href={`${assemblyBase}/settings`} icon={Settings} label="Settings" active={isActive(`${assemblyBase}/settings`)} onClick={onItemClick} />
            </NavSection>
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3">
          <p className="text-white text-sm font-semibold truncate">{session?.user?.name}</p>
          <p className="text-white/40 text-xs truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
