'use client'
import { useState, useEffect } from 'react'
import { LADDER_TIERS, FOUNDERS_CIRCLE_TIERS, SUPPORTED_CURRENCIES, convertFromNGN, isPledgeTier } from '@/lib/nation/tiers'

const PACKAGE_INFO = {
  LADDER: {
    label: 'Give to a Gate',
    description: 'Project-tied giving — your gift funds a specific gate, cohort, or initiative.',
    tiers: LADDER_TIERS,
  },
  FOUNDERS_CIRCLE: {
    label: "Join the Founders' Circle",
    description: "Endowment-level giving — funds the initiative's long-term future, not one gate.",
    tiers: FOUNDERS_CIRCLE_TIERS,
  },
}

const emptyDonor = { donorName: '', donorEmail: '', donorPhone: '', donorCountry: '', donorOrg: '' }

export default function FoundingPartnerCTA({ bankDetails }) {
  const [count, setCount] = useState(null)
  const [pkg, setPkg] = useState(null)
  const [tierKey, setTierKey] = useState(null)
  const [currency, setCurrency] = useState('NGN')
  const [donor, setDonor] = useState(emptyDonor)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pledgeDone, setPledgeDone] = useState(false)
  const [showBankTransfer, setShowBankTransfer] = useState(false)
  const [manualSubmitting, setManualSubmitting] = useState(false)
  const [manualError, setManualError] = useState('')
  const [manualDone, setManualDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/nation/partner-count')
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setCount(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const tiers = pkg ? PACKAGE_INFO[pkg].tiers : []
  const tier = tiers.find((t) => t.key === tierKey) || null
  const pledge = pkg && tierKey ? isPledgeTier(pkg, tierKey) : false

  function selectPackage(key) {
    setPkg(key)
    setTierKey(null)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/nation/give/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: pkg, tier: tierKey, currency, ...donor }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      if (data.pledge) {
        setPledgeDone(true)
      } else {
        window.location.href = data.link
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault()
    setManualError('')
    setManualSubmitting(true)
    try {
      const res = await fetch('/api/nation/give/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package: pkg,
          tier: tierKey,
          donorName: donor.donorName,
          donorEmail: donor.donorEmail,
          donorPhone: donor.donorPhone,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setManualError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setManualDone(true)
    } catch {
      setManualError('Something went wrong. Please try again.')
    } finally {
      setManualSubmitting(false)
    }
  }

  return (
    <section id="give" className="py-16 sm:py-20" style={{ background: '#1c0940' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: '#67e8f9' }}>
          Founding Gatekeepers
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          Become a Founding Gatekeeper
        </h2>
        {count && (
          <p className="text-cyan-300 font-semibold">
            {count.count} of the first 100 Founding Gatekeepers so far — {count.remaining} spots left
          </p>
        )}
      </div>

      {pledgeDone ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--gold-500)' }}>Thank you</h3>
          <p className="text-white/70">Your interest has been registered. A member of our team will reach out to you shortly.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {Object.entries(PACKAGE_INFO).map(([key, info]) => (
              <button
                key={key}
                type="button"
                onClick={() => selectPackage(key)}
                className={`text-left rounded-2xl border p-6 transition-colors ${
                  pkg === key ? 'border-[var(--gold-500)] bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <h3 className="font-bold text-lg mb-2">{info.label}</h3>
                <p className="text-sm text-white/70">{info.description}</p>
              </button>
            ))}
          </div>

          {pkg && (
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {tiers.map((t) => {
                const openEnded = pkg === 'FOUNDERS_CIRCLE' || t.key === 'LEGACY_FOUNDER'
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => { setTierKey(t.key); setError('') }}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      tierKey === t.key ? 'border-[var(--gold-500)] bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-white/60">
                      {currency} {convertFromNGN(t.amount, currency).toLocaleString()}{openEnded ? '+' : ''}
                    </p>
                  </button>
                )
              })}
            </div>
          )}

          {pkg && tier && (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-bold">
                  {tier.name} — {currency} {convertFromNGN(tier.amount, currency).toLocaleString()}
                </p>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-[#1a0533] border border-white/20 rounded-lg px-3 py-2 text-sm"
                >
                  {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <input
                required
                placeholder="Full name"
                value={donor.donorName}
                onChange={(e) => setDonor({ ...donor, donorName: e.target.value })}
                className="w-full bg-[#1a0533] border border-white/20 rounded-lg px-4 py-2"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={donor.donorEmail}
                onChange={(e) => setDonor({ ...donor, donorEmail: e.target.value })}
                className="w-full bg-[#1a0533] border border-white/20 rounded-lg px-4 py-2"
              />
              <input
                placeholder="Phone (optional)"
                value={donor.donorPhone}
                onChange={(e) => setDonor({ ...donor, donorPhone: e.target.value })}
                className="w-full bg-[#1a0533] border border-white/20 rounded-lg px-4 py-2"
              />
              <input
                placeholder="Country (optional)"
                value={donor.donorCountry}
                onChange={(e) => setDonor({ ...donor, donorCountry: e.target.value })}
                className="w-full bg-[#1a0533] border border-white/20 rounded-lg px-4 py-2"
              />
              <input
                placeholder="Organization (optional)"
                value={donor.donorOrg}
                onChange={(e) => setDonor({ ...donor, donorOrg: e.target.value })}
                className="w-full bg-[#1a0533] border border-white/20 rounded-lg px-4 py-2"
              />

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg font-bold text-[#1a0533] disabled:opacity-60"
                style={{ background: 'var(--gold-500)' }}
              >
                {submitting ? 'Please wait…' : pledge ? 'Register Interest' : 'Give Now'}
              </button>
            </form>
          )}

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => setShowBankTransfer((v) => !v)}
              className="text-sm text-cyan-300 hover:text-cyan-200 underline"
            >
              Prefer a direct bank transfer?
            </button>
          </div>

          {showBankTransfer && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-bold mb-2">Give by Bank Transfer</h3>
              <p className="text-sm text-white/70 mb-4">
                Transfer directly to the account below, then confirm your gift so our team can follow up and reconcile it.
              </p>
              <div className="text-sm text-white/80 space-y-1 mb-4">
                <p>Account Name: <strong>{bankDetails.accountName}</strong></p>
                <p>Bank: <strong>{bankDetails.bankName}</strong></p>
                <p>Account Number: <strong>{bankDetails.accountNumber}</strong></p>
              </div>

              {manualDone ? (
                <p className="text-sm font-semibold" style={{ color: 'var(--gold-500)' }}>
                  Thank you — we&rsquo;ll reconcile your gift and follow up by email.
                </p>
              ) : pkg && tier ? (
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <input
                    required
                    placeholder="Full name"
                    value={donor.donorName}
                    onChange={(e) => setDonor({ ...donor, donorName: e.target.value })}
                    className="w-full bg-[#1a0533] border border-white/20 rounded-lg px-4 py-2"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={donor.donorEmail}
                    onChange={(e) => setDonor({ ...donor, donorEmail: e.target.value })}
                    className="w-full bg-[#1a0533] border border-white/20 rounded-lg px-4 py-2"
                  />
                  <input
                    placeholder="Phone (optional)"
                    value={donor.donorPhone}
                    onChange={(e) => setDonor({ ...donor, donorPhone: e.target.value })}
                    className="w-full bg-[#1a0533] border border-white/20 rounded-lg px-4 py-2"
                  />
                  {manualError && <p className="text-red-400 text-sm">{manualError}</p>}
                  <button
                    type="submit"
                    disabled={manualSubmitting}
                    className="w-full py-3 rounded-lg font-bold border border-white/30 disabled:opacity-60"
                  >
                    {manualSubmitting ? 'Please wait…' : "I've Given — Confirm"}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-white/60">Pick a package and tier above first, then confirm your transfer here.</p>
              )}
            </div>
          )}
        </>
      )}
      </div>
    </section>
  )
}
