import { headers } from 'next/headers'
import { getYellowPagesBase } from '@/lib/yellowpages/host'
import YellowPagesChrome from '@/components/yellowpages/shared/YellowPagesChrome'

export const metadata = {
  title: 'The Yellow Pages — Destiny Mission Global',
  description: 'Find trusted skills and businesses from across the Destiny Mission Global family — search by category, location, and assembly.',
}

export default async function YellowPagesLayout({ children }) {
  const headersList = await headers()
  const base = getYellowPagesBase(headersList.get('host'))

  return <YellowPagesChrome base={base}>{children}</YellowPagesChrome>
}
