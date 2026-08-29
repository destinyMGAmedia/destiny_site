import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import { createPayment } from '@/lib/flutterwave'
import { sendPledgeNotificationEmail } from '@/lib/email'
import { getTier, isPledgeTier, convertFromNGN, SUPPORTED_CURRENCIES } from '@/lib/nation/tiers'

const PACKAGE_LABELS = { LADDER: 'Gatekeeper Giving Ladder', FOUNDERS_CIRCLE: "Founders' Circle" }

// POST /api/nation/give/initialize — start a gift: pledge lead-capture, or a Flutterwave checkout redirect.
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { package: pkg, tier: tierKey, currency, donorName, donorEmail, donorPhone, donorCountry, donorOrg } = body

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

  const amount = convertFromNGN(tier.amount, currency)
  const pledge = isPledgeTier(pkg, tierKey)
  const reference = `DN-${Date.now()}-${randomUUID().slice(0, 8)}`

  const contribution = await prisma.destinyNationContribution.create({
    data: {
      reference,
      package: pkg,
      tier: tierKey,
      amount,
      currency,
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
      amount,
      currency,
    })
    return NextResponse.json({ pledge: true, reference: contribution.reference })
  }

  try {
    const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const link = await createPayment({
      txRef: reference,
      amount,
      currency,
      redirectUrl: `${origin}/nation/give/callback`,
      customer: { email: contribution.donorEmail, name: contribution.donorName, phonenumber: donorPhone || undefined },
      meta: { package: pkg, tier: tierKey },
    })
    return NextResponse.json({ pledge: false, link })
  } catch (err) {
    await prisma.destinyNationContribution.update({
      where: { id: contribution.id },
      data: { status: 'FAILED' },
    })
    console.error('[NATION_GIVE] Flutterwave initialize failed:', err.message)
    return NextResponse.json({ error: 'Unable to start payment. Please try again shortly.' }, { status: 502 })
  }
}
