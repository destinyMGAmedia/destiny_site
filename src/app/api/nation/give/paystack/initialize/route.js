import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import { createContributionDva } from '@/lib/nation/paystack'
import { sendPledgeNotificationEmail } from '@/lib/email'
import { getTier, isPledgeTier } from '@/lib/nation/tiers'

const PACKAGE_LABELS = { LADDER: 'Gatekeeper Giving Ladder', FOUNDERS_CIRCLE: "Founders' Circle" }

// POST /api/nation/give/paystack/initialize — interim path while Flutterwave's KYC is
// pending (spec/destiny-nation-landing.md §3). NGN-only: creates a PENDING contribution and
// a fresh, one-off Dedicated Virtual Account for it (not a hosted checkout redirect), which
// the donor transfers into directly. Pledge-tier cutoffs behave identically to the
// Flutterwave path — lead-capture email, no payment step at all.
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { package: pkg, tier: tierKey, donorName, donorEmail, donorPhone, donorCountry, donorOrg } = body

  if (!['LADDER', 'FOUNDERS_CIRCLE'].includes(pkg)) {
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
  }
  if (!donorName?.trim() || !donorEmail?.trim()) {
    return NextResponse.json({ error: 'donorName and donorEmail are required' }, { status: 400 })
  }

  const tier = getTier(pkg, tierKey)
  if (!tier) {
    return NextResponse.json({ error: 'Invalid tier for the selected package' }, { status: 400 })
  }

  const pledge = isPledgeTier(pkg, tierKey)
  const reference = `DN-PSK-${Date.now()}-${randomUUID().slice(0, 8)}`

  const contribution = await prisma.destinyNationContribution.create({
    data: {
      reference,
      package: pkg,
      tier: tierKey,
      amount: tier.amount,
      currency: 'NGN',
      status: pledge ? 'PLEDGED' : 'PENDING',
      isPledge: pledge,
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim().toLowerCase(),
      donorPhone: donorPhone || null,
      donorCountry: donorCountry || null,
      donorOrg: donorOrg || null,
    },
  })

  if (pledge) {
    await sendPledgeNotificationEmail({
      donorName: contribution.donorName,
      donorEmail: contribution.donorEmail,
      donorPhone: contribution.donorPhone,
      donorOrg: contribution.donorOrg,
      packageLabel: PACKAGE_LABELS[pkg],
      tierName: tier.name,
      amount: tier.amount,
      currency: 'NGN',
    })
    return NextResponse.json({ pledge: true, reference: contribution.reference })
  }

  const settings = await prisma.nationPaymentSettings.findFirst({ orderBy: { createdAt: 'desc' } })
  if (!settings) {
    await prisma.destinyNationContribution.update({ where: { id: contribution.id }, data: { status: 'FAILED' } })
    return NextResponse.json({ error: 'Bank transfer giving is not configured yet. Please try again shortly.' }, { status: 503 })
  }

  try {
    const dva = await createContributionDva({ reference, subaccountCode: settings.subaccountCode })
    await prisma.destinyNationContribution.update({
      where: { id: contribution.id },
      data: {
        paystackCustomerCode: dva.customerCode,
        dvaBankName: dva.bank,
        dvaAccountNumber: dva.accountNumber,
        dvaAccountName: dva.accountName,
      },
    })
    return NextResponse.json({
      pledge: false,
      reference,
      bank: dva.bank,
      accountNumber: dva.accountNumber,
      accountName: dva.accountName,
      amount: tier.amount,
    })
  } catch (err) {
    await prisma.destinyNationContribution.update({ where: { id: contribution.id }, data: { status: 'FAILED' } })
    console.error('[NATION_GIVE_PAYSTACK] DVA creation failed:', err.message)
    return NextResponse.json({ error: 'Unable to generate a giving account right now. Please try again shortly.' }, { status: 502 })
  }
}
