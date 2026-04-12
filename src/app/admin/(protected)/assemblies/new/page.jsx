'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function NewAssemblyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [credentials, setCredentials] = useState(null) // shown after creation
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({
    name: '', slug: '', city: '', country: 'Nigeria',
    address: '', phone: '', email: '', whatsapp: '', tagline: '',
    assemblyAdminName: '', assemblyAdminEmail: '',
    appAdminName: '', appAdminEmail: '',
  })

  const set = (k) => (e) => {
    const val = e.target.value
    setForm((f) => {
      const next = { ...f, [k]: val }
      // Auto-generate slug from name
      if (k === 'name') {
        next.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/assemblies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create assembly')
      setCredentials(data.credentials)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyAll = () => {
    if (!credentials) return
    let text = `DMGA Admin Credentials — ${form.name}\n\n`
    text += `ASSEMBLY ADMIN\nName: ${credentials.assemblyAdmin.name}\nEmail: ${credentials.assemblyAdmin.email}\nPassword: ${credentials.assemblyAdmin.password}\n`
    if (credentials.appAdmin) {
      text += `\nAPP ADMIN (Content)\nName: ${credentials.appAdmin.name}\nEmail: ${credentials.appAdmin.email}\nPassword: ${credentials.appAdmin.password}\n`
    }
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // ── Credentials reveal modal ─────────────────────────────────
  if (credentials) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--purple-50)' }}>
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
              Assembly Created!
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Copy and send these credentials to the admins. They will not be shown again.
            </p>
          </div>

          <CredentialBlock title="Assembly Admin" cred={credentials.assemblyAdmin} />
          {credentials.appAdmin && (
            <CredentialBlock title="App Admin (Content Only)" cred={credentials.appAdmin} className="mt-4" />
          )}

          <button
            onClick={copyAll}
            className="w-full mt-6 btn-primary justify-center"
          >
            {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy All Credentials</>}
          </button>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => router.push('/admin/assemblies/' + form.slug)}
              className="flex-1 btn-outline justify-center"
            >
              Go to Assembly
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex-1 btn-outline justify-center"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ─────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          New Assembly
        </h1>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Assembly Details */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4">Assembly Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Assembly Name *</label>
              <input className="form-input" value={form.name} onChange={set('name')} required placeholder="e.g. Lagos Assembly" />
            </div>
            <div>
              <label className="form-label">URL Slug *</label>
              <input className="form-input font-mono text-sm" value={form.slug} onChange={set('slug')} required placeholder="lagos-assembly" />
              <p className="text-xs text-gray-400 mt-1">Site URL: /{form.slug || 'slug'}</p>
            </div>
            <div>
              <label className="form-label">Country *</label>
              <input className="form-input" value={form.country} onChange={set('country')} required />
            </div>
            <div>
              <label className="form-label">City *</label>
              <input className="form-input" value={form.city} onChange={set('city')} required placeholder="Lagos" />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+234..." />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="lagos@destinymissions.org" />
            </div>
            <div>
              <label className="form-label">WhatsApp</label>
              <input className="form-input" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+234..." />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={set('address')} placeholder="Street address" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Tagline</label>
              <input className="form-input" value={form.tagline} onChange={set('tagline')} placeholder="A short tagline for this assembly" />
            </div>
          </div>
        </div>

        {/* Assembly Admin */}
        <div className="card p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'var(--purple-100)', color: 'var(--purple-800)' }}>A</div>
            <div>
              <h2 className="font-bold text-gray-900">Assembly Admin</h2>
              <p className="text-xs text-gray-500">Full access — members, attendance, finance, content</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.assemblyAdminName} onChange={set('assemblyAdminName')} required placeholder="Pastor John Doe" />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.assemblyAdminEmail} onChange={set('assemblyAdminEmail')} required placeholder="john@example.com" />
            </div>
          </div>
        </div>

        {/* App Admin */}
        <div className="card p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#e8f5e9', color: '#2e7d32' }}>C</div>
            <div>
              <h2 className="font-bold text-gray-900">App Admin <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
              <p className="text-xs text-gray-500">Content-only access — updates page sections</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.appAdminName} onChange={set('appAdminName')} placeholder="Content Manager" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.appAdminEmail} onChange={set('appAdminEmail')} placeholder="content@example.com" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
          {loading ? 'Creating Assembly...' : 'Create Assembly'}
        </button>
      </form>
    </div>
  )
}

function CredentialBlock({ title, cred, className = '' }) {
  const [show, setShow] = useState(false)
  return (
    <div className={`rounded-xl border p-4 ${className}`} style={{ borderColor: 'var(--border)', background: 'var(--ivory)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold-600)' }}>{title}</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Name</span>
          <span className="font-semibold text-gray-900">{cred.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Email</span>
          <span className="font-mono text-gray-900">{cred.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Password</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-900">{show ? cred.password : '••••••••••'}</span>
            <button onClick={() => setShow(v => !v)} className="text-gray-400 hover:text-gray-700">
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
