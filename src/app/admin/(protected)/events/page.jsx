'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar, Plus, Pencil, Trash2, MapPin, Clock, Users, Globe, Baby, AlertCircle, Check, X, Image, Upload } from 'lucide-react'
import { formatDistanceToNow, format, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

export default function EventsPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState([])
  const [assemblies, setAssemblies] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    startDate: '',
    endDate: '',
    time: '',
    flyerImage: '',
    isGlobal: true,
    isChildrensEvent: false,
    assemblyId: ''
  })

  useEffect(() => {
    fetchEvents()
    fetchAssemblies()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else {
        setError('Failed to load events')
      }
    } catch (error) {
      setError('Error loading events: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssemblies = async () => {
    try {
      const response = await fetch('/api/admin/assemblies')
      if (response.ok) {
        const data = await response.json()
        setAssemblies(data)
      }
    } catch (error) {
      console.error('Error loading assemblies:', error)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('folder', 'events')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, flyerImage: data.url })
        setSuccess('Image uploaded successfully!')
      } else {
        setError('Failed to upload image')
      }
    } catch (error) {
      setError('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const url = editingId ? `/api/admin/events/${editingId}` : '/api/admin/events'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          assemblyId: formData.isGlobal ? null : formData.assemblyId || null
        })
      })

      if (response.ok) {
        setSuccess(editingId ? 'Event updated successfully!' : 'Event created successfully!')
        resetForm()
        fetchEvents()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save event')
      }
    } catch (error) {
      setError('Error saving event: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      venue: event.venue || '',
      startDate: format(parseISO(event.startDate), 'yyyy-MM-dd'),
      endDate: event.endDate ? format(parseISO(event.endDate), 'yyyy-MM-dd') : '',
      time: event.time || '',
      flyerImage: event.flyerImage || '',
      isGlobal: event.isGlobal,
      isChildrensEvent: event.isChildrensEvent,
      assemblyId: event.assemblyId || ''
    })
    setEditingId(event.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Event deleted successfully!')
        fetchEvents()
      } else {
        setError('Failed to delete event')
      }
    } catch (error) {
      setError('Error deleting event: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      venue: '',
      startDate: '',
      endDate: '',
      time: '',
      flyerImage: '',
      isGlobal: true,
      isChildrensEvent: false,
      assemblyId: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const formatEventDate = (startDate, endDate) => {
    const start = parseISO(startDate)
    if (endDate) {
      const end = parseISO(endDate)
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    }
    return format(start, 'MMM d, yyyy')
  }

  const isEventUpcoming = (startDate) => {
    return new Date(startDate) > new Date()
  }

  if (!session?.user || !['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to manage global events.</p>
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
          <Calendar className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Global Events</h1>
            <p className="text-gray-600">Manage church-wide events and activities</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors"
        >
          <Plus size={20} />
          Add Event
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

      {/* Event Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g., 10:00 AM - 12:00 PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Event venue/location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Flyer/Poster
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> event flyer
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {formData.flyerImage && (
                    <div className="relative">
                      <img
                        src={formData.flyerImage}
                        alt="Event flyer preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, flyerImage: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isGlobal}
                      onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked, assemblyId: e.target.checked ? '' : formData.assemblyId })}
                      className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                      <Globe size={16} className="text-purple-600" />
                      Global Event (visible to all assemblies)
                    </label>
                  </div>

                  {!formData.isGlobal && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assembly *
                      </label>
                      <select
                        value={formData.assemblyId}
                        onChange={(e) => setFormData({ ...formData, assemblyId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required={!formData.isGlobal}
                      >
                        <option value="">Select assembly</option>
                        {assemblies.map(assembly => (
                          <option key={assembly.id} value={assembly.id}>
                            {assembly.name} - {assembly.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isChildrensEvent}
                      onChange={(e) => setFormData({ ...formData, isChildrensEvent: e.target.checked })}
                      className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                      <Baby size={16} className="text-pink-600" />
                      Children's Event
                    </label>
                  </div>
                </div>
              </div>
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
                disabled={saving || uploading}
                className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />}
                {editingId ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Events</h2>
          
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Events</h3>
              <p className="text-gray-600 mb-4">Create your first event to get started.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800"
              >
                <Plus size={20} />
                Add Event
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const isUpcoming = isEventUpcoming(event.startDate)
                return (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {event.flyerImage && (
                          <img
                            src={event.flyerImage}
                            alt={event.title}
                            className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            {event.isGlobal && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                <Globe size={12} />
                                Global
                              </span>
                            )}
                            {event.isChildrensEvent && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                                <Baby size={12} />
                                Kids
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isUpcoming 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isUpcoming ? 'Upcoming' : 'Past'}
                            </span>
                          </div>
                          
                          {event.description && (
                            <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatEventDate(event.startDate, event.endDate)}
                            </div>
                            {event.time && (
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                {event.time}
                              </div>
                            )}
                            {event.venue && (
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                {event.venue}
                              </div>
                            )}
                            {event.assembly && (
                              <div className="flex items-center gap-1">
                                <Users size={14} />
                                {event.assembly.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit event"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete event"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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