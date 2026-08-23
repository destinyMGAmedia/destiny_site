'use client'
import { useState, useEffect } from 'react'
import { LADDER_TIERS, FOUNDERS_CIRCLE_TIERS, isPledgeTier } from '@/lib/nation/tiers'

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

const inputClass =
  'w-full bg-white border border-purple-200 rounded-lg px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[var(--purple-500)]'

export default function FoundingPartnerCTA({ bankDetails }) {
  const [count, setCount] = useState(null)
  const [pkg, setPkg] = useState(null)
  const [tierKey, setTierKey] = useState(null)
  const [donor, setDonor] = useState(emptyDonor)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pledgeDone, setPledgeDone] = useState(false)
  const [dvaDetails, setDvaDetails] = useState(null)
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
      // Interim path while Flutterwave's KYC is pending (spec/destiny-nation-landing.md §3) —
      // a dedicated virtual account to transfer into, not a hosted checkout redirect.
      const res = await fetch('/api/nation/give/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: pkg, tier: tierKey, ...donor }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      if (data.pledge) {
        setPledgeDone(true)
      } else {
        setDvaDetails(data)
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
    <section id="give" className="py-16 sm:py-20" style={{ background: 'var(--gold-300)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: 'var(--purple-800)' }}>
          Founding Gatekeepers
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Become a Founding Gatekeeper
        </h2>
        {count && (
          <p className="font-semibold" style={{ color: 'var(--purple-800)' }}>
            {count.count} of the first 100 Founding Gatekeepers so far — {count.remaining} spots left
          </p>
        )}
      </div>

      {pledgeDone ? (
        <div className="rounded-2xl border p-8 text-center" style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(45,0,96,0.15)' }}>
          <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--purple-800)' }}>Thank you</h3>
          <p style={{ color: 'rgba(45,0,96,0.75)' }}>Your interest has been registered. A member of our team will reach out to you shortly.</p>
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
                  pkg === key ? 'border-[var(--purple-700)]' : 'hover:bg-white/40'
                }`}
                style={{ background: pkg === key ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)', borderColor: pkg === key ? 'var(--purple-700)' : 'rgba(45,0,96,0.15)' }}
              >
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--purple-900)' }}>{info.label}</h3>
                <p className="text-sm" style={{ color: 'rgba(45,0,96,0.7)' }}>{info.description}</p>
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
                      tierKey === t.key ? '' : 'hover:bg-white/40'
                    }`}
                    style={{ background: tierKey === t.key ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)', borderColor: tierKey === t.key ? 'var(--purple-700)' : 'rgba(45,0,96,0.15)' }}
                  >
                    <p className="font-bold" style={{ color: 'var(--purple-900)' }}>{t.name}</p>
                    <p className="text-sm" style={{ color: 'rgba(45,0,96,0.6)' }}>
                      NGN {t.amount.toLocaleString()}{openEnded ? '+' : ''}
                    </p>
                  </button>
                )
              })}
            </div>
          )}

          {pkg && tier && !dvaDetails && (
            <form onSubmit={handleSubmit} className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--surface)', borderColor: 'rgba(45,0,96,0.12)', boxShadow: 'var(--shadow-card)' }}>
              <p className="font-bold" style={{ color: 'var(--purple-900)' }}>
                {tier.name} — NGN {tier.amount.toLocaleString()}
              </p>

              <input
                required
                placeholder="Full name"
                value={donor.donorName}
                onChange={(e) => setDonor({ ...donor, donorName: e.target.value })}
                className={inputClass}
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={donor.donorEmail}
                onChange={(e) => setDonor({ ...donor, donorEmail: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Phone (optional)"
                value={donor.donorPhone}
                onChange={(e) => setDonor({ ...donor, donorPhone: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Country (optional)"
                value={donor.donorCountry}
                onChange={(e) => setDonor({ ...donor, donorCountry: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Organization (optional)"
                value={donor.donorOrg}
                onChange={(e) => setDonor({ ...donor, donorOrg: e.target.value })}
                className={inputClass}
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

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

          {dvaDetails && (
            <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'rgba(45,0,96,0.12)', boxShadow: 'var(--shadow-card)' }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--purple-900)' }}>Complete Your Gift</h3>
              <p className="text-sm mb-4" style={{ color: 'rgba(45,0,96,0.7)' }}>
                Transfer <strong>NGN {dvaDetails.amount.toLocaleString()}</strong> to the account below —
                it&rsquo;s a dedicated account created just for this gift. A receipt will be emailed to you
                automatically once the transfer is confirmed.
              </p>
              <div className="text-sm space-y-1" style={{ color: 'rgba(45,0,96,0.85)' }}>
                <p>Account Name: <strong>{dvaDetails.accountName}</strong></p>
                <p>Bank: <strong>{dvaDetails.bank}</strong></p>
                <p>Account Number: <strong>{dvaDetails.accountNumber}</strong></p>
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => setShowBankTransfer((v) => !v)}
              className="text-sm underline"
              style={{ color: 'var(--purple-800)' }}
            >
              Prefer a direct bank transfer?
            </button>
          </div>

          {showBankTransfer && (
            <div className="mt-4 rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'rgba(45,0,96,0.12)', boxShadow: 'var(--shadow-card)' }}>
              <h3 className="font-bold mb-2" style={{ color: 'var(--purple-900)' }}>Give by Bank Transfer</h3>
              <p className="text-sm mb-4" style={{ color: 'rgba(45,0,96,0.7)' }}>
                Transfer directly to the account below, then confirm your gift so our team can follow up and reconcile it.
              </p>
              <div className="text-sm space-y-1 mb-4" style={{ color: 'rgba(45,0,96,0.85)' }}>
                <p>Account Name: <strong>{bankDetails.accountName}</strong></p>
                <p>Bank: <strong>{bankDetails.bankName}</strong></p>
                <p>Account Number: <strong>{bankDetails.accountNumber}</strong></p>
              </div>

              {manualDone ? (
                <p className="text-sm font-semibold" style={{ color: 'var(--purple-800)' }}>
                  Thank you — we&rsquo;ll reconcile your gift and follow up by email.
                </p>
              ) : pkg && tier ? (
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <input
                    required
                    placeholder="Full name"
                    value={donor.donorName}
                    onChange={(e) => setDonor({ ...donor, donorName: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={donor.donorEmail}
                    onChange={(e) => setDonor({ ...donor, donorEmail: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    placeholder="Phone (optional)"
                    value={donor.donorPhone}
                    onChange={(e) => setDonor({ ...donor, donorPhone: e.target.value })}
                    className={inputClass}
                  />
                  {manualError && <p className="text-red-500 text-sm">{manualError}</p>}
                  <button
                    type="submit"
                    disabled={manualSubmitting}
                    className="w-full py-3 rounded-lg font-bold border disabled:opacity-60"
                    style={{ borderColor: 'var(--purple-700)', color: 'var(--purple-800)' }}
                  >
                    {manualSubmitting ? 'Please wait…' : "I've Given — Confirm"}
                  </button>
                </form>
              ) : (
                <p className="text-sm" style={{ color: 'rgba(45,0,96,0.6)' }}>Pick a package and tier above first, then confirm your transfer here.</p>
              )}
            </div>
          )}
        </>
      )}
      </div>
    </section>
  )
}
