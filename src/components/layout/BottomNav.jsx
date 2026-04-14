'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Settings, CreditCard, Users, Briefcase } from 'lucide-react'

const ROLE_LINKS = {
  CUSTOMER: [
    { href: '/admin/dashboard', icon: Home, label: 'Home' },
    { href: '/admin/profile', icon: User, label: 'Profile' },
    { href: '/admin/giving', icon: CreditCard, label: 'Giving' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ],
  MEMBER: [
    { href: '/admin/dashboard', icon: Home, label: 'Home' },
    { href: '/admin/fellowships', icon: Users, label: 'Fellowship' },
    { href: '/admin/profile', icon: User, label: 'Profile' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ],
  AGENT: [
    { href: '/admin/dashboard', icon: Home, label: 'Home' },
    { href: '/admin/tasks', icon: Briefcase, label: 'Tasks' },
    { href: '/admin/profile', icon: User, label: 'Profile' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ],
}

export default function BottomNav({ role }) {
  const pathname = usePathname()
  const links = ROLE_LINKS[role] || ROLE_LINKS.CUSTOMER

  const isActive = (href) => pathname === href

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex items-center justify-around h-16 px-2 shadow-lg" style={{ borderColor: 'var(--border)' }}>
      {links.map((link) => {
        const Icon = link.icon
        const active = isActive(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center gap-1 transition-colors px-3 py-1 rounded-lg ${
              active ? 'text-purple-800 bg-purple-50' : 'text-gray-500 hover:text-purple-800'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
