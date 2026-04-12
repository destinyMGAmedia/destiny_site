'use client'
import { useState } from 'react'
import { ImageIcon, Palette, Layers } from 'lucide-react'
import ImageUploader from './ImageUploader'

const PRESET_COLORS = [
  '#1a237e', '#4a148c', '#880e4f', '#b71c1c',
  '#0d47a1', '#1b5e20', '#e65100', '#37474f',
  '#ffffff', '#f5f0ff', '#fffde7', '#f3f4f6',
]

const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #1a237e, #4a148c)',
  'linear-gradient(135deg, #4a148c, #880e4f)',
  'linear-gradient(135deg, #0d47a1, #1a237e)',
  'linear-gradient(135deg, #1b5e20, #2e7d32)',
  'linear-gradient(135deg, #b71c1c, #c62828)',
  'linear-gradient(135deg, #e65100, #f57c00)',
  'linear-gradient(135deg, #37474f, #455a64)',
  'linear-gradient(135deg, #2d0060, #4a148c)',
]

export default function BackgroundPicker({ value = {}, onChange, assemblySlug }) {
  const bg = value || {}
  const type = bg.type || 'color'

  const set = (updates) => onChange({ ...bg, ...updates })

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex gap-2">
        {[
          { key: 'color', icon: Palette, label: 'Colour' },
          { key: 'gradient', icon: Layers, label: 'Gradient' },
          { key: 'image', icon: ImageIcon, label: 'Image' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => set({ type: key })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: type === key ? 'var(--purple-700)' : 'var(--ivory)',
              color: type === key ? 'white' : 'var(--charcoal)',
              border: `1.5px solid ${type === key ? 'var(--purple-700)' : 'var(--border)'}`,
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Colour picker */}
      {type === 'color' && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Preset colours</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set({ type: 'color', color: c })}
                className="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: bg.color === c ? 'var(--purple-700)' : 'transparent',
                  boxShadow: bg.color === c ? '0 0 0 2px var(--purple-300)' : 'none',
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500">Custom:</label>
            <input
              type="color"
              value={bg.color || '#1a237e'}
              onChange={(e) => set({ type: 'color', color: e.target.value })}
              className="w-10 h-8 rounded cursor-pointer border-0"
            />
            <span className="text-xs font-mono text-gray-600">{bg.color || '#1a237e'}</span>
          </div>
        </div>
      )}

      {/* Gradient picker */}
      {type === 'gradient' && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Preset gradients</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESET_GRADIENTS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => set({ gradient: g })}
                className="h-10 rounded-lg border-2 transition-transform hover:scale-105"
                style={{
                  background: g,
                  borderColor: bg.gradient === g ? 'var(--gold-500)' : 'transparent',
                  boxShadow: bg.gradient === g ? '0 0 0 2px var(--gold-300)' : 'none',
                }}
              />
            ))}
          </div>
          <div>
            <label className="form-label">Custom CSS gradient</label>
            <input
              className="form-input font-mono text-xs"
              placeholder="linear-gradient(135deg, #1a237e, #4a148c)"
              value={bg.gradient || ''}
              onChange={(e) => set({ gradient: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Image picker */}
      {type === 'image' && (
        <div>
          <ImageUploader
            label="Background Image"
            value={bg.image}
            assemblySlug={assemblySlug}
            category="hero"
            onUpload={(url) => set({ image: url })}
            onClear={() => set({ image: null })}
          />
        </div>
      )}

      {/* Preview */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Preview</p>
        <div
          className="h-16 rounded-xl"
          style={{
            background:
              type === 'image' && bg.image
                ? `url(${bg.image}) center/cover`
                : type === 'gradient'
                ? bg.gradient || PRESET_GRADIENTS[0]
                : bg.color || '#1a237e',
          }}
        />
      </div>
    </div>
  )
}
