'use client'
import { useCallback, useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Full-screen image preview with prev/next and keyboard support (Esc / ← / →).
 * Usually driven by the `useImageLightbox` hook below.
 */
export function ImageLightbox({ images, index, onIndex, onClose }) {
  const count = images.length
  const go = useCallback((delta) => onIndex((index + delta + count) % count), [index, count, onIndex])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && count > 1) go(1)
      else if (e.key === 'ArrowLeft' && count > 1) go(-1)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [go, onClose, count])

  return (
    <div className="yp-lightbox-backdrop" role="dialog" aria-modal="true" aria-label="Image preview" onClick={onClose}>
      <button type="button" className="yp-lightbox-close" onClick={onClose} aria-label="Close preview">
        <X size={22} />
      </button>

      {count > 1 && (
        <button
          type="button"
          className="yp-lightbox-nav"
          style={{ left: 12 }}
          onClick={(e) => { e.stopPropagation(); go(-1) }}
          aria-label="Previous image"
        >
          <ChevronLeft size={26} />
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[index]} alt="" className="yp-lightbox-img" onClick={(e) => e.stopPropagation()} />

      {count > 1 && (
        <button
          type="button"
          className="yp-lightbox-nav"
          style={{ right: 12 }}
          onClick={(e) => { e.stopPropagation(); go(1) }}
          aria-label="Next image"
        >
          <ChevronRight size={26} />
        </button>
      )}

      {count > 1 && <div className="yp-lightbox-count">{index + 1} / {count}</div>}
    </div>
  )
}

/**
 * Give a component one lightbox: spread `node` into the tree, call `open(urlOrList, startIndex)`
 * from an image's onClick.
 */
export function useImageLightbox() {
  const [state, setState] = useState(null) // { images: string[], index: number }

  const open = useCallback((images, index = 0) => {
    const list = (Array.isArray(images) ? images : [images]).filter((u) => typeof u === 'string' && u)
    if (!list.length) return
    setState({ images: list, index: Math.max(0, Math.min(index, list.length - 1)) })
  }, [])

  const close = useCallback(() => setState(null), [])

  const node = state ? (
    <ImageLightbox
      images={state.images}
      index={state.index}
      onIndex={(i) => setState((s) => (s ? { ...s, index: i } : s))}
      onClose={close}
    />
  ) : null

  return { open, close, node, isOpen: Boolean(state) }
}
