'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Loader2, Plus, Trash2, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function SeriesForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [seriesData, setSeriesData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    publishTime: '05:00',
    targetTimezone: 'NIGERIA',
    items: [
      { title: '', content: '', scripture: '', scriptureRef: '' }
    ]
  })

  const addItem = () => {
    setSeriesData({
      ...seriesData,
      items: [...seriesData.items, { title: '', content: '', scripture: '', scriptureRef: '' }]
    })
  }

  const removeItem = (index) => {
    if (seriesData.items.length === 1) return
    const newItems = seriesData.items.filter((_, i) => i !== index)
    setSeriesData({ ...seriesData, items: newItems })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...seriesData.items]
    newItems[index][field] = value
    setSeriesData({ ...seriesData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Generate full data for each item
    const payloads = seriesData.items.map((item, index) => {
      const date = new Date(seriesData.startDate)
      date.setDate(date.getDate() + index)
      
      return {
        ...item,
        scheduledDate: date.toISOString().split('T')[0],
        publishTime: seriesData.publishTime,
        targetTimezone: seriesData.targetTimezone
      }
    })

    try {
      const res = await fetch('/api/admin/devotionals/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devotionals: payloads }),
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
    <form onSubmit={handleSubmit} className="space-y-6 fade-in pb-20">
      <div className="flex items-center justify-between sticky top-0 z-20 py-4 bg-white/80 backdrop-blur-md border-b">
        <Link href="/admin/devotionals" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft size={14} /> Back to List
        </Link>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Publish Series
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Global Series Settings */}
      <div className="card p-6 bg-purple-50/50 border-purple-100">
        <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
          <Calendar size={18} /> Global Settings for this Series
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="form-label text-purple-700">Starting From</label>
            <input
              required
              type="date"
              className="form-input border-purple-200"
              value={seriesData.startDate}
              onChange={e => setSeriesData({ ...seriesData, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label text-purple-700">Daily Publish Time</label>
            <input
              required
              type="time"
              className="form-input border-purple-200"
              value={seriesData.publishTime}
              onChange={e => setSeriesData({ ...seriesData, publishTime: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label text-purple-700">Target Timezone</label>
            <select
              className="form-input border-purple-200"
              value={seriesData.targetTimezone}
              onChange={e => setSeriesData({ ...seriesData, targetTimezone: e.target.value })}
            >
              <option value="NIGERIA">Nigeria (WAT)</option>
              <option value="USA_EAST">USA East (EST)</option>
              <option value="USA_WEST">USA West (PST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-10">
        {seriesData.items.map((item, index) => {
          const itemDate = new Date(seriesData.startDate)
          itemDate.setDate(itemDate.getDate() + index)
          const dateStr = itemDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

          return (
            <div key={index} className="relative pt-6">
              <div className="absolute left-0 top-0 bg-gold-500 text-purple-900 px-4 py-1 rounded-t-xl text-xs font-bold uppercase tracking-widest">
                Day {index + 1} — {dateStr}
              </div>
              <div className="card p-6 border-gold-200 shadow-sm relative z-10">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove day"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <label className="form-label">Title</label>
                      <input
                        required
                        className="form-input"
                        placeholder="Day title..."
                        value={item.title}
                        onChange={e => updateItem(index, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Content (HTML supported)</label>
                      <textarea
                        required
                        rows={8}
                        className="form-input text-sm leading-relaxed"
                        placeholder="Daily message..."
                        value={item.content}
                        onChange={e => updateItem(index, 'content', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Scripture Reference</label>
                      <input
                        className="form-input"
                        placeholder="e.g. John 3:16"
                        value={item.scriptureRef}
                        onChange={e => updateItem(index, 'scriptureRef', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Scripture Text</label>
                      <textarea
                        rows={5}
                        className="form-input text-sm italic"
                        placeholder="The verse text..."
                        value={item.scripture}
                        onChange={e => updateItem(index, 'scripture', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50 transition-all font-medium"
      >
        <Plus size={20} /> Add Another Day to Series
      </button>
    </form>
  )
}
