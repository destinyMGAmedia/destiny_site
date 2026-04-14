import './globals.css'
import SessionProvider from '@/components/layout/SessionProvider'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata = {
  title: {
    default: 'Destiny Mission Global Assembly',
    template: '%s | DMGA',
  },
  description: 'Igniting Faith. Transforming Lives. Reaching Nations.',
  keywords: ['church', 'destiny mission', 'global assembly', 'DMGA', 'faith', 'worship'],
  icons: {
    icon: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
  openGraph: {
    title: 'Destiny Mission Global Assembly',
    description: 'Igniting Faith. Transforming Lives. Reaching Nations.',
    type: 'website',
  },
}

export default async function RootLayout({ children }) {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error('Error getting server session:', error)
    // Continue with null session - auth will handle it
  }

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ErrorBoundary>
          <SessionProvider session={session}>
            {children}
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
