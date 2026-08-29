import { headers } from 'next/headers'
import { getNationBase } from '@/lib/nation/host'
import NationChrome from '@/components/nation/shared/NationChrome'

export const metadata = {
  title: 'Destiny Nation — The Gatekeepers Commission',
  description: '30 Gates · 30 Years · One Legacy. We don’t just build churches. We build the leaders who build nations.',
}

export default async function NationLayout({ children }) {
  const headersList = await headers()
  const base = getNationBase(headersList.get('host'))

  return <NationChrome base={base}>{children}</NationChrome>
}
