'use client'
import { YellowPagesBaseContext } from './context'

// Context + theme only — no Nav/Footer. Used by the root layout so the cover page
// (src/app/yellowpages/page.jsx) renders with just its own branding, no navigation bar.
// The (app) route group adds Nav/Footer around everything else via its own layout.
export default function YellowPagesBaseOnly({ base, children }) {
  return (
    <YellowPagesBaseContext.Provider value={base}>
      <div className="yp-theme flex flex-col">{children}</div>
    </YellowPagesBaseContext.Provider>
  )
}
