import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

function Layout() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar scrolled={scrolled} />
      <main className="grow pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout

