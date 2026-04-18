import './globals.css'
import SessionProvider from '@/components/layout/SessionProvider'
<<<<<<< HEAD
import ErrorBoundary from '@/components/ui/ErrorBoundary'
=======
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
>>>>>>> origin/main

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

<<<<<<< HEAD
export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ErrorBoundary>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ErrorBoundary>
=======
export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
>>>>>>> origin/main
      </body>
    </html>
  )
}
