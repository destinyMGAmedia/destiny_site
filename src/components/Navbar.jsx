import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/DMGA_logo.png'

function Navbar({ scrolled }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/live', label: 'Live' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/testimonies', label: 'Testimonies' },
    { path: '/events', label: 'Events' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ]

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-lg backdrop-blur-lg py-3' : 'bg-white py-5 shadow'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Destiny Mission Global Assembly" className="h-12 md:h-14 w-auto object-contain" />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `font-medium transition-colors duration-300 ${
                        isActive ? 'text-primary-900' : 'text-primary-900 hover:text-accent-300'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl text-primary-900"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✖' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed top-[70px] left-0 w-full bg-primary-900 text-white p-8 transition-all duration-300 z-40">
            <ul className="space-y-4 text-center">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `block text-lg font-medium ${
                        isActive ? 'text-accent-300' : 'text-white hover:text-accent-300'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

