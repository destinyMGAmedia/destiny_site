'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Users, MapPin, Calendar, Clock, History } from 'lucide-react'

function ArkCenterForm({ center = {}, members = [], onSave, onCancel }) {
  const [form, setForm] = useState({
    name: center.name || '',
    location: center.location || '',
    meetingDay: center.meetingDay || 'Thursday',
    meetingTime: center.meetingTime || '17:00',
    leaderId: center.leaderId || '',
    isActive: center.isActive ?? true,
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="border rounded-xl p-5 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--ivory)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="form-label">Ark Center Name *</label>
          <input className="form-input" value={form.name} onChange={set('name')} required placeholder="e.g. Grace Center" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Location / Address</label>
          <input className="form-input" value={form.location} onChange={set('location')} placeholder="e.g. 123 Street Name, City" />
        </div>
        <div>
          <label className="form-label">Meeting Day</label>
          <select className="form-input" value={form.meetingDay} onChange={set('meetingDay')}>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>
        <div>
          <label className="form-label">Meeting Time</label>
          <input className="form-input" type="time" value={form.meetingTime} onChange={set('meetingTime')} />
        </div>
        <div>
          <label className="form-label">Leader</label>
          <select className="form-input" value={form.leaderId} onChange={set('leaderId')}>
            <option value="">Select a leader (optional)</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-8">
          <input 
            type="checkbox" 
            id="isActive" 
            checked={form.isActive} 
            onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} 
          />
          <label htmlFor="isActive" className="text-sm font-medium">Active</label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={() => onSave(form)} className="btn-primary btn-sm">
          <Check size={13} /> Save Center
        </button>
        <button type="button" onClick={onCancel} className="btn-outline btn-sm">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  )
}

function AttendanceForm({ center, onSave, onCancel }) {
  const [form, setForm] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    attendance: '',
    testimony: '',
    notes: '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="border rounded-xl p-5 space-y-4" style={{ borderColor: 'var(--border)', background: 'white' }}>
      <h3 className="font-bold text-lg">Record Attendance for {center.name}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Service Date *</label>
          <input className="form-input" type="date" value={form.serviceDate} onChange={set('serviceDate')} required />
        </div>
        <div>
          <label className="form-label">Total Attendance *</label>
          <input className="form-input" type="number" min={0} value={form.attendance} onChange={set('attendance')} required placeholder="0" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Testimony (optional)</label>
          <textarea className="form-input" rows={2} value={form.testimony} onChange={set('testimony')} placeholder="Any testimonies from the service?" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-input" rows={2} value={form.notes} onChange={set('notes')} placeholder="Any other notes?" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={() => onSave(form)} className="btn-primary btn-sm">
          <Check size={13} /> Submit Record
        </button>
        <button type="button" onClick={onCancel} className="btn-outline btn-sm">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  )
}

