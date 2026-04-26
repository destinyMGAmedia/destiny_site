'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { 
  Users, Plus, Pencil, Trash2, UserCheck, AlertCircle, 
  Check, X, Search, Filter, Star, Award, Crown, Eye 
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const GROWTH_LEVELS = [
  { value: 'NEW_COMER', label: 'New Comer', icon: '👋', color: 'blue' },
  { value: 'FOUNDATIONAL_CLASS', label: 'Foundational Class', icon: '📖', color: 'green' },
  { value: 'DESTINY_CULTURE', label: 'Destiny Culture', icon: '🏛️', color: 'purple' },
  { value: 'MINISTRY_CLASS', label: 'Ministry Class', icon: '⛪', color: 'orange' },
  { value: 'LEADERSHIP_CLASS', label: 'Leadership Class', icon: '👑', color: 'yellow' },
  { value: 'PASTORAL_CLASS', label: 'Pastoral Class', icon: '🙏', color: 'indigo' },
  { value: 'ADVANCED_LEADERSHIP_2', label: 'Advanced Leadership 2', icon: '🎖️', color: 'red' },
  { value: 'ADVANCED_LEADERSHIP_3', label: 'Advanced Leadership 3', icon: '👨‍🎓', color: 'pink' },
]

const FELLOWSHIPS = [
  { value: 'KINGS_MEN', label: "King's Men" },
  { value: 'DESTINY_PRESERVERS', label: 'Destiny Preservers' },
  { value: 'DESTINY_DEFENDERS', label: 'Destiny Defenders' },
  { value: 'DESTINY_TREASURES', label: 'Destiny Treasures' },
]

