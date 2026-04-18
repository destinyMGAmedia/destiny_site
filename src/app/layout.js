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
    icon: 'https://res.cloudinary.com/diun1hy3v/image/upload/q_auto/f_auto/v1776378534/dmga/global/branding/favicon.png',
    apple: 'https://res.cloudinary.com/diun1hy3v/image/upload/q_auto/f_auto/v1776378534/dmga/global/branding/favicon.png',
  },
  openGraph: {
    title: 'Destiny Mission Global Assembly',
    description: 'Igniting Faith. Transforming Lives. Reaching Nations.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
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