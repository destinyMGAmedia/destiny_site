'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Check, X, Image as ImageIcon, Eye, EyeOff, GripVertical } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'

function SlideForm({ slide = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    imageUrl: slide.imageUrl || '',
    caption: slide.caption || '',
    ctaText: slide.ctaText || '',
    ctaLink: slide.ctaLink || '',
    displayOrder: slide.displayOrder ?? 0,
    isActive: slide.isActive !== false,
  })

  const set = (k) => (e) =>
    setForm(f => ({ ...f, [k]: typeof e === 'object' && 'target' in e ? e.target.value : e }))
  const isNew = !slide.id

  return (
    <div className="border-2 rounded-2xl p-5 space-y-4" style={{ borderColor: 'var(--purple-200)', background: 'var(--ivory)' }}>
      <h3 className="font-semibold text-sm" style={{ color: 'var(--purple-900)' }}>
        {isNew ? 'Add New Hero Slide' : 'Edit Slide'}
      </h3>

      <ImageUploader
        label="Slide Image *"
        value={form.imageUrl}
        assemblySlug="global"
        category="hero-slides"
        aspectHint="landscape recommended (16:9 or wider)"
        onUpload={(url) => setForm(f => ({ ...f, imageUrl: url }))}
        onClear={() => setForm(f => ({ ...f, imageUrl: '' }))}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="form-label">Caption (optional)</label>
          <input
            className="form-input"
            value={form.caption}
            onChange={set('caption')}
            placeholder="A short line of text shown over the slide"
          />
        </div>
        <div>
          <label className="form-label">CTA Button Text (optional)</label>
          <input
            className="form-input"
            value={form.ctaText}
            onChange={set('ctaText')}
            placeholder="e.g. Learn More"
          />
        </div>
        <div>
          <label className="form-label">CTA Button Link (optional)</label>
          <input
            className="form-input"
            value={form.ctaLink}
            onChange={set('ctaLink')}
            placeholder="e.g. /about"
          />
        </div>
        <div>
          <label className="form-label">Display Order</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={form.displayOrder}
            onChange={set('displayOrder')}
          />
          <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <button
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${form.isActive ? 'bg-purple-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {form.isActive ? 'Visible on home page' : 'Hidden from home page'}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.imageUrl}
          className="btn-primary btn-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          {saving
            ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Check size={13} />}
          {saving ? 'Saving…' : 'Save Slide'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline btn-sm">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  )
}

function SlideRow({ slide, onEdit, onDelete, onToggle }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-white" style={{ borderColor: 'var(--border)' }}>
      <GripVertical size={14} className="text-gray-300 shrink-0" />
      <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 relative bg-purple-100">
        {slide.imageUrl ? (
          <Image src={slide.imageUrl} alt={slide.caption || 'Slide'} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={16} className="text-purple-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">
          {slide.caption || <span className="text-gray-400 italic">No caption</span>}
        </p>
        <p className="text-xs text-gray-400">
          Order: {slide.displayOrder}
          {slide.ctaText && <span className="ml-2">· CTA: {slide.ctaText}</span>}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${slide.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
          {slide.isActive ? 'Active' : 'Hidden'}
        </span>
        <button
          onClick={() => onToggle(slide)}
          className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-400"
          title={slide.isActive ? 'Hide slide' : 'Show slide'}
        >
          {slide.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        <button onClick={() => onEdit(slide)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(slide)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchSlides() }, [])

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/admin/hero-slides')
      const data = await res.json()
      setSlides(Array.isArray(data) ? data : [])
    } catch {
      setSlides([])
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const isNew = editingId === 'new'
      const res = await fetch(
        isNew ? '/api/admin/hero-slides' : `/api/admin/hero-slides/${editingId}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (isNew) {
        setSlides(prev => [...prev, data].sort((a, b) => a.displayOrder - b.displayOrder))
      } else {
        setSlides(prev =>
          prev.map(s => s.id === editingId ? data : s).sort((a, b) => a.displayOrder - b.displayOrder)
        )
      }
      setEditingId(null)
      showToast(isNew ? 'Slide added.' : 'Slide updated.')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slide) => {
    if (!confirm('Remove this hero slide from the home page?')) return
    try {
      const res = await fetch(`/api/admin/hero-slides/${slide.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setSlides(prev => prev.filter(s => s.id !== slide.id))
      showToast('Slide removed.')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleToggle = async (slide) => {
    try {
      const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slide.isActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSlides(prev => prev.map(s => s.id === slide.id ? data : s))
      showToast(data.isActive ? 'Slide is now visible.' : 'Slide hidden from home page.')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="space-y-6 fade-in p-8 max-w-3xl">
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
          style={{
            background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: toast.type === 'success' ? '#15803d' : '#b91c1c',
          }}
        >
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Hero Slides
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage the rotating banner images shown at the top of the home page.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border rounded-2xl px-4 py-3" style={{ borderColor: 'var(--border)' }}>
          <ImageIcon size={16} className="text-purple-500" />
          <span className="text-2xl font-bold" style={{ color: 'var(--purple-900)' }}>{slides.length}</span>
          <span className="text-xs text-gray-400">slides</span>
        </div>
      </div>

      <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--purple-50)', color: 'var(--purple-800)' }}>
        <strong>Note:</strong> Only active slides appear on the public home page. Use Display Order to control the sequence.
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading slides...</div>
        ) : (
          <div className="p-4 space-y-2">
            {slides.map(slide =>
              editingId === slide.id ? (
                <SlideForm
                  key={slide.id}
                  slide={slide}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <SlideRow
                  key={slide.id}
                  slide={slide}
                  onEdit={(s) => setEditingId(s.id)}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              )
            )}

            {slides.length === 0 && editingId !== 'new' && (
              <p className="text-center text-sm text-gray-400 py-8">
                No slides added yet. Click &quot;Add Slide&quot; to get started.
              </p>
            )}

            {editingId === 'new' ? (
              <SlideForm
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
                saving={saving}
              />
            ) : (
              <button
                onClick={() => setEditingId('new')}
                className="btn-outline w-full justify-center mt-2"
              >
                <Plus size={14} /> Add Slide
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
