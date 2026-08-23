'use client'
import { createContext, useContext } from 'react'
import Nav from './Nav'
import Footer from './Footer'

const YellowPagesBaseContext = createContext('/yellowpages')

// Prefix to use for internal <Link> hrefs — '' on the yellow pages subdomain,
// '/yellowpages' on the main-domain fallback. Mirrors useNationBase.
export const useYellowPagesBase = () => useContext(YellowPagesBaseContext)

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
