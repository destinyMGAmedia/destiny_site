import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import PaystackSetupForm from '@/components/admin/PaystackSetupForm'

export const metadata = { title: 'Destiny Nation — Payment Setup' }
export const dynamic = 'force-dynamic'

export default async function NationPaymentSetupPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')
  if (!isGlobalAdmin(session)) redirect('/admin/dashboard')

  let settings = null
  let error = null
  try {
    settings = await prisma.nationPaymentSettings.findFirst({ orderBy: { createdAt: 'desc' } })
  } catch (err) {
    console.error('[NationPaymentSetupPage] DB error:', err)
    error = 'Failed to load payment settings. The database may need a schema update — run npm run db:push.'
  }

  return (
    <div className="space-y-8 fade-in p-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Destiny Nation — Payment Setup
        </h1>
        <p className="text-gray-500 mt-1">
          Set the church&rsquo;s settlement bank account. Every donor&rsquo;s gift is received through a
          dedicated virtual account that settles 100% straight to this account.
        </p>
      </div>

      {error ? (
        <div className="card p-6 border border-red-200 bg-red-50">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      ) : (
        <PaystackSetupForm currentSettings={settings} />
      )}
    </div>
  )
}
