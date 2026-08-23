import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import YellowPagesAdminTable from '@/components/admin/YellowPagesAdminTable'

export const metadata = { title: 'The Yellow Pages — Listings' }
export const dynamic = 'force-dynamic'

export default async function YellowPagesAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')
  if (!isGlobalAdmin(session)) redirect('/admin/dashboard')

  return (
    <div className="space-y-8 fade-in p-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          The Yellow Pages — Listings
        </h1>
        <p className="text-gray-500 mt-1">
          Listings auto-publish with no approval queue — use this to deactivate or remove anything inappropriate.
        </p>
      </div>

      <YellowPagesAdminTable />
    </div>
  )
}
