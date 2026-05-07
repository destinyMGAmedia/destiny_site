'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UserCheck, UserPlus, Award, BookOpen } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

export default function MemberRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState('LOOKUP') // LOOKUP, FOUND, REGISTER
  const [identifier, setIdentifier] = useState('')
  const [lookupData, setLookupData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', middleName: '', email: '', phone: '',
    gender: 'MALE', dateOfBirth: '', address: '', city: '', state: '', country: 'Nigeria',
    fellowship: 'DESTINY_TREASURES', department: 'NONE', arkCenterId: '',
    notes: '', assemblySlug: 'headquarters' // Default to HQ
  })

  const handleLookup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/member/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      })

      const data = await res.json()

      if (data.exists) {
        setLookupData(data)
        setStep('FOUND')
      } else {
        // Pre-fill form with identifier
        if (identifier.includes('@')) {
          setForm(f => ({ ...f, email: identifier }))
        } else {
          setForm(f => ({ ...f, phone: identifier }))
        }
        setStep('REGISTER')
      }
    } catch (err) {
      setError('Failed to check status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/assemblies/${form.assemblySlug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'MEMBER' })
      })

      if (res.ok) {
        router.push('/member/success')
      } else {
        const data = await res.json()
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Failed to register. Please try again.')
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

  if (step === 'LOOKUP') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <BackButton className="fixed top-8 left-8 z-50" variant="outline" />
        <div className="card p-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--purple-100)' }}>
              <Search size={30} style={{ color: 'var(--purple-700)' }} />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
              Member Portal
            </h1>
            <p className="text-gray-500">Check your membership status and growth track progress</p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="form-label">Enter your phone number or email</label>
              <input
                className="form-input"
                placeholder="e.g. 08012345678 or john@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              First time visitor? 
              <a href="/headquarters/join" className="text-purple-600 hover:underline ml-1">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'FOUND' && lookupData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <BackButton onClick={() => setStep('LOOKUP')} className="fixed top-8 left-8 z-50" variant="outline" />
        <div className="card p-10 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" 
                 style={{ background: lookupData.type === 'MEMBER' ? 'var(--gold-100)' : 'var(--purple-100)' }}>
              {lookupData.type === 'MEMBER' ? (
                <Award size={30} style={{ color: 'var(--gold-600)' }} />
              ) : (
                <UserCheck size={30} style={{ color: 'var(--purple-700)' }} />
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
              Welcome Back, {lookupData.data.name}!
            </h1>
            {lookupData.type === 'MEMBER' ? (
              <span className="inline-block px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm font-medium">
                {getGrowthLevelDisplay(lookupData.data.currentLevel)}
              </span>
            ) : (
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                First Timer
              </span>
            )}
          </div>

          {lookupData.type === 'MEMBER' && (
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Current Stage</p>
                <p className="font-bold">{lookupData.data.progress.currentStage || 'Not enrolled'}</p>
                {lookupData.data.progress.status === 'ENROLLED' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{lookupData.data.progress.completedLessons}/{lookupData.data.progress.totalLessons} lessons</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${(lookupData.data.progress.completedLessons / lookupData.data.progress.totalLessons) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {lookupData.data.nextAction && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium mb-2">Next Action Required</p>
                  <p className="text-gray-700 mb-3">{lookupData.data.nextAction.description}</p>
                  <button 
                    onClick={() => router.push(lookupData.data.nextAction.url)}
                    className="btn-primary btn-sm w-full justify-center"
                  >
                    <BookOpen size={16} className="mr-2" />
                    {lookupData.data.nextAction.type === 'TEST' ? 'Take Assessment' : 'Continue Learning'}
                  </button>
                </div>
              )}
            </div>
          )}

          {lookupData.type === 'FIRST_TIMER' && (
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-bold">First Timer Registration</p>
                <p className="text-sm text-gray-500 mt-1">
                  Registered on {new Date(lookupData.data.registeredAt).toLocaleDateString()}
                </p>
              </div>

              {!lookupData.data.convertedToMember && (
                <div className="p-4 bg-gold-50 rounded-xl border border-gold-200">
                  <p className="text-sm font-medium text-gold-700 mb-2">Ready to become a member?</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Complete your member registration to access growth track materials and start your journey.
                  </p>
                  <button 
                    onClick={() => {
                      setForm(f => ({ 
                        ...f, 
                        phone: identifier.includes('@') ? '' : identifier,
                        email: identifier.includes('@') ? identifier : ''
                      }))
                      setStep('REGISTER')
                    }}
                    className="btn-primary btn-sm w-full justify-center"
                  >
                    <UserPlus size={16} className="mr-2" />
                    Complete Member Registration
                  </button>
                </div>
              )}
            </div>
          )}

          <button 
            onClick={() => router.push('/growth-track')}
            className="btn-outline w-full justify-center"
          >
            View Growth Track Overview
          </button>
        </div>
      </div>
    )
  }

  if (step === 'REGISTER') {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--ivory)' }}>
        <BackButton onClick={() => setStep('LOOKUP')} className="fixed top-8 left-8 z-50" variant="outline" />
        <div className="max-w-2xl mx-auto pt-20">
          <div className="card p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
                Member Registration
              </h1>
              <p className="text-sm text-gray-500 mt-1">Complete your registration to access growth track</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <input
                    className="form-input"
                    value={form.firstName}
                    onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input
                    className="form-input"
                    value={form.lastName}
                    onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Middle Name</label>
                  <input
                    className="form-input"
                    value={form.middleName}
                    onChange={(e) => setForm(f => ({ ...f, middleName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone *</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-select"
                    value={form.gender}
                    onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Date of Birth</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Address</label>
                <input
                  className="form-input"
                  value={form.address}
                  onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">City</label>
                  <input
                    className="form-input"
                    value={form.city}
                    onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input
                    className="form-input"
                    value={form.state}
                    onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <input
                    className="form-input"
                    value={form.country}
                    onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Fellowship *</label>
                  <select
                    className="form-select"
                    value={form.fellowship}
                    onChange={(e) => setForm(f => ({ ...f, fellowship: e.target.value }))}
                  >
                    <option value="KINGS_MEN">Kings Men (Men)</option>
                    <option value="DESTINY_PRESERVERS">Destiny Preservers (Women)</option>
                    <option value="DESTINY_DEFENDERS">Destiny Defenders (Youth)</option>
                    <option value="DESTINY_TREASURES">Destiny Treasures (Children)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={form.department}
                    onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                  >
                    <option value="NONE">None / Show Interest</option>
                    <option value="PASTORS">Pastors</option>
                    <option value="CHOIR">Choir</option>
                    <option value="SANCTUARY_KEEPERS">Sanctuary Keepers</option>
                    <option value="PROTOCOL">Protocol</option>
                    <option value="MEDIA_TECHNICAL">Media & Technical</option>
                    <option value="CREATIVE_ARTS">Creative Arts</option>
                    <option value="FACILITY">Facility</option>
                    <option value="EVANGELISM">Evangelism</option>
                    <option value="PRAYER">Prayer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? 'Processing...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return null
}