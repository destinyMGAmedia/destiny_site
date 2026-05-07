'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UserCheck, Award, BookOpen, UserPlus, ArrowRight } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

export default function MemberPortalPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [lookupData, setLookupData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!phone.trim() && !email.trim()) {
      setError('Please enter your phone number or email.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const payload = {}
      if (phone.trim()) payload.phone = phone.trim()
      if (email.trim()) payload.email = email.trim()

      const res = await fetch('/api/member/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.exists) {
        setLookupData(data)
      } else {
        setError('No record found. If you are new, please register at your assembly page.')
      }
    } catch {
      setError('Failed to check status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getGrowthLevelDisplay = (level) => {
    const levels = {
      NEW_COMER: 'New Comer',
      FOUNDATIONAL_CLASS: 'Foundational Class',
      DESTINY_CULTURE: 'Destiny Culture',
      MINISTRY_CLASS: 'Ministry Class',
      LEADERSHIP_CLASS: 'Leadership Class',
      PASTORAL_CLASS: 'Pastoral Class',
      ADVANCED_LEADERSHIP_2: 'Advanced Leadership II',
      ADVANCED_LEADERSHIP_3: 'Advanced Leadership III'
    }
    return levels[level] || level
  }

  // ── LOOKUP SCREEN ──────────────────────────────────────────────────────────
  if (!lookupData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <BackButton className="fixed top-8 left-8 z-50" variant="outline" />
        <div className="card p-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--purple-100)' }}>
              <Search size={30} style={{ color: 'var(--purple-700)' }} />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
              My Journey
            </h1>
            <p className="text-gray-500 text-sm">Enter your phone number or email to view your membership status and growth track progress.</p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                type="tel"
                placeholder="e.g. 08012345678"
                value={phone}
                onChange={(e) => { setError(''); setPhone(e.target.value.replace(/[^\d+]/g, '')) }}
              />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => { setError(''); setEmail(e.target.value) }}
              />
            </div>
            <p className="text-xs text-gray-400">You may fill one or both fields.</p>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Checking...' : 'Check My Status'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── MEMBER FOUND ───────────────────────────────────────────────────────────
  if (lookupData.type === 'MEMBER') {
    const { data } = lookupData
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <BackButton onClick={() => setLookupData(null)} className="fixed top-8 left-8 z-50" variant="outline" />
        <div className="card p-10 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gold-100)' }}>
              <Award size={30} style={{ color: 'var(--gold-600)' }} />
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
              Welcome back, {data.name}!
            </h1>
            <p className="text-sm text-gray-500">{data.assembly}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'var(--gold-100)', color: '#7a5100' }}>
              {getGrowthLevelDisplay(data.currentLevel)}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Current Stage</p>
              <p className="font-bold text-gray-900">{data.progress.currentStage || 'Not yet enrolled'}</p>
              {data.progress.status === 'ENROLLED' && data.progress.totalLessons > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{data.progress.completedLessons}/{data.progress.totalLessons} lessons</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.round((data.progress.completedLessons / data.progress.totalLessons) * 100)}%`,
                        background: 'var(--purple-700)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {data.nextAction && (
              <div className="p-4 rounded-xl border" style={{ background: 'var(--purple-50)', borderColor: 'var(--purple-100)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--purple-700)' }}>Next Step</p>
                <p className="text-gray-700 text-sm mb-3">{data.nextAction.description}</p>
                <button
                  onClick={() => router.push(data.nextAction.url)}
                  className="btn-primary btn-sm w-full justify-center"
                >
                  <BookOpen size={15} className="mr-1" />
                  {data.nextAction.type === 'TEST' ? 'Take Assessment' : 'Continue Learning'}
                </button>
              </div>
            )}
          </div>

          <button onClick={() => router.push('/growth-track')} className="btn-outline w-full justify-center">
            View Full Growth Track
          </button>
        </div>
      </div>
    )
  }

  // ── FIRST TIMER FOUND ──────────────────────────────────────────────────────
  if (lookupData.type === 'FIRST_TIMER') {
    const { data } = lookupData
    const assemblyJoinUrl = data.assemblySlug ? `/${data.assemblySlug}/join` : null

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <BackButton onClick={() => setLookupData(null)} className="fixed top-8 left-8 z-50" variant="outline" />
        <div className="card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--purple-100)' }}>
            <UserCheck size={30} style={{ color: 'var(--purple-700)' }} />
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Hi, {data.name}!
          </h1>
          <p className="text-sm text-gray-500 mb-1">{data.assembly}</p>
          <span className="inline-block mb-6 px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'var(--purple-100)', color: 'var(--purple-800)' }}>
            First Timer
          </span>

          <div className="p-4 bg-gray-50 rounded-xl text-left mb-6">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Registered</p>
            <p className="text-sm font-medium text-gray-800">{new Date(data.registeredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {data.convertedToMember ? (
            <p className="text-sm text-green-600 font-medium mb-4">You have already completed member registration.</p>
          ) : (
            <div className="p-4 rounded-xl border mb-6 text-left" style={{ background: 'var(--gold-100)', borderColor: 'var(--gold-300)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#7a5100' }}>Ready to join as a member?</p>
              <p className="text-xs text-gray-600 mb-3">
                Complete your member registration at your assembly to unlock the growth track and start your journey.
              </p>
              {assemblyJoinUrl ? (
                <button
                  onClick={() => router.push(assemblyJoinUrl)}
                  className="btn-primary btn-sm w-full justify-center"
                >
                  <UserPlus size={15} className="mr-1" />
                  Complete Registration at {data.assembly}
                  <ArrowRight size={13} className="ml-1" />
                </button>
              ) : (
                <p className="text-xs text-gray-500">Visit your assembly page to complete registration.</p>
              )}
            </div>
          )}

          <button onClick={() => setLookupData(null)} className="btn-outline w-full justify-center text-sm">
            Search Again
          </button>
        </div>
      </div>
    )
  }

  return null
}
