import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPayment } from '@/lib/flutterwave'
import { sendContributionReceiptEmail } from '@/lib/email'
import { getTier } from '@/lib/nation/tiers'

const PACKAGE_LABELS = { LADDER: 'Gatekeeper Giving Ladder', FOUNDERS_CIRCLE: "Founders' Circle" }

// GET /api/nation/give/verify?tx_ref=...&transaction_id=... — verify-on-callback (no webhook at launch).
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const txRef = searchParams.get('tx_ref')
  const transactionId = searchParams.get('transaction_id')

  if (!txRef || !transactionId) {
    return NextResponse.json({ error: 'tx_ref and transaction_id are required' }, { status: 400 })
  }

  const contribution = await prisma.destinyNationContribution.findUnique({ where: { reference: txRef } })
  if (!contribution) {
    return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
  }

  // Idempotent — a donor refreshing the callback page shouldn't re-verify or re-send a receipt.
  if (contribution.status === 'SUCCESS' || contribution.status === 'FAILED') {
    return NextResponse.json({ status: contribution.status, package: contribution.package, tier: contribution.tier, amount: contribution.amount, currency: contribution.currency })
  }

  let result
  try {
    result = await verifyPayment(transactionId)
  } catch (err) {
    console.error('[NATION_GIVE] Verify failed:', err.message)
    return NextResponse.json({ error: 'Unable to verify payment right now' }, { status: 502 })
  }

  const updated = await prisma.destinyNationContribution.update({
    where: { id: contribution.id },
    data: { status: result.status },
  })

  if (result.status === 'SUCCESS') {
    const tier = getTier(updated.package, updated.tier)
    await sendContributionReceiptEmail({
      to: updated.donorEmail,
      donorName: updated.donorName,
      tierName: tier?.name || updated.tier,
      packageLabel: PACKAGE_LABELS[updated.package],
      amount: updated.amount,
      currency: updated.currency,
    })
  }

  return NextResponse.json({ status: updated.status, package: updated.package, tier: updated.tier, amount: updated.amount, currency: updated.currency })
}