const DEPARTMENTS = [
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

export default function MembersPage() {
  const { data: session } = useSession()
  const params = useParams()
  const [members, setMembers] = useState([])
  const [arkCenters, setArkCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [viewingId, setViewingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    gender: 'MALE',
    dateOfBirth: '',
    joinDate: '',
    baptismDate: '',
    fellowship: '',
    department: '',
    status: 'ACTIVE',
    growthLevel: 'NEW_COMER',
    arkCenterId: '',
    emergencyName: '',
    emergencyPhone: '',
    notes: ''
  })

  useEffect(() => {
    fetchMembers()
    fetchArkCenters()
  }, [params.slug])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/admin/assemblies/${params.slug}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      } else {
        setError('Failed to load members')
      }
    } catch (error) {
      setError('Error loading members: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchArkCenters = async () => {
    try {
      const response = await fetch(`/api/admin/assemblies/${params.slug}/ark-centers`)
      if (response.ok) {
        const data = await response.json()
        setArkCenters(data)
      }
    } catch (error) {
      console.error('Error loading ark centers:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const url = editingId 
        ? `/api/admin/assemblies/${params.slug}/members/${editingId}` 
        : `/api/admin/assemblies/${params.slug}/members`
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(editingId ? 'Member updated successfully!' : 'Member added successfully!')
        resetForm()
        fetchMembers()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save member')
      }
    } catch (error) {
      setError('Error saving member: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (member) => {
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      middleName: member.middleName || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      city: member.city || '',
      state: member.state || '',
      country: member.country || '',
      gender: member.gender,
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      joinDate: member.joinDate ? member.joinDate.split('T')[0] : '',
      baptismDate: member.baptismDate ? member.baptismDate.split('T')[0] : '',
      fellowship: member.fellowship || '',
      department: member.department || '',
      status: member.status,
      growthLevel: member.growthLevel,
      arkCenterId: member.arkCenterId || '',
      emergencyName: member.emergencyName || '',
      emergencyPhone: member.emergencyPhone || '',
      notes: member.notes || ''
    })
    setEditingId(member.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      const response = await fetch(`/api/admin/assemblies/${params.slug}/members/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Member deleted successfully!')
        fetchMembers()
      } else {
        setError('Failed to delete member')
      }
    } catch (error) {
      setError('Error deleting member: ' + error.message)
    }
  }

  const promoteToNextLevel = async (member) => {
    const currentIndex = GROWTH_LEVELS.findIndex(level => level.value === member.growthLevel)
    if (currentIndex >= GROWTH_LEVELS.length - 1) {
      setError('Member is already at the highest level')
      return
    }

    const nextLevel = GROWTH_LEVELS[currentIndex + 1]
    
    if (!confirm(`Promote ${member.firstName} ${member.lastName} to ${nextLevel.label}?`)) return

    try {
      const response = await fetch(`/api/admin/assemblies/${params.slug}/members/${member.id}/promote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ growthLevel: nextLevel.value })
      })

      if (response.ok) {
        setSuccess(`${member.firstName} promoted to ${nextLevel.label}!`)
        fetchMembers()
      } else {
        setError('Failed to promote member')
      }
    } catch (error) {
      setError('Error promoting member: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      gender: 'MALE',
      dateOfBirth: '',
      joinDate: '',
      baptismDate: '',
      fellowship: '',
      department: '',
      status: 'ACTIVE',
      growthLevel: 'NEW_COMER',
      arkCenterId: '',
      emergencyName: '',
      emergencyPhone: '',
      notes: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getGrowthLevel = (level) => {
    return GROWTH_LEVELS.find(l => l.value === level) || GROWTH_LEVELS[0]
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.phone && member.phone.includes(searchTerm))
    
    const matchesLevel = !filterLevel || member.growthLevel === filterLevel
    const matchesStatus = !filterStatus || member.status === filterStatus

    return matchesSearch && matchesLevel && matchesStatus
  })

  if (!session?.user || !['SUPER_ADMIN', 'GLOBAL_ADMIN', 'ASSEMBLY_ADMIN'].includes(session.user.role)) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to manage members.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Members Management</h1>
            <p className="text-gray-600">Manage church members and track their growth journey</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <X className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search members by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Growth Levels</option>
            {GROWTH_LEVELS.map(level => (
              <option key={level.value} value={level.value}>
                {level.icon} {level.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TRANSFERRED">Transferred</option>
          </select>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredMembers.length} of {members.length} members
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {members.length === 0 ? 'No Members Added' : 'No Members Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {members.length === 0 
                ? 'Add your first church member to get started.' 
                : 'Try adjusting your search or filters.'}
            </p>
            {members.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800"
              >
                <Plus size={20} />
                Add First Member
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fellowship/Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => {
                  const growthLevel = getGrowthLevel(member.growthLevel)
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined: {formatDate(member.joinDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${growthLevel.color}-100 text-${growthLevel.color}-800`}
                        >
                          {growthLevel.icon} {growthLevel.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {member.fellowship && (
                            <div className="text-sm text-gray-600">
                              Fellowship: {FELLOWSHIPS.find(f => f.value === member.fellowship)?.label}
                            </div>
                          )}
                          {member.department && (
                            <div className="text-sm text-gray-600">
                              Dept: {DEPARTMENTS.find(d => d.value === member.department)?.label}
                            </div>
                          )}
                          {!member.fellowship && !member.department && (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {member.email && (
                            <div className="text-sm text-gray-600">{member.email}</div>
                          )}
                          {member.phone && (
                            <div className="text-sm text-gray-600">{member.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : member.status === 'INACTIVE'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingId(member.id)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => promoteToNextLevel(member)}
                            className="text-green-600 hover:text-green-800 p-1 rounded"
                            title="Promote to next level"
                          >
                            <Star size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-purple-600 hover:text-purple-800 p-1 rounded"
                            title="Edit member"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                            title="Delete member"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Member Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingId ? 'Edit Member' : 'Add New Member'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Join Date
                      </label>
                      <input
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Church Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Church Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Growth Level
                      </label>
                      <select
                        value={formData.growthLevel}
                        onChange={(e) => setFormData({ ...formData, growthLevel: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {GROWTH_LEVELS.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.icon} {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fellowship
                      </label>
                      <select
                        value={formData.fellowship}
                        onChange={(e) => setFormData({ ...formData, fellowship: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select fellowship</option>
                        {FELLOWSHIPS.map(fellowship => (
                          <option key={fellowship.value} value={fellowship.value}>
                            {fellowship.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select department</option>
                        {DEPARTMENTS.map(department => (
                          <option key={department.value} value={department.value}>
                            {department.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ark Center
                      </label>
                      <select
                        value={formData.arkCenterId}
                        onChange={(e) => setFormData({ ...formData, arkCenterId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">No Ark Center</option>
                        {arkCenters.map(center => (
                          <option key={center.id} value={center.id}>
                            {center.name} - {center.location}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Baptism Date
                      </label>
                      <input
                        type="date"
                        value={formData.baptismDate}
                        onChange={(e) => setFormData({ ...formData, baptismDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="TRANSFERRED">Transferred</option>
                        <option value="DECEASED">Deceased</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyName}
                        onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Additional notes about this member..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />}
                    {editingId ? 'Update Member' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}