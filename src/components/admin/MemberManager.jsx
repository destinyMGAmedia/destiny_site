'use client'
import { useState } from 'react'
import { Users, Award, TrendingUp, Search, BookOpen, CheckCircle, Trash2, Pencil, X } from 'lucide-react'

const FELLOWSHIPS = [
  { value: '', label: 'None / Not Assigned' },
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

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'TRANSFERRED', label: 'Transferred' },
]

export default function MemberManager({ members: initialData, growthStages, assemblyId, canEdit, canDelete }) {
  const [members, setMembers] = useState(initialData)
  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const openEdit = (member) => {
    setEditingMember(member)
    setEditForm({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      middleName: member.middleName || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      city: member.city || '',
      state: member.state || '',
      gender: member.gender || 'MALE',
      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
      fellowship: member.fellowship || '',
      department: member.department || 'NONE',
      status: member.status || 'ACTIVE',
      notes: member.notes || '',
      emergencyName: member.emergencyName || '',
      emergencyPhone: member.emergencyPhone || '',
    })
    setEditError('')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingMember) return
    setEditSaving(true)
    setEditError('')
    try {
      const payload = {
        ...editForm,
        dateOfBirth: editForm.dateOfBirth || null,
        fellowship: editForm.fellowship || null,
        middleName: editForm.middleName || null,
        address: editForm.address || null,
        city: editForm.city || null,
        state: editForm.state || null,
        email: editForm.email || null,
        phone: editForm.phone || null,
        emergencyName: editForm.emergencyName || null,
        emergencyPhone: editForm.emergencyPhone || null,
        notes: editForm.notes || null,
      }
      const res = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = await res.json()
        const merged = { ...editingMember, ...updated }
        setMembers(prev => prev.map(m => m.id === editingMember.id ? merged : m))
        if (selectedMember?.id === editingMember.id) setSelectedMember(merged)
        setEditingMember(null)
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

  const handleAssignStage = async (memberId, newLevel) => {
    if (!canEdit) return
    setUpdating(memberId)
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ growthLevel: newLevel })
      })
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, growthLevel: newLevel } : m))
      }
    } catch (error) {
      console.error('Failed to update member growth level:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id) => {
    if (!canDelete) return
    if (!confirm('Permanently delete this member record? All growth progress will also be deleted. This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id))
        if (selectedMember?.id === id) setSelectedMember(null)
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

  const getGrowthLevelDisplay = (level) => {
    const levels = {
      NEW_COMER: { name: 'New Comer', color: 'gray' },
      FOUNDATIONAL_CLASS: { name: 'Foundational Class', color: 'blue' },
      DESTINY_CULTURE: { name: 'Destiny Culture', color: 'purple' },
      MINISTRY_CLASS: { name: 'Ministry Class', color: 'green' },
      LEADERSHIP_CLASS: { name: 'Leadership Class', color: 'orange' },
      PASTORAL_CLASS: { name: 'Pastoral Class', color: 'red' },
      ADVANCED_LEADERSHIP_2: { name: 'Advanced Leadership II', color: 'indigo' },
      ADVANCED_LEADERSHIP_3: { name: 'Advanced Leadership III', color: 'pink' }
    }
    return levels[level] || { name: level, color: 'gray' }
  }

  const filteredMembers = members.filter(member => {
    if (filter === 'NEW_COMER' && member.growthLevel !== 'NEW_COMER') return false
    if (filter === 'IN_PROGRESS' && (member.growthLevel === 'NEW_COMER' || member.growthLevel === 'ADVANCED_LEADERSHIP_3')) return false
    if (filter === 'ADVANCED' && !['LEADERSHIP_CLASS', 'PASTORAL_CLASS', 'ADVANCED_LEADERSHIP_2', 'ADVANCED_LEADERSHIP_3'].includes(member.growthLevel)) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      if (!fullName.includes(search) && !(member.email || '').toLowerCase().includes(search) && !(member.phone || '').toLowerCase().includes(search)) return false
    }
    return true
  })

  const stats = {
    total: members.length,
    newComers: members.filter(m => m.growthLevel === 'NEW_COMER').length,
    inProgress: members.filter(m => m.progress.some(p => p.status === 'ENROLLED')).length,
    completed: members.filter(m => m.progress.some(p => p.status === 'COMPLETED')).length
  }

  const membersByLevel = {}
  growthStages.forEach(stage => { membersByLevel[stage.level] = members.filter(m => m.growthLevel === stage.level).length })

  const ef = (field) => (e) => setEditForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Members</p><p className="text-2xl font-bold mt-1">{stats.total}</p></div>
            <Users className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">New Comers</p><p className="text-2xl font-bold mt-1">{stats.newComers}</p></div>
            <TrendingUp className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">In Progress</p><p className="text-2xl font-bold mt-1">{stats.inProgress}</p></div>
            <BookOpen className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Completed Stages</p><p className="text-2xl font-bold mt-1">{stats.completed}</p></div>
            <Award className="text-yellow-500" size={24} />
          </div>
        </div>
      </div>

      {/* Growth Level Overview */}
      <div className="card p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Members by Growth Level</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {growthStages.map(stage => {
            const level = getGrowthLevelDisplay(stage.level)
            const count = membersByLevel[stage.level] || 0
            const pct = stats.total > 0 ? Math.min((count / stats.total) * 100, 100) : 0
            return (
              <div key={stage.id} className="text-center">
                <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                  <div className={`h-2 rounded-full bg-${level.color}-500 transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-sm font-medium">{stage.title}</p>
                <p className="text-xs text-gray-500">{count} members</p>
              </div>
            )
          })}
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
            {[['ALL','All','bg-purple-600'],['NEW_COMER','New Comers','bg-blue-500'],['IN_PROGRESS','In Progress','bg-orange-500'],['ADVANCED','Advanced','bg-green-500']].map(([val, label, active]) => (
              <button key={val} onClick={() => setFilter(val)} className={`px-4 py-2 rounded-lg transition-colors text-sm ${filter === val ? `${active} text-white` : 'bg-gray-100 hover:bg-gray-200'}`}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fellowship</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Level</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                {(canEdit || canDelete) && (
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr><td colSpan={(canEdit || canDelete) ? 6 : 5} className="px-6 py-12 text-center text-gray-500">No members found</td></tr>
              ) : filteredMembers.map((member) => {
                const level = getGrowthLevelDisplay(member.growthLevel)
                const currentProgress = member.progress.find(p => p.stage?.level === member.growthLevel)
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-500">Joined: {new Date(member.joinDate).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        <p>{member.email || '-'}</p>
                        <p>{member.phone || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium">{member.fellowship?.replace('_', ' ') || '-'}</p>
                        {member.arkCenter && <p className="text-xs text-gray-500">{member.arkCenter.name}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${level.color}-100 text-${level.color}-800`}>{level.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {currentProgress ? (
                        <div className="flex items-center gap-2">
                          {currentProgress.status === 'COMPLETED' ? <CheckCircle className="text-green-500" size={16} /> : <BookOpen className="text-orange-500" size={16} />}
                          <span className="text-sm text-gray-600">{currentProgress.status === 'COMPLETED' ? 'Completed' : 'In Progress'}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not enrolled</span>
                      )}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedMember(member)} className="text-purple-600 hover:text-purple-900 text-xs">View</button>
                          {canEdit && (
                            <button onClick={() => openEdit(member)} className="text-blue-600 hover:text-blue-900" title="Edit member">
                              <Pencil size={15} />
                            </button>
                          )}
                          {canEdit && (updating === member.id ? (
                            <span className="text-gray-400 text-xs">Updating...</span>
                          ) : (
                            <select className="form-select text-xs py-1 max-w-[140px]" value={member.growthLevel} onChange={(e) => handleAssignStage(member.id, e.target.value)}>
                              <option value="NEW_COMER">New Comer</option>
                              {growthStages.map(stage => <option key={stage.id} value={stage.level}>{stage.title}</option>)}
                            </select>
                          ))}
                          {canDelete && (
                            <button onClick={() => handleDelete(member.id)} disabled={deleting === member.id} className="text-red-500 hover:text-red-700 disabled:opacity-50" title="Delete member">
                              {deleting === member.id ? '...' : <Trash2 size={15} />}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedMember.firstName} {selectedMember.lastName}</h2>
              <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedMember.email || 'Not provided'}</p></div>
                <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedMember.phone || 'Not provided'}</p></div>
                <div><p className="text-sm text-gray-500">Fellowship</p><p className="font-medium">{selectedMember.fellowship?.replace('_', ' ') || 'Not assigned'}</p></div>
                <div><p className="text-sm text-gray-500">Department</p><p className="font-medium">{selectedMember.department?.replace('_', ' ') || 'None'}</p></div>
                <div><p className="text-sm text-gray-500">Status</p><p className="font-medium">{selectedMember.status || 'Active'}</p></div>
                <div><p className="text-sm text-gray-500">Address</p><p className="font-medium">{[selectedMember.address, selectedMember.city, selectedMember.state].filter(Boolean).join(', ') || 'Not provided'}</p></div>
              </div>
              <div>
                <h3 className="font-bold mb-2">Growth Track Progress</h3>
                <div className="space-y-2">
                  {selectedMember.progress.length === 0 ? (
                    <p className="text-sm text-gray-400">No growth track progress yet.</p>
                  ) : selectedMember.progress.map(prog => (
                    <div key={prog.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{prog.stage?.title || 'Unknown Stage'}</p>
                        <p className="text-sm text-gray-500">Status: {prog.status}{prog.testScore ? ` | Score: ${prog.testScore}%` : ''}</p>
                      </div>
                      {prog.status === 'COMPLETED' && <CheckCircle className="text-green-500" size={20} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedMember(null)} className="btn-primary mt-6 w-full justify-center">Close</button>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit Member</h2>
              <button onClick={() => setEditingMember(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              {/* Name */}
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

              {/* Gender & DOB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={editForm.gender} onChange={ef('gender')}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={editForm.dateOfBirth} onChange={ef('dateOfBirth')} />
                </div>
              </div>

              {/* Contact */}
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

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={editForm.address} onChange={ef('address')} />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input className="form-input" value={editForm.city} onChange={ef('city')} />
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input className="form-input" value={editForm.state} onChange={ef('state')} />
                </div>
              </div>

              {/* Church Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Fellowship</label>
                  <select className="form-select" value={editForm.fellowship} onChange={ef('fellowship')}>
                    {FELLOWSHIPS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Department</label>
                  <select className="form-select" value={editForm.department} onChange={ef('department')}>
                    {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select className="form-select" value={editForm.status} onChange={ef('status')}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Emergency Contact Name</label>
                  <input className="form-input" value={editForm.emergencyName} onChange={ef('emergencyName')} />
                </div>
                <div>
                  <label className="form-label">Emergency Contact Phone</label>
                  <input className="form-input" type="tel" value={editForm.emergencyPhone} onChange={ef('emergencyPhone')} />
                </div>
              </div>

              <div>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} value={editForm.notes} onChange={ef('notes')} />
              </div>

              {editError && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{editError}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingMember(null)} className="btn-outline">Cancel</button>
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
