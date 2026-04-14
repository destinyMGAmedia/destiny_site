'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, UserPlus, Users } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

export default function JoinPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [type, setType] = useState(null) // 'VISITOR' or 'MEMBER'
  const [arkCenters, setArkCenters] = useState([])
  const [form, setForm] = useState({
    firstName: '', lastName: '', middleName: '', email: '', phone: '',
    gender: 'MALE', dateOfBirth: '', address: '', city: '', state: '', country: 'Nigeria',
    fellowship: 'DESTINY_TREASURES', department: 'NONE', arkCenterId: '',
    notes: ''
  })
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (slug) {
      fetch(`/api/sections?slug=${slug}`)
        .then(res => res.json())
        .then(data => {
            // Find assembly ID from sections if possible, or just use slug in API
        })
      
      // Fetch ark centers for this assembly
      fetch(`/api/admin/ark-centers?slug=${slug}`) // I might need to adjust this API
        .then(res => res.json())
        .then(data => setArkCenters(data))
    }
  }, [slug])

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

  if (!type) {
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
            <button
              onClick={() => setType('VISITOR')}
              className="card p-8 text-left hover:border-purple-500 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <UserPlus size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">First Timer / Visitor</h3>
              <p className="text-sm text-gray-500">I'm visiting for the first time or just checking things out. I'd like to be followed up with.</p>
            </button>

            <button
              onClick={() => setType('MEMBER')}
              className="card p-8 text-left hover:border-gold-500 transition-colors group"
            >
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
      <BackButton onClick={() => setType(null)} className="fixed top-8 left-8 z-50" variant="outline" />
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
