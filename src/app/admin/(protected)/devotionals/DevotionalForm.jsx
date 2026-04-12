'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DevotionalForm({ initialData, mode = 'create' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    scripture: initialData?.scripture || '',
    scriptureRef: initialData?.scriptureRef || '',
    scheduledDate: initialData?.scheduledDate ? new Date(initialData.scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    publishTime: initialData?.publishTime || '05:00',
    targetTimezone: initialData?.targetTimezone || 'NIGERIA',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const url = mode === 'create' ? '/api/admin/devotionals' : `/api/admin/devotionals/${initialData.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      router.push('/admin/devotionals')
      router.refresh()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl fade-in">
      <div className="flex items-center justify-between">
        <Link href="/admin/devotionals" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft size={14} /> Back to List
        </Link>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {mode === 'create' ? 'Create Devotional' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <div>
              <label className="form-label">Title</label>
              <input
                required
                className="form-input"
                placeholder="e.g. Walking in the Spirit"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Main Content (HTML supported)</label>
              <textarea
                required
                rows={12}
                className="form-input font-sans leading-relaxed"
                placeholder="Write the devotional content here..."
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Scripture Reference</h3>
            <div>
              <label className="form-label">Reference</label>
              <input
                className="form-input"
                placeholder="e.g. Galatians 5:16"
                value={formData.scriptureRef}
                onChange={e => setFormData({ ...formData, scriptureRef: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Scripture Text</label>
              <textarea
                rows={3}
                className="form-input italic"
                placeholder="The actual verse text..."
                value={formData.scripture}
                onChange={e => setFormData({ ...formData, scripture: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Scheduling</h3>
            <div>
              <label className="form-label">Publish Date</label>
              <input
                required
                type="date"
                className="form-input"
                value={formData.scheduledDate}
                onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Publish Time</label>
              <input
                required
                type="time"
                className="form-input"
                value={formData.publishTime}
                onChange={e => setFormData({ ...formData, publishTime: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Target Timezone</label>
              <select
                className="form-input"
                value={formData.targetTimezone}
                onChange={e => setFormData({ ...formData, targetTimezone: e.target.value })}
              >
                <option value="NIGERIA">Nigeria (WAT)</option>
                <option value="USA_EAST">USA East (EST)</option>
                <option value="USA_WEST">USA West (PST)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
