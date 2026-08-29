// SMS sender abstraction. No paid SMS provider is integrated yet — until one is, this logs
// the message server-side and reports `delivered: false` so callers can fall back to another
// verification path. When a provider is added, implement `deliver()` below and set the
// relevant env vars; nothing else in the codebase needs to change.
//
// To wire a provider later (e.g. Termii, Twilio, Africa's Talking):
//   1. add its credentials to .env / .env.example
//   2. fill in `deliver({ to, body })` to call the provider and return true on success
//   3. that's it — `/api/yellowpages/listings/[id]/edit-otp` will start sending real codes

const PROVIDER = process.env.SMS_PROVIDER || ''

async function deliver(/* { to, body } */) {
  // No provider configured — signal "not delivered" so the OTP route uses its fallback.
  if (!PROVIDER) return false
  // Placeholder for a real integration. Intentionally not implemented.
  return false
}

/**
 * @param {{ to: string, body: string }} params
 * @returns {Promise<{ delivered: boolean, devHint?: string }>}
 */
export async function sendSms({ to, body }) {
  try {
    const delivered = await deliver({ to, body })
    if (delivered) return { delivered: true }
  } catch (err) {
    console.error('[SMS] Provider send failed:', err?.message || err)
  }

  // Not delivered. Log so a developer/operator can still see the code during testing.
  console.info(`[SMS:dev] would send to ${to}: ${body}`)
  return {
    delivered: false,
    ...(process.env.NODE_ENV !== 'production' ? { devHint: body } : {}),
  }
}
