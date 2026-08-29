'use client'
import { useRef, useState } from 'react'
import { Upload, FileText, Loader2, AlertCircle, X } from 'lucide-react'

const MAX_MB = 4
const ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const looksSupported = (name) => /\.(pdf|docx)$/i.test(name || '')

/**
 * "Upload your CV to auto-fill" — INDIVIDUAL listing form only. Uploads a PDF/.docx to
 * /api/yellowpages/resume/import, then hands the structured fields to `onParsed`. It does not
 * touch the form itself — the parent decides how to merge (and whether to ask first).
 */
export default function CvImportField({ onParsed }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | done
  const [error, setError] = useState('')

  const choose = (f) => {
    setError('')
    setStatus('idle')
    if (!f) return
    if (!looksSupported(f.name)) {
      setError('Upload a PDF or a Word (.docx) file. Old .doc files aren’t supported — save it as PDF or .docx first.')
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`That file is ${(f.size / 1024 / 1024).toFixed(1)} MB — keep it under ${MAX_MB} MB.`)
      return
    }
    setFile(f)
  }

  const clear = () => {
    setFile(null)
    setError('')
    setStatus('idle')
    if (inputRef.current) inputRef.current.value = ''
  }

  const extract = async () => {
    if (!file) return
    setStatus('loading')
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/yellowpages/resume/import', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'We could not read that file. Please fill the form manually.')
        setStatus('idle')
        return
      }
      setStatus('done')
      onParsed?.(data.parsed)
    } catch {
      setError('Something went wrong reading the file. Please try again.')
      setStatus('idle')
    }
  }

  return (
    <div className="yp-card p-4">
      <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--yp-ink)' }}>
        <Upload size={15} style={{ color: 'var(--yp-yellow-600)' }} /> Have a CV? Fill this in from it
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--yp-ink-soft)' }}>
        Upload a PDF or Word (.docx) file — we’ll pull out your experience, skills, education and more.
        You review everything and add anything missing before saving. Nothing is invented.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        aria-label="Upload your CV"
        onChange={(e) => choose(e.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {!file ? (
          <button type="button" onClick={() => inputRef.current?.click()} className="yp-btn-outline !py-1.5 !px-3 text-sm">
            <FileText size={14} /> Choose file
          </button>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 text-sm px-2 py-1 rounded" style={{ background: 'var(--yp-yellow-100)' }}>
              <FileText size={13} /> {file.name}
              <button type="button" onClick={clear} aria-label="Remove file"><X size={12} /></button>
            </span>
            <button type="button" onClick={extract} disabled={status === 'loading'} className="yp-btn-primary !py-1.5 !px-3 text-sm">
              {status === 'loading' ? <><Loader2 size={14} className="animate-spin" /> Reading…</> : 'Extract details'}
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="flex items-start gap-1 text-red-600 text-xs mt-2">
          <AlertCircle size={13} className="mt-px shrink-0" /> {error}
        </p>
      )}
      {status === 'done' && !error && (
        <p className="text-xs mt-2" style={{ color: 'var(--yp-yellow-700)' }}>Done — check the fields below.</p>
      )}
    </div>
  )
}
