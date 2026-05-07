'use client'
import { useState } from 'react'
import { UserPlus, Phone, Mail, Calendar, CheckCircle, UserCheck, Search, Filter } from 'lucide-react'

export default function FirstTimerManager({ firstTimers: initialData, assemblyId, canEdit }) {
  const [firstTimers, setFirstTimers] = useState(initialData)
  const [filter, setFilter] = useState('ALL') // ALL, PENDING, FOLLOWED_UP, CONVERTED
  const [searchTerm, setSearchTerm] = useState('')
  const [updating, setUpdating] = useState(null)

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
        setFirstTimers(prev => prev.map(ft => 
          ft.id === id ? { ...ft, followedUp: true } : ft
        ))
      }
    } catch (error) {
      console.error('Failed to update follow-up status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleConvertToMember = async (firstTimer) => {
    if (!canEdit) return
    // Redirect to member registration with pre-filled data
    const params = new URLSearchParams({
      firstName: firstTimer.firstName,
      lastName: firstTimer.lastName,
      email: firstTimer.email || '',
      phone: firstTimer.phone || '',
      firstTimerId: firstTimer.id
    })
    window.location.href = `/admin/members/new?${params.toString()}`
  }

  const filteredFirstTimers = firstTimers.filter(ft => {
    // Apply status filter
    if (filter === 'PENDING' && (ft.followedUp || ft.convertedToMember)) return false
    if (filter === 'FOLLOWED_UP' && !ft.followedUp) return false
    if (filter === 'CONVERTED' && !ft.convertedToMember) return false

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const fullName = `${ft.firstName} ${ft.lastName}`.toLowerCase()
      const email = (ft.email || '').toLowerCase()
      const phone = (ft.phone || '').toLowerCase()
      
      if (!fullName.includes(search) && !email.includes(search) && !phone.includes(search)) {
        return false
      }
    }

    return true
  })

  const stats = {
    total: firstTimers.length,
    pending: firstTimers.filter(ft => !ft.followedUp && !ft.convertedToMember).length,
    followedUp: firstTimers.filter(ft => ft.followedUp).length,
    converted: firstTimers.filter(ft => ft.convertedToMember).length
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total First Timers</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <UserPlus className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Follow-up</p>
              <p className="text-2xl font-bold mt-1">{stats.pending}</p>
            </div>
            <Calendar className="text-orange-500" size={24} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Followed Up</p>
              <p className="text-2xl font-bold mt-1">{stats.followedUp}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Converted to Members</p>
              <p className="text-2xl font-bold mt-1">{stats.converted}</p>
            </div>
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
              <input
                className="form-input pl-10"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'PENDING' ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('FOLLOWED_UP')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'FOLLOWED_UP' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Followed Up
            </button>
            <button
              onClick={() => setFilter('CONVERTED')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'CONVERTED' ? 'bg-gold-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Converted
            </button>
          </div>
        </div>
      </div>

      {/* First Timers Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Registered
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  How They Heard
                </th>
                {canEdit && (
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFirstTimers.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                    No first timers found
                  </td>
                </tr>
              ) : (
                filteredFirstTimers.map((firstTimer) => (
                  <tr key={firstTimer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {firstTimer.firstName} {firstTimer.lastName}
                        </p>
                        {firstTimer.assembly && (
                          <p className="text-xs text-gray-500">{firstTimer.assembly.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {firstTimer.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail size={14} />
                            {firstTimer.email}
                          </div>
                        )}
                        {firstTimer.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone size={14} />
                            {firstTimer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(firstTimer.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {firstTimer.convertedToMember ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-800">
                          <UserCheck size={12} className="mr-1" />
                          Member
                        </span>
                      ) : firstTimer.followedUp ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Followed Up
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Pending
                        </span>
                      )}
                      {firstTimer.isConverted && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Gave Life to Christ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {firstTimer.howDidYouHear || 'Not specified'}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {!firstTimer.followedUp && (
                            <button
                              onClick={() => handleFollowUp(firstTimer.id)}
                              disabled={updating === firstTimer.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              {updating === firstTimer.id ? 'Updating...' : 'Mark Followed Up'}
                            </button>
                          )}
                          {!firstTimer.convertedToMember && (
                            <button
                              onClick={() => handleConvertToMember(firstTimer)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Convert to Member
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}