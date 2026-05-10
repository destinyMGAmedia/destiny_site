import './globals.css'
import SessionProvider from '@/components/layout/SessionProvider'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

export const metadata = {
  title: {
    default: 'Destiny Mission Global Assembly',
    template: '%s | DMGA',
  },
  description: 'Igniting Faith. Transforming Lives. Reaching Nations.',
  keywords: ['church', 'destiny mission', 'global assembly', 'DMGA', 'faith', 'worship'],
  icons: {
    icon: './favicon.png',
    apple: './favicon.png',
  },
  openGraph: {
    title: 'Destiny Mission Global Assembly',
    description: 'Igniting Faith. Transforming Lives. Reaching Nations.',
    type: 'website',
  },
}

import Head from 'next/head';

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>
      <body>
        <ErrorBoundary>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}