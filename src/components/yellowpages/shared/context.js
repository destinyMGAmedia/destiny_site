'use client'
import { createContext, useContext } from 'react'

// Single shared context instance — imported by both the root (cover-page) layout wrapper and
// the (app) group's chrome, so every consumer sees the same Provider regardless of which one
// rendered it. '' on the yellow pages subdomain, '/yellowpages' on the main-domain fallback.
export const YellowPagesBaseContext = createContext('/yellowpages')

export const useYellowPagesBase = () => useContext(YellowPagesBaseContext)
