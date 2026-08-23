'use client'
import { useState, useEffect } from 'react'
import { CheckCircle2, Landmark } from 'lucide-react'

export default function PaystackSetupForm({ currentSettings }) {
  const [banks, setBanks] = useState([])
  const [banksError, setBanksError] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [resolvedName, setResolvedName] = useState('')
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [settings, setSettings] = useState(currentSettings)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/nation/paystack/banks')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.banks) setBanks(data.banks)
        else setBanksError(data.error || 'Failed to load banks')
      })
      .catch(() => { if (!cancelled) setBanksError('Failed to load banks') })
    return () => { cancelled = true }
  }, [])

  const bankName = banks.find((b) => b.code === bankCode)?.name || ''

  async function handleResolve() {
    setResolveError('')
    setResolvedName('')
    if (!bankCode || !accountNumber) {
      setResolveError('Pick a bank and enter the account number first.')
      return
    }
    setResolving(true)
    try {
      const res = await fetch('/api/admin/nation/paystack/resolve-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCode, accountNumber }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResolveError(data.error || 'Could not resolve this account')
        return
      }
      setResolvedName(data.accountName)
    } catch {
      setResolveError('Could not resolve this account')
    } finally {
      setResolving(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveError('')
    if (!resolvedName) {
      setSaveError('Resolve the account first to confirm it’s correct.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/nation/paystack/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCode, bankName, accountNumber }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error || 'Failed to save payment settings')
        return
      }
      setSettings(data.settings)
    } catch {
      setSaveError('Failed to save payment settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {settings && (
        <div className="card p-6 border border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-green-800">Currently configured</p>
              <p className="text-sm text-green-700 mt-1">
                {settings.accountName} — {settings.bankName} — {settings.accountNumber}
              </p>
              <p className="text-xs text-green-600 mt-1">Subaccount: {settings.subaccountCode}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="card p-6 space-y-4 max-w-lg">
        <div className="flex items-center gap-2 mb-2">
          <Landmark size={18} style={{ color: 'var(--purple-700)' }} />
          <h2 className="font-bold" style={{ color: 'var(--purple-900)' }}>
            {settings ? 'Update Settlement Bank Account' : 'Set Settlement Bank Account'}
          </h2>
        </div>

        <div>
          <label className="form-label">Bank</label>
          <select
            className="form-select"
            value={bankCode}
            onChange={(e) => { setBankCode(e.target.value); setResolvedName('') }}
          >
            <option value="">{banksError || 'Select a bank…'}</option>
            {banks.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Account Number</label>
          <input
            className="form-input"
            value={accountNumber}
            onChange={(e) => { setAccountNumber(e.target.value); setResolvedName('') }}
            placeholder="0123456789"
          />
        </div>

        <button
          type="button"
          onClick={handleResolve}
          disabled={resolving}
          className="btn-outline btn-sm"
        >
          {resolving ? 'Resolving…' : 'Resolve Account'}
        </button>

        {resolveError && <p className="text-red-600 text-sm">{resolveError}</p>}
        {resolvedName && (
          <p className="text-sm font-semibold" style={{ color: 'var(--purple-800)' }}>
            Resolved account name: {resolvedName}
          </p>
        )}

        {saveError && <p className="text-red-600 text-sm">{saveError}</p>}

        <button type="submit" disabled={saving || !resolvedName} className="btn-primary w-full justify-center">
          {saving ? 'Saving…' : 'Save & Create Subaccount'}
        </button>
      </form>
    </div>
  )
}
