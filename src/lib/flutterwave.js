// Flutterwave Standard Checkout — thin wrapper, no webhook/subscriptions at launch.
// See spec/destiny-nation-landing.md §3.

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3'

function getSecretKey() {
  const key = process.env.FLUTTERWAVE_SECRET_KEY
  if (!key) throw new Error('FLUTTERWAVE_SECRET_KEY is not configured')
  return key
}

/**
 * Create a Flutterwave Standard Checkout payment link.
 * Returns the hosted payment link to redirect the donor to.
 */
export async function createPayment({ txRef, amount, currency, redirectUrl, customer, meta }) {
  const res = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount,
      currency,
      redirect_url: redirectUrl,
      customer,
      customizations: {
        title: 'Destiny Nation — The Gatekeepers Commission',
        description: 'Give to Destiny Nation',
      },
      meta,
    }),
  })

  const data = await res.json()
  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to initialize Flutterwave payment')
  }

  return data.data.link
}

/**
 * Verify a completed Flutterwave transaction by its transaction_id.
 * Returns the normalized status + amount/currency actually charged.
 */
export async function verifyPayment(transactionId) {
  const res = await fetch(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` },
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Failed to verify Flutterwave transaction')
  }

  const tx = data.data
  return {
    status: tx.status === 'successful' ? 'SUCCESS' : 'FAILED',
    txRef: tx.tx_ref,
    amount: tx.amount,
    currency: tx.currency,
  }
}
