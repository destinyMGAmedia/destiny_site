'use client'
import { useState, useEffect } from 'react'
import { RefreshCw, Eye, EyeOff, Copy, Check, Search } from 'lucide-react'

const ROLE_LABELS = {
  SUPER_ADMIN: { label: 'Super Admin', color: '#7b1fa2', bg: '#f3e5f5' },
  GLOBAL_ADMIN: { label: 'Global Admin', color: 'var(--purple-800)', bg: 'var(--purple-50)' },
  ASSEMBLY_ADMIN: { label: 'Assembly Admin', color: '#1565c0', bg: '#e3f2fd' },
  APP_ADMIN: { label: 'App Admin', color: '#2e7d32', bg: '#e8f5e9' },
}

function CredentialModal({ admin, onClose }) {
  const [loading, setLoading] = useState(false)
  const [cred, setCred] = useState(null)
  const [error, setError] = useState(null)
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  const regenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}/regenerate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCred(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (!cred) return
    navigator.clipboard.writeText(
      `Name: ${cred.name}\nEmail: ${cred.email}\nPassword: ${cred.password}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Regenerate Credentials
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          For <strong>{admin.name}</strong> ({admin.email}).<br />
          A new password will be generated — the old one stops working immediately.
        </p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {!cred ? (
          <button
            onClick={regenerate}
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Generating...' : 'Generate New Password'}
          </button>
        ) : (
          <div>
            <div className="rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--border)', background: 'var(--ivory)' }}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-mono text-gray-900">{cred.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">New Password</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">{show ? cred.password : '••••••••••'}</span>
                    <button onClick={() => setShow(v => !v)} className="text-gray-400 hover:text-gray-700">
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={copy} className="btn-primary w-full justify-center mb-3">
              {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Credentials</>}
            </button>
          </div>
        )}

        <button onClick={onClose} className="btn-outline w-full justify-center mt-2">
          Close
        </button>
      </div>
    </div>
  )
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch('/api/admin/admins')
      .then(r => r.json())
      .then(data => { setAdmins(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = admins.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.assembly?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Admin Credentials
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and regenerate credentials for all assembly admins</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="form-input pl-9"
          placeholder="Search by name, email or assembly..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--ivory)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Assembly</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Last Login</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filtered.map(admin => {
                  const roleStyle = ROLE_LABELS[admin.role] || {}
                  const isSuperAdmin = admin.role === 'SUPER_ADMIN'
                  return (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{admin.name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{admin.email}</td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                        {admin.assembly?.name || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="pill text-xs"
                          style={{ background: roleStyle.bg, color: roleStyle.color }}
                        >
                          {roleStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                        {admin.lastLogin
                          ? new Date(admin.lastLogin).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        {!isSuperAdmin && (
                          <button
                            onClick={() => setSelected(admin)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                            style={{ color: 'var(--purple-700)', background: 'var(--purple-50)' }}
                          >
                            <RefreshCw size={12} /> Regenerate
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No admins found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <CredentialModal
          admin={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
