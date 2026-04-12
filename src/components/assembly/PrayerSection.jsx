'use client'
import { useState } from 'react'
import SectionWrapper from './SectionWrapper'
import { Send, Check } from 'lucide-react'

export default function PrayerSection({ assemblySlug, section }) {
  const [form, setForm] = useState({ name: '', email: '', request: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    try {
      const res = await fetch(`/api/assemblies/${assemblySlug}/prayer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setStatus('success')
      setForm({ name: '', email: '', request: '' })
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <SectionWrapper
      id="prayer"
      bgClass="section-lavender"
      section={section}
      defaultLabel="Prayer"
      defaultTitle="Prayer Requests"
      defaultSubtitle="Share your need with us — our prayer team will intercede for you"
      centered
    >
        <div className="max-w-2xl mx-auto">

          {status === 'success' ? (
            <div
              className="mt-8 p-6 rounded-2xl text-center"
              style={{ background: 'var(--surface)' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--purple-100)' }}
              >
                <Check size={28} style={{ color: 'var(--purple-700)' }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--purple-900)' }}>
                Prayer Request Received
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Our prayer team will intercede on your behalf. God bless you.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="btn-outline btn-sm"
              >
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 card p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Your Name *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="form-label">Email (optional)</label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="For follow-up (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Your Prayer Request *</label>
                <textarea
                  className="form-textarea"
                  value={form.request}
                  onChange={(e) => setForm((f) => ({ ...f, request: e.target.value }))}
                  required
                  placeholder="Share your prayer need with us..."
                  rows={5}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full justify-center"
              >
                <Send size={15} />
                {status === 'loading' ? 'Submitting...' : 'Submit Prayer Request'}
              </button>
            </form>
          )}
        </div>
    </SectionWrapper>
  )
}
