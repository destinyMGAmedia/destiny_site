'use client'
import { useState } from 'react'
import Image from 'next/image'
import SectionWrapper from './SectionWrapper'
import { Send, Check, X } from 'lucide-react'

function TestimonyCard({ testimony }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {testimony.image ? (
            <Image src={testimony.image} alt={testimony.name} fill sizes="48px" className="object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-bold text-white"
              style={{ background: 'var(--purple-700)' }}
            >
              {testimony.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900">{testimony.name}</p>
          <p className="text-xs" style={{ color: 'var(--gold-500)' }}>{testimony.title}</p>
        </div>
      </div>
      <p className={`text-sm text-gray-600 leading-relaxed ${!expanded ? 'line-clamp-4' : ''}`}>
        {testimony.content}
      </p>
      {testimony.content.length > 200 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold mt-2"
          style={{ color: 'var(--purple-700)' }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

export default function TestimoniesSection({ testimonies, assemblySlug, section }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', title: '', content: '' })
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch(`/api/assemblies/${assemblySlug}/testimonies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to submit')
      setStatus('success')
      setForm({ name: '', title: '', content: '' })
    } catch {
      setStatus('error')
    }
  }

  const shareButton = (
    <button
      onClick={() => setShowForm((v) => !v)}
      className="btn-primary btn-sm mt-1"
    >
      {showForm ? <X size={13} /> : <Send size={13} />}
      {showForm ? 'Close' : 'Share Yours'}
    </button>
  )

  return (
    <SectionWrapper
      id="testimonies"
      bgClass="section-white"
      section={section}
      defaultLabel="Testimonies"
      defaultTitle="What God Has Done"
      headerRight={shareButton}
    >

        {/* Submission form */}
        {showForm && (
          <div className="card p-6 mb-8" style={{ borderLeft: '4px solid var(--gold-500)' }}>
            {status === 'success' ? (
              <div className="text-center py-4">
                <Check size={32} className="mx-auto mb-2" style={{ color: 'var(--purple-700)' }} />
                <p className="font-semibold">Testimony submitted!</p>
                <p className="text-sm text-gray-500 mt-1">It will appear after admin review.</p>
                <button onClick={() => { setStatus('idle'); setShowForm(false) }} className="btn-outline btn-sm mt-3">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold" style={{ color: 'var(--purple-900)' }}>Share Your Testimony</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Your Name *</label>
                    <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label">Testimony Title *</label>
                    <input className="form-input" placeholder="e.g. Miraculous Healing" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Your Testimony *</label>
                  <textarea className="form-textarea" rows={5} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required placeholder="Share what God has done for you..." />
                </div>
                {status === 'error' && <p className="text-red-500 text-sm">Failed to submit. Please try again.</p>}
                <button type="submit" disabled={status === 'loading'} className="btn-primary">
                  {status === 'loading' ? 'Submitting...' : 'Submit Testimony'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Testimonies grid */}
        {testimonies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonies.map((t) => (
              <TestimonyCard key={t.id} testimony={t} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">Be the first to share a testimony at this assembly!</p>
          </div>
        )}
    </SectionWrapper>
  )
}
