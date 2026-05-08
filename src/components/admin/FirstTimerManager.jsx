'use client'
import { useState } from 'react'
import { UserPlus, Phone, Mail, Calendar, CheckCircle, UserCheck, Search, Trash2, Pencil, X } from 'lucide-react'

export default function FirstTimerManager({ firstTimers: initialData, assemblyId, canEdit, canDelete }) {
  const [firstTimers, setFirstTimers] = useState(initialData)
  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [updating, setUpdating] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [editingFT, setEditingFT] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const openEdit = (ft) => {
    setEditingFT(ft)
    setEditForm({
      firstName: ft.firstName || '',
      lastName: ft.lastName || '',
      middleName: ft.middleName || '',
      email: ft.email || '',
      phone: ft.phone || '',
      address: ft.address || '',
      howDidYouHear: ft.howDidYouHear || '',
      notes: ft.notes || '',
      followedUp: ft.followedUp ?? false,
      isConverted: ft.isConverted ?? false,
      wantsFollowUp: ft.wantsFollowUp ?? true,
    })
    setEditError('')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingFT) return
    setEditSaving(true)
    setEditError('')
    try {
      const res = await fetch(`/api/admin/first-timers/${editingFT.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const updated = await res.json()
        setFirstTimers(prev => prev.map(ft => ft.id === editingFT.id ? { ...ft, ...updated } : ft))
        setEditingFT(null)
      } else {
        const data = await res.json()
        setEditError(data.error || 'Failed to save changes')
      }
    } catch {
      setEditError('An error occurred. Please try again.')
    } finally {
      setEditSaving(false)
    }
  }

  const handleFollowUp = async (id) => {
    if (!canEdit) return
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/first-timers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followedUp: true })
      })
      if (res.ok) {
        setFirstTimers(prev => prev.map(ft => ft.id === id ? { ...ft, followedUp: true } : ft))
      }
    } catch (error) {
      console.error('Failed to update follow-up status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleConvertToMember = (firstTimer) => {
    if (!canEdit) return
    const params = new URLSearchParams({
      firstName: firstTimer.firstName,
      lastName: firstTimer.lastName,
      email: firstTimer.email || '',
      phone: firstTimer.phone || '',
      firstTimerId: firstTimer.id,
      assemblyId: firstTimer.assemblyId || '',
    })
    window.location.href = `/admin/members/new?${params.toString()}`
  }

  const handleDelete = async (id) => {
    if (!canDelete) return
    if (!confirm('Permanently delete this first timer record? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/first-timers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setFirstTimers(prev => prev.filter(ft => ft.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete')
      }
    } catch {
      alert('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const filteredFirstTimers = firstTimers.filter(ft => {
    if (filter === 'PENDING' && (ft.followedUp || ft.convertedToMember)) return false
    if (filter === 'FOLLOWED_UP' && !ft.followedUp) return false
    if (filter === 'CONVERTED' && !ft.convertedToMember) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const fullName = `${ft.firstName} ${ft.lastName}`.toLowerCase()
      if (!fullName.includes(search) && !(ft.email || '').toLowerCase().includes(search) && !(ft.phone || '').toLowerCase().includes(search)) return false
    }
    return true
  })

  const stats = {
    total: firstTimers.length,
    pending: firstTimers.filter(ft => !ft.followedUp && !ft.convertedToMember).length,
    followedUp: firstTimers.filter(ft => ft.followedUp).length,
    converted: firstTimers.filter(ft => ft.convertedToMember).length
  }

  const ef = (field) => (e) => setEditForm(prev => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total First Timers</p><p className="text-2xl font-bold mt-1">{stats.total}</p></div>
            <UserPlus className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Pending Follow-up</p><p className="text-2xl font-bold mt-1">{stats.pending}</p></div>
            <Calendar className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Followed Up</p><p className="text-2xl font-bold mt-1">{stats.followedUp}</p></div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Converted to Members</p><p className="text-2xl font-bold mt-1">{stats.converted}</p></div>
            <UserCheck className="text-gold-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input className="form-input pl-10" placeholder="Search by name, email, or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['ALL','All','bg-purple-600'],['PENDING','Pending','bg-orange-500'],['FOLLOWED_UP','Followed Up','bg-green-500'],['CONVERTED','Converted','bg-yellow-500']].map(([val, label, active]) => (
              <button key={val} onClick={() => setFilter(val)} className={`px-4 py-2 rounded-lg transition-colors text-sm ${filter === val ? `${active} text-white` : 'bg-gray-100 hover:bg-gray-200'}`}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date Registered</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">How They Heard</th>
                {(canEdit || canDelete) && (
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFirstTimers.length === 0 ? (
                <tr><td colSpan={(canEdit || canDelete) ? 6 : 5} className="px-6 py-12 text-center text-gray-500">No first timers found</td></tr>
              ) : filteredFirstTimers.map((firstTimer) => (
                <tr key={firstTimer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{firstTimer.firstName} {firstTimer.lastName}</p>
                      {firstTimer.assembly && <p className="text-xs text-gray-500">{firstTimer.assembly.name}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {firstTimer.email && <div className="flex items-center gap-1 text-sm text-gray-600"><Mail size={14} />{firstTimer.email}</div>}
                      {firstTimer.phone && <div className="flex items-center gap-1 text-sm text-gray-600"><Phone size={14} />{firstTimer.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(firstTimer.registeredAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {firstTimer.convertedToMember ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><UserCheck size={12} className="mr-1" />Member</span>
                    ) : firstTimer.followedUp ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" />Followed Up</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Pending</span>
                    )}
                    {firstTimer.isConverted && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Gave Life to Christ</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{firstTimer.howDidYouHear || 'Not specified'}</td>
                  {(canEdit || canDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <button onClick={() => openEdit(firstTimer)} className="text-blue-600 hover:text-blue-900" title="Edit record">
                            <Pencil size={16} />
                          </button>
                        )}
                        {canEdit && !firstTimer.followedUp && (
                          <button onClick={() => handleFollowUp(firstTimer.id)} disabled={updating === firstTimer.id} className="text-green-600 hover:text-green-900 disabled:opacity-50 text-xs">
                            {updating === firstTimer.id ? 'Updating...' : 'Mark Followed Up'}
                          </button>
                        )}
                        {canEdit && !firstTimer.convertedToMember && (
                          <button onClick={() => handleConvertToMember(firstTimer)} className="text-purple-600 hover:text-purple-900 text-xs">
                            Convert to Member
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(firstTimer.id)} disabled={deleting === firstTimer.id} className="text-red-500 hover:text-red-700 disabled:opacity-50" title="Delete record">
                            {deleting === firstTimer.id ? '...' : <Trash2 size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit First Timer</h2>
              <button onClick={() => setEditingFT(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <input className="form-input" value={editForm.firstName} onChange={ef('firstName')} required />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input className="form-input" value={editForm.lastName} onChange={ef('lastName')} required />
                </div>
                <div>
                  <label className="form-label">Middle Name</label>
                  <input className="form-input" value={editForm.middleName} onChange={ef('middleName')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={editForm.email} onChange={ef('email')} />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" value={editForm.phone} onChange={ef('phone')} />
                </div>
              </div>

              <div>
                <label className="form-label">Address</label>
                <input className="form-input" value={editForm.address} onChange={ef('address')} />
              </div>

              <div>
                <label className="form-label">How Did They Hear About Us?</label>
                <input className="form-input" value={editForm.howDidYouHear} onChange={ef('howDidYouHear')} />
              </div>

              <div>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} value={editForm.notes} onChange={ef('notes')} />
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={editForm.followedUp} onChange={ef('followedUp')} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-700">Followed Up</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={editForm.isConverted} onChange={ef('isConverted')} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-700">Gave Life to Christ</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={editForm.wantsFollowUp} onChange={ef('wantsFollowUp')} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-700">Wants Follow-up</span>
                </label>
              </div>

              {editError && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{editError}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingFT(null)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={editSaving} className="btn-primary flex items-center gap-2">
                  {editSaving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> : null}
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
