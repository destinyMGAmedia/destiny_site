'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, UserPlus, Users, Search, AlertCircle } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

export default function JoinPage() {
  const { slug } = useParams()
  const router = useRouter()
  // step: 'TYPE' → 'CHECK' → 'FOUND' | 'FORM'
  const [step, setStep] = useState('TYPE')
  const [type, setType] = useState(null) // 'VISITOR' or 'MEMBER'
  const [arkCenters, setArkCenters] = useState([])
  const [checkPhone, setCheckPhone] = useState('')
  const [checkEmail, setCheckEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState('')
  const [existingRecord, setExistingRecord] = useState(null) // lookup result when found
  const [form, setForm] = useState({
    firstName: '', lastName: '', middleName: '', email: '', phone: '',
    gender: 'MALE', dateOfBirth: '', address: '', city: '', state: '', country: 'Nigeria',
    fellowship: 'DESTINY_TREASURES', department: 'NONE', arkCenterId: '',
    notes: ''
  })
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (slug) {
      fetch(`/api/admin/ark-centers?slug=${slug}`)
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setArkCenters(data) : setArkCenters([]))
        .catch(() => setArkCenters([]))
    }
  }, [slug])

  const handleTypeSelect = (selectedType) => {
    setType(selectedType)
    setStep('CHECK')
    setCheckError('')
    setExistingRecord(null)
  }

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!checkPhone && !checkEmail) {
      setCheckError('Please enter at least your phone number or email.')
      return
    }
    setChecking(true)
    setCheckError('')
    try {
      const res = await fetch('/api/member/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: checkPhone || undefined, email: checkEmail || undefined })
      })
      const data = await res.json()

      if (data.exists) {
        // First-timer choosing MEMBER → skip FOUND screen, go straight to form
        if (data.type === 'FIRST_TIMER' && type === 'MEMBER' && !data.data.convertedToMember) {
          setForm(f => ({ ...f, phone: checkPhone, email: checkEmail }))
          setStep('FORM')
        } else {
          setExistingRecord(data)
          setStep('FOUND')
        }
      } else {
        // Pre-fill form with what they entered
        setForm(f => ({ ...f, phone: checkPhone, email: checkEmail }))
        setStep('FORM')
      }
    } catch {
      setCheckError('Could not check your details. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch(`/api/assemblies/${slug}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type }),
    })

    if (res.ok) {
      setStatus('success')
    } else {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <div className="card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--purple-100)' }}>
            <Check size={30} style={{ color: 'var(--purple-700)' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Registration Successful!
          </h1>
          <p className="text-gray-500 text-sm">
            {type === 'VISITOR' 
              ? "Welcome! We're so glad you joined us today. We'll be in touch soon."
              : "Welcome to the family! We're excited to have you as a member of this assembly."}
          </p>
          <button onClick={() => router.push(`/${slug}`)} className="btn-primary mt-8 w-full justify-center">
            Return to Assembly Page
          </button>
        </div>
      </div>
    )
  }

  // Step: TYPE selection
  if (step === 'TYPE') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <BackButton className="fixed top-8 left-8 z-50" variant="outline" />
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              Welcome to Our Assembly
            </h1>
            <p className="text-gray-600">Please choose how you'd like to register today</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <button onClick={() => handleTypeSelect('VISITOR')} className="card p-8 text-left hover:border-purple-500 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <UserPlus size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">First Timer / Visitor</h3>
              <p className="text-sm text-gray-500">I'm visiting for the first time or just checking things out. I'd like to be followed up with.</p>
            </button>
            <button onClick={() => handleTypeSelect('MEMBER')} className="card p-8 text-left hover:border-gold-500 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center mb-6 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Regular / New Member</h3>
              <p className="text-sm text-gray-500">I attend regularly or want to officially join this assembly as a member.</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step: CHECK — phone/email pre-check
  if (step === 'CHECK') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <BackButton onClick={() => setStep('TYPE')} className="fixed top-8 left-8 z-50" variant="outline" />
        <div className="card p-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--purple-100)' }}>
              <Search size={26} style={{ color: 'var(--purple-700)' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
              Quick Check
            </h2>
            <p className="text-sm text-gray-500">
              Enter your contact details so we can check if you're already in our system.
              You may fill one or both fields.
            </p>
          </div>
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                type="tel"
                placeholder="e.g. 08012345678"
                value={checkPhone}
                onChange={e => setCheckPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="e.g. john@example.com"
                value={checkEmail}
                onChange={e => setCheckEmail(e.target.value)}
              />
            </div>
            {checkError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} /> {checkError}
              </div>
            )}
            <button type="submit" disabled={checking} className="btn-primary w-full justify-center">
              {checking ? 'Checking...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Step: FOUND — existing record
  if (step === 'FOUND' && existingRecord) {
    const isMember = existingRecord.type === 'MEMBER'
    const isFirstTimer = existingRecord.type === 'FIRST_TIMER'
    const choosingMember = type === 'MEMBER'

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <BackButton onClick={() => setStep('CHECK')} className="fixed top-8 left-8 z-50" variant="outline" />
        <div className="card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: isMember ? 'var(--gold-100)' : 'var(--purple-100)' }}>
            {isMember ? <Users size={28} style={{ color: 'var(--gold-600)' }} /> : <UserPlus size={28} style={{ color: 'var(--purple-700)' }} />}
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Welcome back, {existingRecord.data.name}!
          </h2>

          {isMember && (
            <>
              <p className="text-sm text-gray-500 mb-6">
                You're already registered as a member. Visit your Member Portal to access your growth track and training materials.
              </p>
              <button onClick={() => router.push('/member/register')} className="btn-primary w-full justify-center mb-3">
                Go to Member Portal
              </button>
              <button onClick={() => router.push(`/${slug}`)} className="btn-outline w-full justify-center">
                Back to Assembly
              </button>
            </>
          )}

          {isFirstTimer && (
            <>
              {existingRecord.data.convertedToMember ? (
                <>
                  <p className="text-sm text-gray-500 mb-6">You've already completed member registration.</p>
                  <button onClick={() => router.push('/member/register')} className="btn-primary w-full justify-center">
                    Go to Member Portal
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-2">
                    You're registered as a first-time visitor (registered {new Date(existingRecord.data.registeredAt).toLocaleDateString()}).
                  </p>
                  {choosingMember ? (
                    <p className="text-sm text-gray-500 mb-6">Complete the form below to become a full member.</p>
                  ) : (
                    <p className="text-sm text-gray-500 mb-6">We'll continue following up with you. No further action needed.</p>
                  )}
                  {choosingMember ? (
                    <button onClick={() => { setForm(f => ({ ...f, phone: checkPhone, email: checkEmail })); setStep('FORM') }}
                            className="btn-primary w-full justify-center mb-3">
                      Complete Member Registration
                    </button>
                  ) : (
                    <button onClick={() => router.push(`/${slug}`)} className="btn-outline w-full justify-center">
                      Back to Assembly
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Step: FORM — full registration form
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
      <BackButton onClick={() => setStep('CHECK')} className="fixed top-8 left-8 z-50" variant="outline" />
      <div className="card p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            {type === 'VISITOR' ? 'Visitor Registration' : 'Member Registration'}
          </h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{slug?.replace(/-/g, ' ')} Assembly</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
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
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required={type === 'VISITOR'}
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

          {type === 'MEMBER' && (
            <>
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
                  <label className="form-label">Department *</label>
                  <select
                    className="form-select"
                    value={form.department}
                    onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                  >
                    <option value="NONE">None (Show Interest)</option>
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
                <label className="form-label">Ark Center (House Fellowship)</label>
                <select
                  className="form-select"
                  value={form.arkCenterId}
                  onChange={(e) => setForm(f => ({ ...f, arkCenterId: e.target.value }))}
                >
                  <option value="">None / Not Sure</option>
                  {arkCenters.map(center => (
                    <option key={center.id} value={center.id}>{center.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="form-label">
              {type === 'VISITOR' ? 'Anything you want us to know?' : 'Notes (optional)'}
            </label>
            <textarea
              className="form-input"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {status === 'error' && (
            <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary w-full justify-center mt-4"
          >
            {status === 'loading' ? 'Processing...' : `Register as ${type === 'VISITOR' ? 'Visitor' : 'Member'}`}
          </button>
        </form>
      </div>
    </div>
  )
}
