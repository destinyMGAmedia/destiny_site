import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/nation/paystack'
import { sendContributionReceiptEmail } from '@/lib/email'
import { getTier } from '@/lib/nation/tiers'

const PACKAGE_LABELS = { LADDER: 'Gatekeeper Giving Ladder', FOUNDERS_CIRCLE: "Founders' Circle" }

// POST /api/nation/give/paystack/webhook — Paystack calls this on every event. We only act on
// charge.success for channel "dedicated_nuban" (a bank transfer landing in one of our per-gift
// DVAs — see spec/destiny-nation-landing.md §3). Matched by the unique DVA account number on
// the credited authorization, not narration (donors' banks don't reliably preserve narration).
// Must read the raw body (not parsed JSON) — the HMAC signature is computed over raw bytes.
export async function POST(req) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error('[NATION_GIVE_PAYSTACK] Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (event.event !== 'charge.success' || event.data?.channel !== 'dedicated_nuban') {
    return NextResponse.json({ received: true })
  }

  const dvaAccountNumber = event.data?.authorization?.receiver_bank_account_number
  if (!dvaAccountNumber) {
    return NextResponse.json({ received: true })
  }

  const contribution = await prisma.destinyNationContribution.findUnique({ where: { dvaAccountNumber } })
  if (!contribution) {
    console.error('[NATION_GIVE_PAYSTACK] No contribution found for DVA account', dvaAccountNumber)
    return NextResponse.json({ received: true })
  }

  // Idempotent — Paystack may retry webhook delivery for the same event.
  if (contribution.status === 'SUCCESS') {
    return NextResponse.json({ received: true })
  }

  const paidKobo = event.data?.amount
  const expectedKobo = contribution.amount * 100
  if (typeof paidKobo === 'number' && paidKobo !== expectedKobo) {
    console.warn(
      `[NATION_GIVE_PAYSTACK] Amount mismatch for ${contribution.reference}: expected ${expectedKobo} kobo, received ${paidKobo} kobo — marking SUCCESS anyway, flag for admin review`
    )
  }

  const updated = await prisma.destinyNationContribution.update({
    where: { id: contribution.id },
    data: { status: 'SUCCESS' },
  })

  const tier = getTier(updated.package, updated.tier)
  await sendContributionReceiptEmail({
    to: updated.donorEmail,
    donorName: updated.donorName,
    tierName: tier?.name || updated.tier,
    packageLabel: PACKAGE_LABELS[updated.package],
    amount: updated.amount,
    currency: updated.currency,
  })

  return NextResponse.json({ received: true })
}
