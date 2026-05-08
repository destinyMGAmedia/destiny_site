'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserPlus, AlertCircle, Check } from 'lucide-react'

const GROWTH_LEVELS = [
  { value: 'NEW_COMER', label: 'New Comer' },
  { value: 'FOUNDATIONAL_CLASS', label: 'Foundational Class' },
  { value: 'DESTINY_CULTURE', label: 'Destiny Culture' },
  { value: 'MINISTRY_CLASS', label: 'Ministry Class' },
  { value: 'LEADERSHIP_CLASS', label: 'Leadership Class' },
  { value: 'PASTORAL_CLASS', label: 'Pastoral Class' },
  { value: 'ADVANCED_LEADERSHIP_2', label: 'Advanced Leadership II' },
  { value: 'ADVANCED_LEADERSHIP_3', label: 'Advanced Leadership III' },
]

const FELLOWSHIPS = [
  { value: 'KINGS_MEN', label: "King's Men (Men)" },
  { value: 'DESTINY_PRESERVERS', label: 'Destiny Preservers (Women)' },
  { value: 'DESTINY_DEFENDERS', label: 'Destiny Defenders (Youth)' },
  { value: 'DESTINY_TREASURES', label: 'Destiny Treasures (Children)' },
]

const DEPARTMENTS = [
  { value: 'NONE', label: 'None / Show Interest' },
  { value: 'PASTORS', label: 'Pastors' },
  { value: 'CHOIR', label: 'Choir' },
  { value: 'SANCTUARY_KEEPERS', label: 'Sanctuary Keepers' },
  { value: 'PROTOCOL', label: 'Protocol' },
  { value: 'MEDIA_TECHNICAL', label: 'Media & Technical' },
  { value: 'CREATIVE_ARTS', label: 'Creative Arts' },
  { value: 'FACILITY', label: 'Facility' },
  { value: 'EVANGELISM', label: 'Evangelism' },
  { value: 'PRAYER', label: 'Prayer' },
]

