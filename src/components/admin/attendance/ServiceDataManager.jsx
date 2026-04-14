'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, Save, Plus, Loader2, Trash2, Banknote, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

export default function ServiceDataManager({ assemblyId }) {
  const [records, setRecords] = useState([])
  const [arkCenters, setArkCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Form state
  const [form, setForm] = useState({
    serviceDate: format(new Date(), 'yyyy-MM-dd'),
    attendance: '',
    serviceType: 'SUNDAY',
    arkCenterId: '',
    offering: '',
    tithe: '',
    testimony: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [assemblyId])

  async function fetchData() {
    try {
      setLoading(true)
      const [recRes, arkRes] = await Promise.all([
        fetch(`/api/admin/assemblies/${assemblyId}/service-data?take=20`),
        fetch(`/api/admin/ark-centers?assemblyId=${assemblyId}`)
      ])
      
      if (!recRes.ok || !arkRes.ok) throw new Error('Failed to fetch data')
      
      const recData = await recRes.json()
      const arkData = await arkRes.json()
      setRecords(recData)
      setArkCenters(arkData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/assemblies/${assemblyId}/service-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          arkCenterId: form.serviceType === 'ARK_CENTER' ? form.arkCenterId : null,
          attendance: parseInt(form.attendance),
          offering: form.offering ? parseFloat(form.offering) : null,
          tithe: form.tithe ? parseFloat(form.tithe) : null
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to record service data')
      }

      const newRecord = await res.json()
      // If the record has an arkCenterId, we should try to attach the name locally if it's missing from API response include
      if (newRecord.arkCenterId && !newRecord.arkCenter) {
          const center = arkCenters.find(c => c.id === newRecord.arkCenterId)
          if (center) newRecord.arkCenter = { name: center.name }
      }
      
      setRecords([newRecord, ...records])
      setForm({
        ...form,
        attendance: '',
        offering: '',
        tithe: '',
        testimony: '',
        notes: ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // If service type is ARK_CENTER, arkCenterId should be required
  useEffect(() => {
    if (form.serviceType === 'ARK_CENTER' && !form.arkCenterId && arkCenters.length > 0) {
        setForm(f => ({ ...f, arkCenterId: arkCenters[0].id }))
    } else if (form.serviceType !== 'ARK_CENTER') {
        setForm(f => ({ ...f, arkCenterId: '' }))
    }
  }, [form.serviceType, arkCenters])

  return (
    <div className="space-y-8">
      <div className="card p-6 shadow-sm border border-purple-100">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Plus size={20} className="text-purple-600" />
          Record Service Information
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Date</label>
              <input
                type="date"
                className="input-field"
                value={form.serviceDate}
                onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Type</label>
              <select
                className="input-field"
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                required
              >
                <option value="SUNDAY">Sunday Service</option>
                <option value="MIDWEEK">Midweek Service</option>
                <option value="ARK_CENTER">Ark Center Service</option>
                <option value="SPECIAL">Special Event</option>
              </select>
            </div>
            
            {form.serviceType === 'ARK_CENTER' ? (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ark Center</label>
                <select
                  className="input-field"
                  value={form.arkCenterId}
                  onChange={(e) => setForm({ ...form, arkCenterId: e.target.value })}
                  required
                >
                  <option value="">Select Ark Center</option>
                  {arkCenters.map(center => (
                    <option key={center.id} value={center.id}>{center.name}</option>
                  ))}
                </select>
              </div>
            ) : (
                <div className="md:col-span-1" />
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Attendance Count</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 120"
                value={form.attendance}
                onChange={(e) => setForm({ ...form, attendance: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                <Banknote size={12} /> Offering (optional)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 50000"
                value={form.offering}
                onChange={(e) => setForm({ ...form, offering: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                <Banknote size={12} /> Tithe (optional)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 25000"
                value={form.tithe}
                onChange={(e) => setForm({ ...form, tithe: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
              <MessageSquare size={12} /> Testimony (optional)
            </label>
            <textarea
              className="input-field"
              placeholder="Record any testimonies shared during this service..."
              rows={2}
              value={form.testimony}
              onChange={(e) => setForm({ ...form, testimony: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes (Optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Additional details about the service..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary px-8 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Service Data
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>

      <div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-purple-600" />
          Recent Service Records
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-center">Attendance</th>
                  <th className="px-4 py-3 text-right">Finances</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {format(new Date(record.serviceDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className={`pill text-[10px] font-bold w-fit ${
                          record.serviceType === 'SUNDAY' ? 'bg-blue-50 text-blue-600' :
                          record.serviceType === 'MIDWEEK' ? 'bg-purple-50 text-purple-600' :
                          record.serviceType === 'ARK_CENTER' ? 'bg-green-50 text-green-600' :
                          'bg-gold-50 text-gold-600'
                        }`}>
                          {record.serviceType}
                        </span>
                        {record.arkCenter && (
                          <span className="text-[10px] text-gray-500 mt-0.5">{record.arkCenter.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-gray-900">
                        <Users size={14} className="text-gray-400" />
                        {record.attendance}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      {record.offering && <div className="text-gray-600">Off: {record.offering.toLocaleString()}</div>}
                      {record.tithe && <div className="text-gray-400">Tithe: {record.tithe.toLocaleString()}</div>}
                      {!record.offering && !record.tithe && <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {record.testimony && <span className="italic mr-2">"{record.testimony}"</span>}
                      {record.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400">No records found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