export default function ArkCentersEditor({ assembly, initialCenters, members }) {
  const [centers, setCenters] = useState(initialCenters || [])
  const [editingId, setEditingId] = useState(null) // null = no edit, 'new' = adding new
  const [attendanceId, setAttendanceId] = useState(null) // ID of center to record attendance for
  const [historyId, setHistoryId] = useState(null) // ID of center to view history for
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchHistory = async (id) => {
    setLoadingHistory(true)
    setHistoryId(id)
    try {
      const res = await fetch(`/api/admin/assemblies/${assembly.id}/service-data?arkCenterId=${id}`)
      if (!res.ok) throw new Error('Failed to fetch history')
      const data = await res.json()
      setAttendanceHistory(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editingId === 'new') {
        const payload = { ...form, assemblyId: assembly.id }
        const res = await fetch('/api/admin/ark-centers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to save')
        const created = await res.json()
        setCenters(prev => [created, ...prev])
      } else {
        const res = await fetch(`/api/admin/ark-centers/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Failed to save')
        const updated = await res.json()
        setCenters(prev => prev.map(c => c.id === editingId ? updated : c))
      }
      setEditingId(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this Ark Center? This will also delete all its attendance records.')) return
    const res = await fetch(`/api/admin/ark-centers/${id}`, { method: 'DELETE' })
    if (res.ok) setCenters(prev => prev.filter(c => c.id !== id))
  }

  const handleSaveAttendance = async (form) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/assemblies/${assembly.id}/service-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          serviceType: 'ARK_CENTER',
          arkCenterId: attendanceId
        }),
      })
      if (!res.ok) throw new Error('Failed to save attendance')
      alert('Attendance recorded successfully')
      setAttendanceId(null)
      // Refresh count locally
      setCenters(prev => prev.map(c => {
          if (c.id === attendanceId) {
              return { ...c, _count: { ...c._count, serviceData: (c._count?.serviceData || 0) + 1 } }
          }
          return c
      }))
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--purple-900)' }}>House Fellowships (Ark Centers)</h2>
          <p className="text-xs text-gray-500">Usually meets every other Thursday. Alternates with midweek service at the assembly building.</p>
        </div>
        {editingId !== 'new' && (
          <button onClick={() => setEditingId('new')} className="btn-primary btn-sm">
            <Plus size={14} /> Add Ark Center
          </button>
        )}
      </div>

      {editingId === 'new' && (
        <ArkCenterForm members={members} onSave={handleSave} onCancel={() => setEditingId(null)} />
      )}

      {historyId && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-purple-900 flex items-center gap-2">
              <History size={18} /> Attendance History: {centers.find(c => c.id === historyId)?.name}
            </h3>
            <button onClick={() => setHistoryId(null)} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </div>
          
          {loadingHistory ? (
            <div className="py-8 text-center text-gray-400">Loading history...</div>
          ) : attendanceHistory.length === 0 ? (
            <div className="py-8 text-center text-gray-400">No records found for this center.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Date</th>
                    <th className="py-2 text-center">Attendance</th>
                    <th className="py-2">Testimony / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendanceHistory.map(h => (
                    <tr key={h.id}>
                      <td className="py-2">{new Date(h.serviceDate).toLocaleDateString()}</td>
                      <td className="py-2 text-center font-bold">{h.attendance}</td>
                      <td className="py-2 text-gray-500">
                        {h.testimony && <p className="italic">"{h.testimony}"</p>}
                        {h.notes && <p className="text-xs">{h.notes}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {centers.map(c => (
          <div key={c.id} className="space-y-3">
            {editingId === c.id ? (
              <ArkCenterForm center={c} members={members} onSave={handleSave} onCancel={() => setEditingId(null)} />
            ) : attendanceId === c.id ? (
              <AttendanceForm center={c} onSave={handleSaveAttendance} onCancel={() => setAttendanceId(null)} />
            ) : (
              <div className={`card p-5 flex flex-col h-full ${!c.isActive ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-purple-900 flex items-center gap-2">
                    <Users size={16} /> {c.name}
                  </h3>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingId(c.id)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600" title="Edit Center">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Delete Center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 flex-1">
                  {c.location && (
                    <p className="flex items-center gap-2"><MapPin size={14} className="shrink-0" /> {c.location}</p>
                  )}
                  <p className="flex items-center gap-2">
                    <Calendar size={14} className="shrink-0" /> {c.meetingDay}s 
                    <Clock size={14} className="ml-2 shrink-0" /> {c.meetingTime || 'TBD'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users size={14} className="shrink-0" /> 
                    Leader: {c.leader ? `${c.leader.firstName} ${c.leader.lastName}` : 'None assigned'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between gap-2">
                   <button 
                    onClick={() => fetchHistory(c.id)}
                    className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                   >
                      <History size={12} /> {c._count?.serviceData || 0} records
                   </button>
                   <button 
                    onClick={() => setAttendanceId(c.id)} 
                    className="btn-outline btn-xs flex items-center gap-1"
                   >
                     <Plus size={12} /> Record Attendance
                   </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {centers.length === 0 && editingId !== 'new' && (
          <div className="col-span-full py-12 text-center card border-dashed">
            <p className="text-gray-400">No Ark Centers found. Click "Add Ark Center" to create one.</p>
          </div>
        )}
      </div>
    </div>
  )
}
