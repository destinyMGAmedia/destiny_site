import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/DMGA_logo.png'

function Navbar({ scrolled }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/assemblies', label: 'Assemblies' },
    { path: '/programmes', label: 'Programmes' },
    { path: '/video-gallery', label: 'Video Gallery' },
    { path: '/contact', label: 'Contact' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white shadow-lg py-4' 
        : 'bg-white bg-opacity-95 backdrop-blur-md py-6 shadow-md'
    }`}>
      <div className="container mx-auto px-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition duration-300">
          <img 
            src={logo} 
            alt="Destiny Mission Global Assembly" 
            className="h-20 md:h-24 w-auto"
          />
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition duration-300 ${
                isActive(link.path)
                  ? 'text-purple-900 font-semibold'
                  : 'text-gray-700 hover:text-purple-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-purple-900"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-4 bg-white shadow-lg rounded-lg p-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`block transition duration-300 ${
                isActive(link.path)
                  ? 'text-purple-900 font-semibold'
                  : 'text-gray-700 hover:text-purple-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
      </div>
    </nav>
  )
}

export default Navbar

