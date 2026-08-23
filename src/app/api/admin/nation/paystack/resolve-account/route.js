import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { resolveAccount } from '@/lib/nation/paystack'

// POST /api/admin/nation/paystack/resolve-account — confirms an account number/bank pair
// resolves to a real account before the admin commits to creating a subaccount with it.
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

  const { accountNumber, bankCode } = body
  if (!accountNumber || !bankCode) {
    return NextResponse.json({ error: 'accountNumber and bankCode are required' }, { status: 400 })
  }

  try {
    const data = await resolveAccount({ accountNumber, bankCode })
    return NextResponse.json({ accountName: data.account_name, accountNumber: data.account_number })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not resolve account' }, { status: 502 })
  }
}
