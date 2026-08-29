import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { listBanks } from '@/lib/nation/paystack'

// GET /api/admin/nation/paystack/banks — bank dropdown for the payment-setup form.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const banks = await listBanks()
    return NextResponse.json({ banks })
  } catch (err) {
    console.error('[NATION_PAYSTACK] Failed to list banks:', err.message)
    return NextResponse.json({ error: 'Unable to load bank list right now' }, { status: 502 })
  }
}
