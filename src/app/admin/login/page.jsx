'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { getAdminLandingRoute } from '@/lib/auth'

export default function AdminLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const urlError = searchParams.get('error')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    urlError === 'unauthorized' 
      ? 'You do not have permission to access that page.' 
      : urlError 
        ? 'An error occurred during sign in. Please try again.' 
        : null
  )

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Successful login → Get fresh session and redirect using your helper
      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()

      if (sessionData?.user) {
        const landingRoute = getAdminLandingRoute(sessionData.user)
        router.push(landingRoute)
        router.refresh() // Ensure fresh data after redirect
      } else {
        // Fallback
        router.push('/admin/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--purple-900)' }}
    >
      {/* Left branding panel */}
      <div
        className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12"
        style={{ background: 'var(--purple-800)' }}
      >
        <Link href="/" className="max-w-sm text-center block hover:opacity-80 transition-opacity">
          <Image
            src="https://res.cloudinary.com/dmga/image/upload/v1/dmga/global/branding/logo"
            alt="DMGA"
            width={240}
            height={96}
            className="object-contain mx-auto mb-6"
            priority
          />
          <div className="w-12 h-1 mx-auto mb-4 rounded-full" style={{ background: 'var(--gold-500)' }} />
          <p className="text-white/60 text-sm leading-relaxed">
            Church Management & Content Administration Portal
          </p>
        </Link>
      </div>

      {/* Login form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Mobile logo */}
            <div className="flex justify-center mb-6 lg:hidden">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image 
                  src="https://res.cloudinary.com/dmga/image/upload/v1/dmga/global/branding/logo" 
                  alt="DMGA" 
                  width={64} 
                  height={64} 
                  className="object-contain" 
                />
              </Link>
            </div>

            <h2 
              className="text-2xl font-bold mb-1" 
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
            >
              Admin Login
            </h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to your admin account</p>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 mb-5">
                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-9"
                    placeholder="admin@destinymissions.org"
                    required
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-9 pr-9"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPass((v) => !v)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              Destiny Mission Global Assembly &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}