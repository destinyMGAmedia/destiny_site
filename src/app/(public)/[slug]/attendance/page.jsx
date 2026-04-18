'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Check } from 'lucide-react'
<<<<<<< HEAD
import BackButton from '@/components/ui/BackButton'
=======
>>>>>>> origin/main

const SERVICE_TYPES = [
  'Sunday Service',
  'Wednesday Bible Study',
  'Friday Youth Night',
  'Special Service',
  'Other',
]

export default function AttendancePage() {
  const { slug } = useParams()
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    serviceType: 'Sunday Service',
    serviceDate: new Date().toISOString().split('T')[0],
  })
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch(`/api/assemblies/${slug}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setStatus(res.ok ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <div className="card p-10 max-w-sm w-full text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--purple-100)' }}
          >
            <Check size={30} style={{ color: 'var(--purple-700)' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Attendance Recorded!
          </h1>
          <p className="text-gray-500 text-sm">
            Thank you for being here. God bless you!
          </p>
          <button onClick={() => setStatus('idle')} className="btn-outline btn-sm mt-6">
            Submit Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
<<<<<<< HEAD
      <BackButton className="fixed top-8 left-8 z-50" variant="outline" />
=======
>>>>>>> origin/main
      <div className="card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
          >
            Attendance Form
          </h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{slug?.replace(/-/g, ' ')} Assembly</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              required
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+234..."
            />
          </div>
          <div>
            <label className="form-label">Email (optional)</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">Service *</label>
            <select
              className="form-select"
              value={form.serviceType}
              onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
            >
              {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={form.serviceDate}
              onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))}
            />
          </div>

          {status === 'error' && (
            <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary w-full justify-center mt-2"
          >
            {status === 'loading' ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </form>
      </div>
    </div>
  )
}
