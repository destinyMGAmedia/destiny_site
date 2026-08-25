'use client'
import { Suspense } from 'react'
import ListingsBrowser from '@/components/yellowpages/ListingsBrowser'

// The actual app "home" — a social-timeline-style feed of listings. Search and assembly
// filters live in Nav; ListingsBrowser owns the wide sidebar+feed layout itself. Reached via
// the cover page's CTA (src/app/yellowpages/page.jsx has no Nav of its own).
export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <ListingsBrowser />
    </Suspense>
  )
}
