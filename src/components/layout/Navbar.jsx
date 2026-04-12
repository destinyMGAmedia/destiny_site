'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/',            label: 'Home' },
  { href: '/assemblies',  label: 'Assemblies' },
  { href: '/royal-feed',  label: 'Royal Feed' },
  { href: '/media',       label: 'Media' },
  { href: '/treasures',   label: 'Treasures' },
  { href: '/about',       label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [pathname])

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white shadow-md'
            : 'bg-white/95 backdrop-blur-sm shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Image
                src="/images/dmga-logo.png"
                alt="Destiny Mission Global Assembly"
                width={160}
                height={64}
                className="object-contain object-left"
                style={{ height: '56px', width: 'auto' }}
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-purple-800 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-800 hover:bg-purple-50'
                  }`}
                  style={isActive(link.href) ? { color: 'var(--purple-800)' } : {}}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/assemblies" className="btn-primary btn-sm">
                Give Now
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-purple-800 transition"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'var(--purple-900)' }}
      >
        {/* Spacer for header */}
        <div className="h-16" />

        <nav className="flex flex-col px-6 pt-8 gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-2xl font-bold py-3 border-b border-white/10 transition-colors ${
                isActive(link.href)
                  ? 'text-yellow-400'
                  : 'text-white hover:text-yellow-400'
              }`}
              style={isActive(link.href) ? { color: 'var(--gold-500)' } : {}}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/assemblies" className="btn-primary text-center">
              Give Now
            </Link>
          </div>
        </nav>
      </div>

      {/* Spacer so page content isn't hidden under fixed nav */}
      <div className="h-16 md:h-20" />
    </>
  )
}
