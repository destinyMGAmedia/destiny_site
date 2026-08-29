import { render, screen } from '@testing-library/react'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import AssemblyPage from './page'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    assembly: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/components/assembly/AssemblyHero', () => ({
  default: () => <div data-testid="assembly-hero" />,
}))
vi.mock('@/components/assembly/AssemblyAnchorNav', () => ({
  default: () => <div data-testid="assembly-anchor-nav" />,
}))
vi.mock('@/components/assembly/FindUs', () => ({
  default: () => <div data-testid="find-us" />,
}))
vi.mock('@/components/assembly/Fellowships', () => ({
  default: () => <div data-testid="fellowships" />,
}))
vi.mock('@/components/assembly/Departments', () => ({
  default: () => <div data-testid="departments" />,
}))
vi.mock('@/components/assembly/AssemblyEvents', () => ({
  default: () => <div data-testid="assembly-events" />,
}))
vi.mock('@/components/assembly/AssemblyMedia', () => ({
  default: () => <div data-testid="assembly-media" />,
}))
vi.mock('@/components/assembly/ArkCenters', () => ({
  default: () => <div data-testid="ark-centers" />,
}))
vi.mock('@/components/assembly/Giving', () => ({
  default: () => <div data-testid="giving" />,
}))
vi.mock('@/components/assembly/PrayerSection', () => ({
  default: () => <div data-testid="prayer-section" />,
}))
vi.mock('@/components/assembly/TestimoniesSection', () => ({
  default: () => <div data-testid="testimonies-section" />,
}))
vi.mock('@/components/assembly/ContactSection', () => ({
  default: () => <div data-testid="contact-section" />,
}))
vi.mock('@/components/assembly/CustomSection', () => ({
  default: () => <div data-testid="custom-section" />,
}))
vi.mock('@/components/assembly/JoinUsQR', () => ({
  default: () => <div data-testid="join-us-qr" />,
}))
vi.mock('@/components/assembly/TeamSection', () => ({
  default: () => <div data-testid="team-section" />,
}))
vi.mock('@/components/assembly/NationBanner', () => ({
  default: () => <div data-testid="nation-banner" />,
}))

// Recorder mock: the Yellow Pages banner is a real component of its own (covered by its own
// test file); here we only need to prove the assembly page mounts it and hands down the
// slug + name it derives from the loaded assembly.
const { yellowPagesProps } = vi.hoisted(() => ({ yellowPagesProps: {} }))
vi.mock('@/components/assembly/YellowPagesBanner', () => ({
  default: (props) => {
    Object.assign(yellowPagesProps, props)
    return <div data-testid="yellow-pages-banner" />
  },
}))

function makeAssembly(overrides = {}) {
  return {
    slug: 'test-assembly',
    name: 'Test Assembly',
    youtubeChannelId: null,
    sections: [{ id: 'hero-1', type: 'HERO', position: 0, isVisible: true, customContent: {} }],
    teamMembers: [],
    events: [],
    givingDetails: null,
    testimonies: [],
    mediaItems: [],
    audioContent: [],
    arkCenters: [],
    ...overrides,
  }
}

describe('AssemblyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const key of Object.keys(yellowPagesProps)) delete yellowPagesProps[key]
  })

  it('calls notFound() when the slug looks like a static file (contains a dot)', async () => {
    await expect(
      AssemblyPage({ params: Promise.resolve({ slug: 'favicon.ico' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(notFound).toHaveBeenCalled()
    expect(prisma.assembly.findUnique).not.toHaveBeenCalled()
  })

  it('calls notFound() when no assembly matches the slug', async () => {
    prisma.assembly.findUnique.mockResolvedValue(null)

    await expect(
      AssemblyPage({ params: Promise.resolve({ slug: 'missing-assembly' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(notFound).toHaveBeenCalled()
  })

  it('renders NationBanner between the hero and the anchor nav for a normal assembly', async () => {
    prisma.assembly.findUnique.mockResolvedValue(makeAssembly())

    render(await AssemblyPage({ params: Promise.resolve({ slug: 'test-assembly' }) }))

    const hero = screen.getByTestId('assembly-hero')
    const banner = screen.getByTestId('nation-banner')
    const anchorNav = screen.getByTestId('assembly-anchor-nav')

    expect(hero).toBeInTheDocument()
    expect(banner).toBeInTheDocument()
    expect(anchorNav).toBeInTheDocument()

    // Order in the DOM: hero -> nation banner -> anchor nav
    expect(hero.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(banner.compareDocumentPosition(anchorNav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('still renders the rest of the page (JoinUsQR, TeamSection) alongside the banner', async () => {
    prisma.assembly.findUnique.mockResolvedValue(makeAssembly())

    render(await AssemblyPage({ params: Promise.resolve({ slug: 'test-assembly' }) }))

    expect(screen.getByTestId('join-us-qr')).toBeInTheDocument()
    expect(screen.getByTestId('team-section')).toBeInTheDocument()
  })

  it('mounts the Yellow Pages banner, scoped to the loaded assembly, after the dynamic sections', async () => {
    prisma.assembly.findUnique.mockResolvedValue(
      makeAssembly({
        slug: 'grace-city',
        name: 'Grace City Assembly',
        sections: [
          { id: 'hero-1', type: 'HERO', position: 0, isVisible: true, customContent: {} },
          { id: 'contact-1', type: 'CONTACT', position: 1, isVisible: true, customContent: {} },
        ],
      })
    )

    render(await AssemblyPage({ params: Promise.resolve({ slug: 'grace-city' }) }))

    const contact = screen.getByTestId('contact-section')
    const banner = screen.getByTestId('yellow-pages-banner')

    expect(banner).toBeInTheDocument()
    // The banner comes after the last rendered dynamic section.
    expect(contact.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // …and is handed the assembly's own slug + name (never a request param).
    expect(yellowPagesProps).toEqual({ assemblySlug: 'grace-city', assemblyName: 'Grace City Assembly' })
  })

  it('still renders the Yellow Pages banner when the assembly has no non-HERO sections', async () => {
    prisma.assembly.findUnique.mockResolvedValue(makeAssembly())

    render(await AssemblyPage({ params: Promise.resolve({ slug: 'test-assembly' }) }))

    expect(screen.getByTestId('yellow-pages-banner')).toBeInTheDocument()
    expect(yellowPagesProps).toEqual({ assemblySlug: 'test-assembly', assemblyName: 'Test Assembly' })
  })

  it('does not render the Yellow Pages banner when the slug resolves to no assembly', async () => {
    prisma.assembly.findUnique.mockResolvedValue(null)

    await expect(
      AssemblyPage({ params: Promise.resolve({ slug: 'missing-assembly' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(yellowPagesProps).toEqual({})
  })
})
