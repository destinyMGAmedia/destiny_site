'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Video, Plus, Pencil, Trash2, Youtube, Check, X, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ChannelsPage() {
  const { data: session } = useSession()
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    channelType: '',
    channelId: '',
    channelName: '',
    description: '',
    isActive: true
  })

  const channelTypes = [
    { value: 'MAIN_LIVE', label: 'Main Live Stream', description: 'Primary live streaming channel for homepage' },
    { value: 'MEDIA_GALLERY', label: 'Media Gallery', description: 'Video gallery for media page' },
    { value: 'CREATIVE_ARTS', label: 'Creative Arts', description: 'Creative arts and music content' },
    { value: 'TREASURES_KIDS', label: 'Treasures Kids', description: 'Children\'s ministry content' }
  ]

  useEffect(() => {
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/admin/youtube-channels')
      if (response.ok) {
        const data = await response.json()
        setChannels(data)
      } else {
        setError('Failed to load YouTube channels')
      }
    } catch (error) {
      setError('Error loading channels: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const url = editingId ? `/api/admin/youtube-channels/${editingId}` : '/api/admin/youtube-channels'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(editingId ? 'Channel updated successfully!' : 'Channel added successfully!')
        resetForm()
        fetchChannels()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save channel')
      }
    } catch (error) {
      setError('Error saving channel: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (channel) => {
    setFormData({
      channelType: channel.channelType,
      channelId: channel.channelId,
      channelName: channel.channelName,
      description: channel.description || '',
      isActive: channel.isActive
    })
    setEditingId(channel.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this YouTube channel?')) return

    try {
      const response = await fetch(`/api/admin/youtube-channels/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Channel deleted successfully!')
        fetchChannels()
      } else {
        setError('Failed to delete channel')
      }
    } catch (error) {
      setError('Error deleting channel: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      channelType: '',
      channelId: '',
      channelName: '',
      description: '',
      isActive: true
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getChannelTypeInfo = (type) => {
    return channelTypes.find(ct => ct.value === type) || { label: type, description: '' }
  }

  if (!session?.user || !['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to manage YouTube channels.</p>
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
          <Youtube className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">YouTube Channels</h1>
            <p className="text-gray-600">Manage YouTube channels for live streaming and video content</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors"
        >
          <Plus size={20} />
          Add Channel
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

      {/* Channel Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit YouTube Channel' : 'Add YouTube Channel'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Type *
                </label>
                <select
                  value={formData.channelType}
                  onChange={(e) => setFormData({ ...formData, channelType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select channel type</option>
                  {channelTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {formData.channelType && (
                  <p className="text-sm text-gray-500 mt-1">
                    {getChannelTypeInfo(formData.channelType).description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel ID *
                </label>
                <input
                  type="text"
                  value={formData.channelId}
                  onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                  placeholder="UCxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  YouTube Channel ID (starts with UC)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Name *
                </label>
                <input
                  type="text"
                  value={formData.channelName}
                  onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                  placeholder="Channel display name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Active (channel is enabled)
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for this channel"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
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
                {editingId ? 'Update Channel' : 'Add Channel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Channels List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configured Channels</h2>
          
          {channels.length === 0 ? (
            <div className="text-center py-8">
              <Video className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No YouTube Channels</h3>
              <p className="text-gray-600 mb-4">Add your first YouTube channel to get started.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800"
              >
                <Plus size={20} />
                Add Channel
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {channels.map((channel) => {
                const typeInfo = getChannelTypeInfo(channel.channelType)
                return (
                  <div key={channel.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${channel.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Youtube className={`h-6 w-6 ${channel.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{channel.channelName}</h3>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {typeInfo.label}
                          </span>
                          {!channel.isActive && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{typeInfo.description}</p>
                        <p className="text-xs text-gray-400 font-mono">{channel.channelId}</p>
                        {channel.description && (
                          <p className="text-sm text-gray-600 mt-1">{channel.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(channel)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit channel"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(channel.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete channel"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}