'use client'
import { YellowPagesBaseContext, useYellowPagesBase } from './context'
import Nav from './Nav'
import Footer from './Footer'

// Re-exported for backward compatibility — every existing import site pulls
// useYellowPagesBase from here; the real context now lives in ./context so the cover-page
// layout (no Nav/Footer) and the (app) group chrome can share one Provider instance.
export { useYellowPagesBase }

// General-purpose "everything" wrapper: context + theme + Nav + Footer. Used directly by
// component tests as a convenience; the real route tree provides context via
// YellowPagesBaseOnly at the root and renders Nav/Footer only inside the (app) group, so a
// cover-page visitor never sees them.
export default function YellowPagesChrome({ base, children }) {
  return (
    <YellowPagesBaseContext.Provider value={base}>
      <div className="yp-theme flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </YellowPagesBaseContext.Provider>
  )
}
