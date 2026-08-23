import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { resolveAccount, createSubaccount } from '@/lib/nation/paystack'

// GET /api/admin/nation/paystack/setup — current settings, if configured.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.nationPaymentSettings.findFirst({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ settings })
}

// POST /api/admin/nation/paystack/setup — resolves the account (safety check), creates the
// Paystack subaccount (100% settlement, no platform cut), and stores it as the single
// NationPaymentSettings row every future per-gift DVA will link to.
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { bankCode, bankName, accountNumber } = body
  if (!bankCode || !bankName || !accountNumber) {
    return NextResponse.json({ error: 'bankCode, bankName, and accountNumber are required' }, { status: 400 })
  }

  let resolved
  try {
    resolved = await resolveAccount({ accountNumber, bankCode })
  } catch (err) {
    return NextResponse.json({ error: `Could not verify this account: ${err.message}` }, { status: 400 })
  }

  let subaccountCode
  try {
    subaccountCode = await createSubaccount({
      businessName: 'Destiny Mission Global Assembly',
      bankCode,
      accountNumber,
      percentageCharge: 0,
      description: 'Destiny Nation — The Gatekeepers Commission giving',
    })
  } catch (err) {
    return NextResponse.json({ error: `Could not create the Paystack subaccount: ${err.message}` }, { status: 502 })
  }

  const existing = await prisma.nationPaymentSettings.findFirst({ orderBy: { createdAt: 'desc' } })
  const data = {
    bankCode,
    bankName,
    accountNumber,
    accountName: resolved.account_name,
    subaccountCode,
  }

  const settings = existing
    ? await prisma.nationPaymentSettings.update({ where: { id: existing.id }, data })
    : await prisma.nationPaymentSettings.create({ data })

  return NextResponse.json({ settings })
}
