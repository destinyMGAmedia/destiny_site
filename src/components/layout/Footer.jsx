'use client'
import Link from 'next/link'
import Image from 'next/image'
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa'
import { Phone, Mail } from 'lucide-react'

const QUICK_LINKS = [
  { href: '/assemblies',  label: 'Assemblies' },
  { href: '/royal-feed',  label: 'Royal Feed' },
  { href: '/media',       label: 'Media' },
  { href: '/treasures',   label: 'Destiny Treasures' },
  { href: '/about',       label: 'About DMGA' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--purple-900)' }} className="text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <Image
              src="https://res.cloudinary.com/diun1hy3v/image/upload/c_scale,q_auto,f_auto,w_280/v1776444621/dmga-logo_ucjzvl.png"
              alt="Destiny Mission Global Assembly"
              width={280}
              height={120}
              className="object-contain object-left brightness-0 invert mb-6 h-24 w-auto max-w-none"
              style={{ width: 'auto', height: '6rem' }}
              priority={false}
              unoptimized={false}
            />
            <p className="text-sm text-white/60 leading-relaxed">
              Prophetic church with an apostolic mandate.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-5">
              {[
                { icon: FaFacebookF, href: '#', label: 'Facebook' },
                { icon: FaInstagram, href: '#', label: 'Instagram' },
                { icon: FaYoutube,   href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--gold-500)' }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* HQ Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--gold-500)' }}>
              Headquarters
            </h4>
            <div className="space-y-3 text-sm text-white/60">
              <p className="leading-relaxed">
                96 B-Line Ewet Housing Estate,<br />
                Uyo, Akwa Ibom State, Nigeria
              </p>
              <a
                href="tel:+2348060499761"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone size={13} />
                +234 806 049 9761
              </a>
              <a
                href="mailto:hq@destinymissions.org"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail size={13} />
                info@destinymissionglobal.org
              </a>
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--gold-500)' }}>
              HQ Service Times
            </h4>
            <div className="space-y-3 text-sm text-white/60">
              <div>
                <p className="font-semibold text-white/80">Sunday Service</p>
                <p>9:00 AM – 12:00 PM</p>
              </div>
              <div>
                <p className="font-semibold text-white/80">Thursday Service</p>
                <p>5:00 PM – 7:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>&copy; {year} Destiny Mission Global Assembly. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
