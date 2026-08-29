import crypto from 'crypto'

// Ported from Kopkad's utils/paystack_transfer.py + utils/paystack_virtual_account.py —
// verified against Paystack's current official API docs (subaccount, customer,
// dedicated_account, bank, bank/resolve, webhook signature) before porting. See
// spec/destiny-nation-landing.md §3 for why this is the interim path while Flutterwave's
// KYC is pending, and why it only covers bank-transfer (DVA), never card checkout —
// card billing descriptors would still show Kopkad's verified merchant name, but a bank
// transfer into a Dedicated Virtual Account shows the DVA's own registered account name.
const PAYSTACK_BASE = 'https://api.paystack.co'

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not configured')
  return key
}

function headers() {
  return {
    Authorization: `Bearer ${getSecretKey()}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Verify a Paystack webhook using HMAC-SHA512 of the raw request body, signed with
 * PAYSTACK_SECRET_KEY. Paystack sends the hex digest in the 'x-paystack-signature' header.
 * `rawBody` must be the exact raw request bytes/string — not a re-serialized JSON object —
 * or the signature will never match.
 */
export function verifyWebhookSignature(rawBody, paystackSignature) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    console.error('[Paystack] PAYSTACK_SECRET_KEY is not set — rejecting webhook')
    return false
  }
  const computed = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  const a = Buffer.from(computed)
  const b = Buffer.from(paystackSignature || '')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/**
 * Create a Paystack sub-account for the church's settlement bank account.
 * percentageCharge = platform's cut (0 means 100% goes to the church).
 * Returns the subaccount_code (e.g. 'ACCT_xxxxxxxxxxxx').
 */
export async function createSubaccount({ businessName, bankCode, accountNumber, percentageCharge = 0, description = '' }) {
  const payload = {
    business_name: businessName,
    settlement_bank: bankCode,
    account_number: accountNumber,
    percentage_charge: percentageCharge,
  }
  if (description) payload.description = description

  const res = await fetch(`${PAYSTACK_BASE}/subaccount`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!data.status) {
    throw new Error(data.message || 'Failed to create subaccount')
  }
  return data.data.subaccount_code
}

/** Return Paystack's list of Nigerian banks as [{ name, code }]. */
export async function listBanks() {
  const params = new URLSearchParams({ currency: 'NGN', per_page: '200' })
  const res = await fetch(`${PAYSTACK_BASE}/bank?${params}`, { headers: headers() })
  const data = await res.json()
  if (!data.status) return []
  return (data.data || []).map((b) => ({ name: b.name, code: b.code }))
}

/** Resolve a bank account number against a bank code. Returns { account_name, account_number }. */
export async function resolveAccount({ accountNumber, bankCode }) {
  const params = new URLSearchParams({ account_number: accountNumber, bank_code: bankCode })
  const res = await fetch(`${PAYSTACK_BASE}/bank/resolve?${params}`, { headers: headers() })
  const data = await res.json()
  if (!data.status) {
    throw new Error(data.message || 'Could not resolve account')
  }
  return data.data
}

/**
 * Create a fresh, one-off Dedicated Virtual Account for a single contribution, linked to the
 * church's subaccount so the deposit settles straight to the church's bank account.
 *
 * Every contribution gets its own Paystack Customer (keyed by a synthesized unique email, since
 * Paystack dedupes customers by email) with first/last name "Destiny"/"Nation" — so every DVA a
 * donor sees reads "DESTINY NATION" (per spec), while still being a genuinely unique account
 * number per gift, so a webhook credit can be matched to exactly one contribution row.
 *
 * Returns { customerCode, bank, accountNumber, accountName }.
 */
export async function createContributionDva({ reference, subaccountCode, preferredBank = 'wema-bank' }) {
  const customerRes = await fetch(`${PAYSTACK_BASE}/customer`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email: `give+${reference.toLowerCase()}@destinymissionglobal.org`,
      first_name: 'Destiny',
      last_name: 'Nation',
    }),
  })
  const customerData = await customerRes.json()
  if (!customerData.status) {
    throw new Error(customerData.message || 'Failed to create Paystack customer')
  }
  const customerCode = customerData.data.customer_code

  const dvaPayload = { customer: customerCode, preferred_bank: preferredBank }
  if (subaccountCode) dvaPayload.subaccount = subaccountCode

  const dvaRes = await fetch(`${PAYSTACK_BASE}/dedicated_account`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(dvaPayload),
  })
  const dvaData = await dvaRes.json()
  if (!dvaData.status) {
    const message = dvaData.message || 'Failed to create virtual account'
    if (dvaData.code === 'feature_unavailable') {
      throw new Error(`Dedicated virtual accounts are not yet enabled on this Paystack account: ${message}`)
    }
    throw new Error(message)
  }

  const acct = dvaData.data
  return {
    customerCode,
    bank: acct.bank.name,
    accountNumber: acct.account_number,
    accountName: acct.account_name,
  }
}
