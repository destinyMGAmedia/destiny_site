import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import { sendManualGivingNotificationEmail } from '@/lib/email'
import { getTier, SUPPORTED_CURRENCIES } from '@/lib/nation/tiers'

const PACKAGE_LABELS = { LADDER: 'Gatekeeper Giving Ladder', FOUNDERS_CIRCLE: "Founders' Circle" }

// POST /api/nation/give/manual — bank-transfer stopgap (§3, Phase 1a).
// Only used while Flutterwave's KYC hasn't cleared yet: donor transfers directly, then confirms here.
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { package: pkg, tier: tierKey, currency = 'NGN', donorName, donorEmail, donorPhone } = body

  if (!['LADDER', 'FOUNDERS_CIRCLE'].includes(pkg)) {
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
  }
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
  }
  if (!donorName?.trim() || !donorEmail?.trim()) {
    return NextResponse.json({ error: 'donorName and donorEmail are required' }, { status: 400 })
  }

  const tier = getTier(pkg, tierKey)
  if (!tier) {
    return NextResponse.json({ error: 'Invalid tier for the selected package' }, { status: 400 })
  }

  const reference = `DN-MANUAL-${Date.now()}-${randomUUID().slice(0, 8)}`

  const contribution = await prisma.destinyNationContribution.create({
    data: {
      reference,
      package: pkg,
      tier: tierKey,
      amount: tier.amount,
      currency,
      status: 'PENDING',
      isManualEntry: true,
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim().toLowerCase(),
      donorPhone: donorPhone || null,
    },
  })

  await sendManualGivingNotificationEmail({
    donorName: contribution.donorName,
    donorEmail: contribution.donorEmail,
    donorPhone: contribution.donorPhone,
    packageLabel: PACKAGE_LABELS[pkg],
    tierName: tier.name,
    amount: contribution.amount,
    currency,
  })

  return NextResponse.json({ reference: contribution.reference })
}
