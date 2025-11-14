import { Link } from 'react-router-dom'
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 py-16 mt-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid gap-8 md:grid-cols-4 mb-8">
          <div>
            <img src="/images/logo.png" alt="DMGA Logo" className="h-16 mb-4" />
            <p className="text-sm">Igniting Faith. Transforming Lives.</p>
          </div>

          <div>
            <h4 className="text-accent-300 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm flex flex-col">
              <li><Link to="/live" className="hover:text-accent-300 transition">Live Stream</Link></li>
              <li><a href="/#give" className="hover:text-accent-300 transition">Give</a></li>
              <li><a href="/#prayer" className="hover:text-accent-300 transition">Prayer</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-accent-300 font-semibold mb-4">Contact</h4>
            <p className="text-sm">prayer@destinymissions.org</p>
            <p className="text-sm">+234 800 000 0000</p>
          </div>

          <div>
            <h4 className="text-accent-300 font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-2xl text-gray-300 hover:text-accent-300 transition">
                <FaFacebookF />
              </a>
              <a href="#" className="text-2xl text-gray-300 hover:text-accent-300 transition">
                <FaInstagram />
              </a>
              <a href="#" className="text-2xl text-gray-300 hover:text-accent-300 transition">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          &copy; {currentYear} Destiny Mission Global Assembly. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer

