'use client'
import { useState } from 'react'
import { Users, Award, TrendingUp, Search, Filter, ChevronRight, BookOpen, CheckCircle } from 'lucide-react'

export default function MemberManager({ members: initialData, growthStages, assemblyId, canEdit }) {
  const [members, setMembers] = useState(initialData)
  const [filter, setFilter] = useState('ALL') // ALL, NEW_COMER, IN_PROGRESS, ADVANCED
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [updating, setUpdating] = useState(null)

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
        setMembers(prev => prev.map(m => 
          m.id === memberId ? { ...m, growthLevel: newLevel } : m
        ))
      }
    } catch (error) {
      console.error('Failed to update member growth level:', error)
    } finally {
      setUpdating(null)
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
    // Apply growth level filter
    if (filter === 'NEW_COMER' && member.growthLevel !== 'NEW_COMER') return false
    if (filter === 'IN_PROGRESS' && 
        (member.growthLevel === 'NEW_COMER' || 
         member.growthLevel === 'ADVANCED_LEADERSHIP_3')) return false
    if (filter === 'ADVANCED' && 
        !['LEADERSHIP_CLASS', 'PASTORAL_CLASS', 'ADVANCED_LEADERSHIP_2', 'ADVANCED_LEADERSHIP_3'].includes(member.growthLevel)) return false

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      const email = (member.email || '').toLowerCase()
      const phone = (member.phone || '').toLowerCase()
      
      if (!fullName.includes(search) && !email.includes(search) && !phone.includes(search)) {
        return false
      }
    }

    return true
  })

  // Calculate stats
  const stats = {
    total: members.length,
    newComers: members.filter(m => m.growthLevel === 'NEW_COMER').length,
    inProgress: members.filter(m => m.progress.some(p => p.status === 'ENROLLED')).length,
    completed: members.filter(m => m.progress.some(p => p.status === 'COMPLETED')).length
  }

  // Group members by growth level for overview
  const membersByLevel = {}
  growthStages.forEach(stage => {
    membersByLevel[stage.level] = members.filter(m => m.growthLevel === stage.level).length
  })

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <Users className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">New Comers</p>
              <p className="text-2xl font-bold mt-1">{stats.newComers}</p>
            </div>
            <TrendingUp className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
            </div>
            <BookOpen className="text-orange-500" size={24} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Stages</p>
              <p className="text-2xl font-bold mt-1">{stats.completed}</p>
            </div>
            <Award className="text-gold-500" size={24} />
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
            return (
              <div key={stage.id} className="text-center">
                <div className={`w-full h-2 bg-gray-200 rounded-full mb-2`}>
                  <div 
                    className={`h-2 rounded-full bg-${level.color}-500 transition-all`}
                    style={{ width: `${Math.min((count / stats.total) * 100, 100)}%` }}
                  />
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
              onClick={() => setFilter('NEW_COMER')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'NEW_COMER' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              New Comers
            </button>
            <button
              onClick={() => setFilter('IN_PROGRESS')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'IN_PROGRESS' ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('ADVANCED')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'ADVANCED' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fellowship
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth Level
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                {canEdit && (
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const level = getGrowthLevelDisplay(member.growthLevel)
                  const currentProgress = member.progress.find(p => p.stage.level === member.growthLevel)
                  
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(member.joinDate).toLocaleDateString()}
                          </p>
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
                          {member.arkCenter && (
                            <p className="text-xs text-gray-500">{member.arkCenter.name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${level.color}-100 text-${level.color}-800`}>
                          {level.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentProgress ? (
                          <div className="flex items-center gap-2">
                            {currentProgress.status === 'COMPLETED' ? (
                              <CheckCircle className="text-green-500" size={16} />
                            ) : (
                              <BookOpen className="text-orange-500" size={16} />
                            )}
                            <span className="text-sm text-gray-600">
                              {currentProgress.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not enrolled</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedMember(member)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              View Details
                            </button>
                            {updating === member.id ? (
                              <span className="text-gray-400">Updating...</span>
                            ) : (
                              <select
                                className="form-select text-sm py-1"
                                value={member.growthLevel}
                                onChange={(e) => handleAssignStage(member.id, e.target.value)}
                              >
                                <option value="NEW_COMER">New Comer (No Training)</option>
                                {growthStages.map(stage => (
                                  <option key={stage.id} value={stage.level}>
                                    {stage.title}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-4">
              {selectedMember.firstName} {selectedMember.lastName}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedMember.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedMember.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fellowship</p>
                  <p className="font-medium">{selectedMember.fellowship?.replace('_', ' ') || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{selectedMember.department?.replace('_', ' ') || 'None'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Growth Track Progress</h3>
                <div className="space-y-2">
                  {selectedMember.progress.map(prog => (
                    <div key={prog.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{prog.stage.title}</p>
                        <p className="text-sm text-gray-500">
                          Status: {prog.status} 
                          {prog.testScore && ` | Score: ${prog.testScore}%`}
                        </p>
                      </div>
                      {prog.status === 'COMPLETED' && <CheckCircle className="text-green-500" size={20} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="btn-primary mt-6 w-full justify-center"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}