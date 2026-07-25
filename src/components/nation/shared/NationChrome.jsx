'use client'
import { createContext, useContext } from 'react'
import TabNav from './TabNav'
import Footer from './Footer'

const NationBaseContext = createContext('/nation')

// Prefix to use for internal <Link> hrefs — '' on the nation subdomain, '/nation' on the main-domain fallback.
export const useNationBase = () => useContext(NationBaseContext)

export default function NationChrome({ base, children }) {
  return (
    <NationBaseContext.Provider value={base}>
      <div
        className="min-h-screen flex flex-col text-white"
        style={{ background: 'linear-gradient(180deg, #1a0533 0%, #170430 50%, #1a0533 100%)' }}
      >
        <TabNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NationBaseContext.Provider>
  )
}
