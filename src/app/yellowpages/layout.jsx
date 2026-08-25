import { headers } from 'next/headers'
import { getYellowPagesBase } from '@/lib/yellowpages/host'
import YellowPagesBaseOnly from '@/components/yellowpages/shared/YellowPagesBaseOnly'

export const metadata = {
  title: 'The Yellow Pages — Destiny Mission Global',
  description: 'Find trusted skills and businesses from across the Destiny Mission Global family — search by category, location, and assembly.',
}

// Root layout — context + theme only, deliberately no Nav/Footer here. The cover page
// (page.jsx) renders standalone with just its own branding; the (app) route group's layout
// adds Nav/Footer for the actual browse/register/manage/listing pages.
export default async function YellowPagesLayout({ children }) {
  const headersList = await headers()
  const base = getYellowPagesBase(headersList.get('host'))

  return <YellowPagesBaseOnly base={base}>{children}</YellowPagesBaseOnly>
}