export default function NewMemberPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [assemblies, setAssemblies] = useState([])
  const [arkCenters, setArkCenters] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteWarning, setShowDeleteWarning] = useState(false)

  const firstTimerId = searchParams.get('firstTimerId') || ''
  const isConversion = !!firstTimerId

  const urlAssemblyId = searchParams.get('assemblyId') || ''

  const [form, setForm] = useState({
    firstName: searchParams.get('firstName') || '',
    lastName: searchParams.get('lastName') || '',
    middleName: '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    gender: 'MALE',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    fellowship: '',
    department: 'NONE',
    // Conversions start at FOUNDATIONAL_CLASS (first growth stage)
    growthLevel: isConversion ? 'FOUNDATIONAL_CLASS' : 'NEW_COMER',
    arkCenterId: '',
    baptismDate: '',
    emergencyName: '',
    emergencyPhone: '',
    notes: '',
    assemblyId: urlAssemblyId || session?.user?.assemblyId || '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/admin/login'); return }
    if (!session) return

    const isGlobal = ['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)
    if (isGlobal) {
      fetch('/api/admin/assemblies')
        .then(r => r.json())
        .then(data => {
          const list = Array.isArray(data) ? data : data.assemblies || []
          setAssemblies(list)
          // If assembly came from URL (first timer conversion), pre-select it
          if (urlAssemblyId && !form.assemblyId) {
            setForm(f => ({ ...f, assemblyId: urlAssemblyId }))
          }
        })
        .catch(() => {})
    } else {
      const resolvedId = session.user.assemblyId || urlAssemblyId
      if (resolvedId) {
        setForm(f => ({ ...f, assemblyId: resolvedId }))
        const slug = session.user.assemblySlug
        if (slug) {
          fetch(`/api/admin/assemblies/${slug}/ark-centers`)
            .then(r => r.json())
            .then(data => setArkCenters(Array.isArray(data) ? data : []))
            .catch(() => {})
        }
      }
    }
  }, [status, session])

  useEffect(() => {
    if (form.assemblyId && assemblies.length > 0) {
      const asm = assemblies.find(a => a.id === form.assemblyId)
      if (asm?.slug) {
        fetch(`/api/admin/assemblies/${asm.slug}/ark-centers`)
          .then(r => r.json())
          .then(data => setArkCenters(Array.isArray(data) ? data : []))
          .catch(() => {})
      }
    }
  }, [form.assemblyId, assemblies])

  const isGlobal = ['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session?.user?.role)
  const isAssemblyAdmin = session?.user?.role === 'ASSEMBLY_ADMIN'

  const doSubmit = async () => {
    if (!form.assemblyId) { setError('Please select an assembly.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, firstTimerId: firstTimerId || undefined })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create member'); return }
      router.push('/admin/members')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isAssemblyAdmin) {
      setShowDeleteWarning(true)
    } else {
      doSubmit()
    }
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center p-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-900" /></div>
  }

  return (
    <div className="space-y-8 fade-in p-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          {isConversion ? 'Convert First Timer to Member' : 'Add New Member'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isConversion
            ? 'Complete the registration details to convert this visitor to a church member.'
            : 'Register a new church member.'}
        </p>
      </div>

      {isConversion && (
        <div className="card p-4 border-l-4 flex items-start gap-3" style={{ borderLeftColor: 'var(--gold-500)' }}>
          <Check size={18} style={{ color: 'var(--gold-500)', marginTop: 2 }} />
          <p className="text-sm text-gray-600">
            This member will be linked to their first-timer record and marked as converted.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Assembly selection (global admins only) */}
        {isGlobal && (
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4">Assembly</h3>
            <div>
              <label className="form-label">Assembly *</label>
              <select className="form-select" value={form.assemblyId}
                onChange={e => setForm(f => ({ ...f, assemblyId: e.target.value, arkCenterId: '' }))} required>
                <option value="">Select assembly...</option>
                {assemblies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Personal Info */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Personal Information</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">First Name *</label>
              <input className="form-input" value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Last Name *</label>
              <input className="form-input" value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Middle Name</label>
              <input className="form-input" value={form.middleName}
                onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Gender *</label>
              <select className="form-select" value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} required>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" value={form.dateOfBirth}
                onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">City</label>
              <input className="form-input" value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">State</label>
              <input className="form-input" value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Church Info */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Church Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Fellowship</label>
              <select className="form-select" value={form.fellowship}
                onChange={e => setForm(f => ({ ...f, fellowship: e.target.value }))}>
                <option value="">Select fellowship...</option>
                {FELLOWSHIPS.map(fw => <option key={fw.value} value={fw.value}>{fw.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Department</label>
              <select className="form-select" value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Growth Level</label>
              <select className="form-select" value={form.growthLevel}
                onChange={e => setForm(f => ({ ...f, growthLevel: e.target.value }))}>
                {GROWTH_LEVELS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Ark Center</label>
              <select className="form-select" value={form.arkCenterId}
                onChange={e => setForm(f => ({ ...f, arkCenterId: e.target.value }))}>
                <option value="">None / Not Sure</option>
                {arkCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Baptism Date</label>
              <input className="form-input" type="date" value={form.baptismDate}
                onChange={e => setForm(f => ({ ...f, baptismDate: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Emergency Contact</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Name</label>
              <input className="form-input" value={form.emergencyName}
                onChange={e => setForm(f => ({ ...f, emergencyName: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" value={form.emergencyPhone}
                onChange={e => setForm(f => ({ ...f, emergencyPhone: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-6">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-input" rows={3} value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving}
            className="btn-primary flex items-center gap-2">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> : <UserPlus size={18} />}
            {saving ? 'Saving...' : isConversion ? 'Convert to Member' : 'Add Member'}
          </button>
          <button type="button" onClick={() => router.push('/admin/members')}
            className="btn-outline">
            Cancel
          </button>
        </div>
      </form>

      {/* Delete-permission warning for Assembly Admins */}
      {showDeleteWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle size={22} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Important Notice</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Once submitted, you will <span className="font-semibold text-gray-800">not be able to delete</span> this record.
                  Only a <span className="font-semibold text-gray-800">Global Admin</span> can delete member records.
                  Do you want to continue?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteWarning(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowDeleteWarning(false); doSubmit() }}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> : null}
                {saving ? 'Saving...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
