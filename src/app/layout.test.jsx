import { render, screen } from '@testing-library/react'
import RootLayout, { metadata, viewport } from './layout'
import SessionProvider from '@/components/layout/SessionProvider'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

// next-auth's SessionProvider fires a session fetch on mount when no `session` prop is
// supplied. That endpoint isn't reachable in a unit test, so stub the network boundary
// with a minimal empty-session response and keep the render deterministic.
beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('viewport', () => {
  it('sets a responsive device-width viewport at 1x initial scale', () => {
    expect(viewport.width).toBe('device-width')
    expect(viewport.initialScale).toBe(1)
  })

  it('does not disable pinch-zoom (accessibility): no scale/scalability lock', () => {
    expect(viewport.maximumScale).toBeUndefined()
    expect(viewport.minimumScale).toBeUndefined()
    expect(viewport.userScalable).toBeUndefined()
  })

  it('is a plain serialisable object Next.js can read at build time', () => {
    expect(viewport).toBeTypeOf('object')
    expect(() => JSON.stringify(viewport)).not.toThrow()
    expect(Object.keys(viewport).sort()).toEqual(['initialScale', 'width'])
  })
})

describe('metadata', () => {
  it('defines the default title and the per-page template', () => {
    expect(metadata.title.default).toBe('Destiny Mission Global Assembly')
    expect(metadata.title.template).toBe('%s | DMGA')
  })

  it('carries the site description and keyword list', () => {
    expect(metadata.description).toMatch(/Igniting Faith/)
    expect(Array.isArray(metadata.keywords)).toBe(true)
    expect(metadata.keywords).toContain('DMGA')
    expect(metadata.keywords).toContain('church')
  })

  it('points both the favicon and the apple-touch icon at /favicon.png', () => {
    expect(metadata.icons.icon).toBe('/favicon.png')
    expect(metadata.icons.apple).toBe('/favicon.png')
  })

  it('provides Open Graph website tags', () => {
    expect(metadata.openGraph.type).toBe('website')
    expect(metadata.openGraph.title).toBe('Destiny Mission Global Assembly')
    expect(metadata.openGraph.description).toMatch(/Transforming Lives/)
  })
})

describe('RootLayout', () => {
  it('renders the <html lang="en"> shell with smooth scroll behaviour', () => {
    const tree = RootLayout({ children: null })
    expect(tree.type).toBe('html')
    expect(tree.props.lang).toBe('en')
    expect(tree.props['data-scroll-behavior']).toBe('smooth')
  })

  it('nests children inside <body> -> ErrorBoundary -> SessionProvider, in that order', () => {
    const child = <div data-testid="page-child" />
    const tree = RootLayout({ children: child })

    const body = tree.props.children
    expect(body.type).toBe('body')

    const errorBoundary = body.props.children
    expect(errorBoundary.type).toBe(ErrorBoundary)

    const sessionProvider = errorBoundary.props.children
    expect(sessionProvider.type).toBe(SessionProvider)

    // The page tree is handed straight through, untouched.
    expect(sessionProvider.props.children).toBe(child)
  })

  it('passes an undefined `children` through without throwing', () => {
    expect(() => RootLayout({ children: undefined })).not.toThrow()
    const tree = RootLayout({ children: undefined })
    expect(tree.props.children.props.children.props.children.props.children).toBeUndefined()
  })

  it('renders real page content through the real ErrorBoundary + SessionProvider tree', () => {
    const tree = RootLayout({ children: <p>hello world</p> })

    // <html>/<body> cannot be mounted inside jsdom's container div, so mount the
    // ErrorBoundary subtree directly — it still exercises both real providers.
    const bodySubtree = tree.props.children.props.children
    render(bodySubtree)

    expect(screen.getByText('hello world')).toBeInTheDocument()
  })

  it('does not swallow content when SessionProvider has no session (renders children regardless)', () => {
    const tree = RootLayout({ children: <span>anon visitor</span> })
    render(tree.props.children.props.children)
    expect(screen.getByText('anon visitor')).toBeInTheDocument()
  })
})
