import { render, screen } from '@testing-library/react'
import { headers } from 'next/headers'
import YellowPagesLayout, { metadata } from './layout'
import { useYellowPagesBase } from '@/components/yellowpages/shared/context'
import { DEFAULT_YELLOWPAGES_HOST } from '@/lib/yellowpages/host'

// `next/headers` is a Next.js server-only API with no implementation in the jsdom test
// environment — a genuine process boundary, so it's the one dependency we stub. Everything
// else the layout touches (YellowPagesBaseOnly, its React context, getYellowPagesBase) is
// exercised for real.
vi.mock('next/headers', () => ({ headers: vi.fn() }))

// Stage the `Host` header the layout will read, and hand back the `get` spy so tests can
// assert exactly which header was requested.
function mockHost(host) {
  const get = vi.fn().mockReturnValue(host)
  headers.mockResolvedValue({ get })
  return get
}

// A real context consumer, so we can read the value the layout actually provides through
// the real Provider rather than inspecting a stubbed passthrough.
function BaseProbe() {
  return <span data-testid="ctx-base">[{useYellowPagesBase()}]</span>
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('metadata', () => {
  it('sets the Yellow Pages page title (overriding the site-wide template)', () => {
    expect(metadata.title).toBe('The Yellow Pages — Destiny Mission Global')
    // A deeper segment supplies a plain string, not a { default, template } object.
    expect(typeof metadata.title).toBe('string')
  })

  it('carries the Yellow Pages description', () => {
    expect(metadata.description).toBe(
      'Find trusted skills and businesses from across the Destiny Mission Global family — search by category, location, and assembly.'
    )
    expect(metadata.description).toMatch(/search by category, location, and assembly/)
  })

  it('overrides the favicon with the Yellow Pages mark for both icon and apple-touch', () => {
    expect(metadata.icons.icon).toBe('/yellowpages-favicon.svg')
    expect(metadata.icons.apple).toBe('/yellowpages-favicon.svg')
  })

  it('does not fall back to the site-wide /favicon.png', () => {
    expect(metadata.icons.icon).not.toBe('/favicon.png')
    expect(metadata.icons.apple).not.toBe('/favicon.png')
  })

  it('exposes icons as a replaceable object with exactly the icon + apple keys', () => {
    // `icons` is replaced (not merged) by the deeper segment, so the object must be
    // self-contained — no stray keys, no reliance on inherited entries.
    expect(Object.keys(metadata.icons).sort()).toEqual(['apple', 'icon'])
  })

  it('is a plain serialisable object Next.js can read at build time', () => {
    expect(metadata).toBeTypeOf('object')
    expect(() => JSON.stringify(metadata)).not.toThrow()
    expect(JSON.parse(JSON.stringify(metadata)).icons.icon).toBe('/yellowpages-favicon.svg')
  })
})

describe('YellowPagesLayout', () => {
  it('reads the "host" request header', async () => {
    const get = mockHost(DEFAULT_YELLOWPAGES_HOST)

    render(await YellowPagesLayout({ children: <p>child content</p> }))

    expect(get).toHaveBeenCalledWith('host')
  })

  it('renders its children inside the real yp-theme wrapper', async () => {
    mockHost(DEFAULT_YELLOWPAGES_HOST)

    const { container } = render(
      await YellowPagesLayout({ children: <p>child content</p> })
    )

    const wrapper = container.querySelector('.yp-theme')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toHaveClass('flex', 'flex-col')
    expect(wrapper).toContainElement(screen.getByText('child content'))
  })

  it('provides base="" through the real context when the host is the yellow pages subdomain', async () => {
    mockHost(DEFAULT_YELLOWPAGES_HOST)

    render(await YellowPagesLayout({ children: <BaseProbe /> }))

    expect(screen.getByTestId('ctx-base')).toHaveTextContent('[]')
  })

  it('provides base="/yellowpages" through the real context when the host is the main domain', async () => {
    mockHost('www.destinymissionglobal.org')

    render(await YellowPagesLayout({ children: <BaseProbe /> }))

    expect(screen.getByTestId('ctx-base')).toHaveTextContent('[/yellowpages]')
  })

  it('still resolves base="" when the subdomain host carries a port', async () => {
    mockHost(`${DEFAULT_YELLOWPAGES_HOST}:3000`)

    render(await YellowPagesLayout({ children: <BaseProbe /> }))

    expect(screen.getByTestId('ctx-base')).toHaveTextContent('[]')
  })

  it('falls back to base="/yellowpages" when the host header is missing (null)', async () => {
    mockHost(null)

    render(await YellowPagesLayout({ children: <BaseProbe /> }))

    expect(screen.getByTestId('ctx-base')).toHaveTextContent('[/yellowpages]')
  })

  it('falls back to base="/yellowpages" for an empty-string host', async () => {
    mockHost('')

    render(await YellowPagesLayout({ children: <BaseProbe /> }))

    expect(screen.getByTestId('ctx-base')).toHaveTextContent('[/yellowpages]')
  })

  it('honors the YELLOWPAGES_HOST env override when matching the host', async () => {
    vi.stubEnv('YELLOWPAGES_HOST', 'custom.example.com')
    mockHost('custom.example.com')

    render(await YellowPagesLayout({ children: <BaseProbe /> }))

    expect(screen.getByTestId('ctx-base')).toHaveTextContent('[]')
  })

  it('treats the default host as main-domain once YELLOWPAGES_HOST is overridden', async () => {
    vi.stubEnv('YELLOWPAGES_HOST', 'custom.example.com')
    mockHost(DEFAULT_YELLOWPAGES_HOST)

    render(await YellowPagesLayout({ children: <BaseProbe /> }))

    expect(screen.getByTestId('ctx-base')).toHaveTextContent('[/yellowpages]')
  })

  it('deliberately renders no navigation bar or footer at the root layout', async () => {
    mockHost(DEFAULT_YELLOWPAGES_HOST)

    render(await YellowPagesLayout({ children: <p>content</p> }))

    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(
      screen.queryByText(new RegExp(`© ${new Date().getFullYear()}`))
    ).not.toBeInTheDocument()
  })

  it('passes an undefined `children` through without throwing', async () => {
    mockHost(DEFAULT_YELLOWPAGES_HOST)

    const { container } = render(await YellowPagesLayout({ children: undefined }))

    expect(container.querySelector('.yp-theme')).toBeInTheDocument()
  })
})
