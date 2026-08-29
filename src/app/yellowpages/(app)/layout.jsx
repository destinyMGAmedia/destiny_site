import { Suspense } from 'react'
import Nav from '@/components/yellowpages/shared/Nav'
import Footer from '@/components/yellowpages/shared/Footer'

// Adds Nav/Footer around every page except the cover page — context/theme are already
// provided by the root layout (src/app/yellowpages/layout.jsx), so this only adds chrome.
// Nav reads useSearchParams (for the search/assembly filter it now hosts), which requires a
// Suspense boundary here since it's rendered outside any individual page's own boundary.
export default function YellowPagesAppLayout({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <Nav />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
