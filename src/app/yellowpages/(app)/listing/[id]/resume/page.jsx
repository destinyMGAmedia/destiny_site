'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, AlertCircle, Download, Sparkles, ChevronDown, ArrowLeft, Check } from 'lucide-react'
import { useYellowPagesBase } from '@/components/yellowpages/shared/YellowPagesChrome'
import OtpModal from '@/components/yellowpages/OtpModal'
import ResumePreview from '@/components/yellowpages/resume/ResumePreview'
import { buildResumeModel, RESUME_TEMPLATES } from '@/lib/yellowpages/resumeModel'

const TEMPLATE_LABELS = { CLASSIC: 'Classic', COMPACT: 'Compact', MODERN: 'Modern' }

export default function ResumePreviewPage() {
  const { id } = useParams()
  const base = useYellowPagesBase()

  const [step, setStep] = useState('LOADING') // LOADING | NOT_FOUND | NOT_INDIVIDUAL | VERIFY | PREVIEW
  const [meta, setMeta] = useState({ name: 'your portfolio' })
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [otp, setOtp] = useState(null) // { maskedTo }
  const [editToken, setEditToken] = useState(null)

  const [data, setData] = useState(null) // { listing, settings, gaps }
  const [template, setTemplate] = useState('CLASSIC')
  const [locale, setLocale] = useState('US')
  const [useAi, setUseAi] = useState(false)
  const [aiContent, setAiContent] = useState(null)

  const [jobDescOpen, setJobDescOpen] = useState(false)
  const [jobDesc, setJobDesc] = useState('')
  const [optimizing, setOptimizing] = useState(false)
  const [aiMsg, setAiMsg] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/yellowpages/listings/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setMeta({ name: d.listing?.name || 'your portfolio' })
        if (d.listing?.listingType !== 'INDIVIDUAL') setStep('NOT_INDIVIDUAL')
        else setStep('VERIFY')
      })
      .catch(() => setStep('NOT_FOUND'))
  }, [id])

  const loadData = async (token) => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/yellowpages/listings/${id}/resume/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editToken: token }),
      })
      const body = await res.json()
      if (!res.ok) { setError(body.error || 'Could not load your résumé.'); return }
      setData(body)
      setTemplate(body.settings.template)
      setLocale(body.settings.locale)
      setUseAi(Boolean(body.settings.useAi))
      setAiContent(body.settings.hasAiContent ? body.listing.resumeAiContent : null)
      setStep('PREVIEW')
    } catch {
      setError('Could not load your résumé.')
    } finally {
      setBusy(false)
    }
  }

  const requestOtp = async (e) => {
    e.preventDefault()
    const to = email.trim()
    if (!to) { setError('Enter the email address on file for this listing.'); return }
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/yellowpages/listings/${id}/edit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
      })
      const body = await res.json()
      if (!res.ok) { setError(body.error || 'We could not send a code.'); return }
      setOtp({ maskedTo: body.maskedTo })
    } catch {
      setError('We could not send a code.')
    } finally {
      setBusy(false)
    }
  }

  const verifyOtp = async (code) => {
    try {
      const res = await fetch(`/api/yellowpages/listings/${id}/edit-otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email.trim(), code }),
      })
      const body = await res.json()
      if (!res.ok) return { error: body.error || 'That code did not work.' }
      setOtp(null)
      setEditToken(body.editToken)
      await loadData(body.editToken)
      return { error: null }
    } catch {
      return { error: 'Something went wrong. Please try again.' }
    }
  }

  const resendOtp = async () => {
    try {
      const res = await fetch(`/api/yellowpages/listings/${id}/edit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email.trim() }),
      })
      const body = await res.json()
      if (!res.ok) return { error: body.error || 'Could not resend.' }
      if (body.maskedTo) setOtp({ maskedTo: body.maskedTo })
      return { error: null }
    } catch {
      return { error: 'Could not resend.' }
    }
  }

  const model = useMemo(() => {
    if (!data) return null
    return buildResumeModel(
      { ...data.listing, resumeAiContent: aiContent || {}, resumeUseAi: useAi && Boolean(aiContent) },
      { template, locale },
    )
  }, [data, aiContent, useAi, template, locale])

  const runOptimize = async () => {
    setOptimizing(true)
    setAiMsg('')
    setError('')
    try {
      const res = await fetch(`/api/yellowpages/listings/${id}/resume/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editToken, locale, jobDescription: jobDesc.trim() || undefined }),
      })
      const body = await res.json()
      if (body.applied && body.aiContent) {
        setAiContent(body.aiContent)
        setUseAi(true)
        setAiMsg(`Optimised with ${body.provider || 'AI'}. Review it below — toggle back to “Original” any time.`)
      } else if (body.reason === 'ai_unconfigured') {
        setAiMsg('AI optimisation isn’t switched on yet. You can still download your résumé as-is.')
      } else {
        setError(body.error || 'AI optimisation failed. Please try again in a moment.')
      }
    } catch {
      setError('AI optimisation failed. Please try again in a moment.')
    } finally {
      setOptimizing(false)
    }
  }

  const download = async () => {
    setDownloading(true)
    setError('')
    try {
      const res = await fetch(`/api/yellowpages/listings/${id}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editToken, template, locale, useAi: useAi && Boolean(aiContent) }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Could not generate the PDF.')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(model?.name || 'resume').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${model?.fileWord || 'resume'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('Could not generate the PDF.')
    } finally {
      setDownloading(false)
    }
  }

  // ---- render ------------------------------------------------------------

  if (step === 'LOADING') {
    return (
      <div className="flex items-center justify-center py-24" style={{ color: 'var(--yp-ink-soft)' }}>
        <Loader2 size={20} className="animate-spin mr-2" /> Loading…
      </div>
    )
  }

  if (step === 'NOT_FOUND' || step === 'NOT_INDIVIDUAL') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--yp-ink)' }}>
          {step === 'NOT_FOUND' ? 'Portfolio not found' : 'Résumés are for personal portfolios'}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
          {step === 'NOT_FOUND'
            ? 'This listing may have been removed.'
            : 'The résumé export is only available on individual / professional portfolios.'}
        </p>
        <a href={`${base}/browse`} className="yp-btn-primary">Browse the directory</a>
      </div>
    )
  }

  if (step === 'VERIFY') {
    return (
      <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
        <a href={`${base}/listing/${id}`} className="inline-flex items-center gap-1 text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
          <ArrowLeft size={14} /> Back to portfolio
        </a>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Preview &amp; download your résumé</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
          Only you can export <strong>{meta.name}</strong>. Enter the email on file and we&rsquo;ll send a one-time code.
        </p>

        <form onSubmit={requestOtp} className="space-y-4">
          <div>
            <label className="yp-label" htmlFor="resume-email">Email on the listing</label>
            <input id="resume-email" className="yp-input" type="email" value={email} onChange={(e) => { setError(''); setEmail(e.target.value) }} />
          </div>
          {error && <p className="flex items-center gap-1 text-red-600 text-sm"><AlertCircle size={16} /> {error}</p>}
          <button type="submit" disabled={busy} className="yp-btn-primary w-full justify-center">
            {busy ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : 'Send code'}
          </button>
        </form>

        {otp && <OtpModal maskedTo={otp.maskedTo} onVerify={verifyOtp} onResend={resendOtp} onClose={() => setOtp(null)} />}
      </div>
    )
  }

  // PREVIEW
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <a href={`${base}/listing/${id}`} className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: 'var(--yp-ink-soft)' }}>
        <ArrowLeft size={14} /> Back to portfolio
      </a>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--yp-ink)' }}>Résumé preview</h1>
          <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
            Every template is single-column with standard headings — built to parse cleanly in ATS and on LinkedIn.
          </p>
        </div>
        <button onClick={download} disabled={downloading} className="yp-btn-primary">
          {downloading ? <><Loader2 size={15} className="animate-spin" /> Preparing…</> : <><Download size={15} /> Download PDF</>}
        </button>
      </div>

      {/* controls */}
      <div className="yp-card p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--yp-ink-soft)' }}>Template</span>
          {RESUME_TEMPLATES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTemplate(t)}
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={template === t ? { background: 'var(--yp-yellow-700)', color: '#fff' } : { background: 'var(--yp-surface)', border: '1px solid var(--yp-border)' }}
            >
              {TEMPLATE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--yp-ink-soft)' }}>Style</span>
          {['US', 'UK'].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={locale === l ? { background: 'var(--yp-yellow-700)', color: '#fff' } : { background: 'var(--yp-surface)', border: '1px solid var(--yp-border)' }}
            >
              {l === 'US' ? 'US · Résumé' : 'UK / NG · CV'}
            </button>
          ))}
          <span className="text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
            {locale === 'UK' ? 'British spelling & date style' : 'American spelling & date style'}
          </span>
        </div>

        {aiContent && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--yp-ink-soft)' }}>Content</span>
            {[['Original', false], ['AI-optimised', true]].map(([label, val]) => (
              <button
                key={label}
                type="button"
                onClick={() => setUseAi(val)}
                className="text-sm font-semibold px-3 py-1 rounded-full"
                style={useAi === val ? { background: 'var(--yp-yellow-700)', color: '#fff' } : { background: 'var(--yp-surface)', border: '1px solid var(--yp-border)' }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* gaps */}
      {data?.gaps?.length > 0 && (
        <div className="yp-card p-4 mb-4" style={{ borderColor: 'var(--yp-yellow-600)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--yp-ink)' }}>Add these to make it fully ATS-ready</p>
          <ul className="text-sm space-y-1" style={{ color: 'var(--yp-ink-soft)' }}>
            {data.gaps.map((g) => (
              <li key={g.key}>
                <a href={`${base}/manage?listingId=${id}#${g.anchor}`} className="underline" style={{ color: 'var(--yp-yellow-700)' }}>
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI optimise */}
      <div className="yp-card p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--yp-ink)' }}>
              <Sparkles size={15} style={{ color: 'var(--yp-yellow-600)' }} /> Improve the wording with AI
            </p>
            <p className="text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
              Rewrites your summary and bullet points into strong, ATS-friendly phrasing. It never invents facts.
            </p>
          </div>
          <button onClick={runOptimize} disabled={optimizing} className="yp-btn-outline">
            {optimizing ? <><Loader2 size={14} className="animate-spin" /> Optimising…</> : aiContent ? 'Re-run AI' : 'Improve with AI'}
          </button>
        </div>

        <button type="button" onClick={() => setJobDescOpen((v) => !v)} className="mt-3 text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--yp-yellow-700)' }}>
          <ChevronDown size={13} className={jobDescOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          Optional: paste a job description to tailor keywords
        </button>
        {jobDescOpen && (
          <textarea
            className="yp-textarea mt-2 text-sm"
            rows={4}
            placeholder="Paste the job posting here…"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />
        )}

        {aiMsg && <p className="mt-2 text-sm flex items-center gap-1" style={{ color: 'var(--yp-yellow-700)' }}><Check size={14} /> {aiMsg}</p>}
      </div>

      {error && <p className="flex items-center gap-1 text-red-600 text-sm mb-4"><AlertCircle size={16} /> {error}</p>}

      {/* the preview */}
      <div className="overflow-x-auto pb-4">
        {model && <ResumePreview model={model} />}
      </div>
    </div>
  )
}
