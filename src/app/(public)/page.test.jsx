import { render, screen } from '@testing-library/react'
import prisma from '@/lib/prisma'
import HomePage, { metadata, dynamic } from './page'

// The home page is a server component that fans out to ~7 Prisma queries and composes ten
// presentational sections. The database is the one boundary a unit test can't reach, so
// `@/lib/prisma` is the single stubbed dependency — every section component is mocked to a
// prop-recording stub so we can assert exactly what the page derives and hands down
// (the getHomeData shaping logic is otherwise unexported and only observable here).
vi.mock('@/lib/prisma', () => ({
  default: {
    heroSlide: { findMany: vi.fn() },
    youtubeChannel: { findUnique: vi.fn() },
    assembly: { findMany: vi.fn() },
    event: { findMany: vi.fn() },
    devotional: { findFirst: vi.fn() },
    game: { findFirst: vi.fn(), findMany: vi.fn() },
    siteContent: { findMany: vi.fn() },
  },
}))

// Shared bag the section stubs write their received props into. `vi.hoisted` so the
// (hoisted) vi.mock factories below can close over it. Each factory is spelled out
// explicitly (not built by a helper) because vitest only hoists literal `vi.mock(...)`
// calls above the `import ./page` line.
const { captured, recorder } = vi.hoisted(() => {
  const captured = {}
  // Returns a stub component that records the props it was handed under `testid`.
  const recorder = (testid) => (props) => {
    captured[testid] = props
    return <div data-testid={testid} />
  }
  return { captured, recorder }
})

vi.mock('@/components/home/HeroSection', () => ({ default: recorder('hero-section') }))
vi.mock('@/components/home/DestinyNationPreview', () => ({ default: recorder('destiny-nation-preview') }))
vi.mock('@/components/home/LiveSection', () => ({ default: recorder('live-section') }))
vi.mock('@/components/home/YellowPagesPreview', () => ({ default: recorder('yellow-pages-preview') }))
vi.mock('@/components/home/UpcomingProgrammes', () => ({ default: recorder('upcoming-programmes') }))
vi.mock('@/components/home/AssembliesStrip', () => ({ default: recorder('assemblies-strip') }))
vi.mock('@/components/home/FounderSection', () => ({ default: recorder('founder-section') }))
vi.mock('@/components/home/RoyalFeedPreview', () => ({ default: recorder('royal-feed-preview') }))
vi.mock('@/components/home/CreativeArtsPreview', () => ({ default: recorder('creative-arts-preview') }))
vi.mock('@/components/home/GamesPreview', () => ({ default: recorder('games-preview') }))

const HERO_SLIDES = [
  { id: 'slide-1', isActive: true, displayOrder: 0 },
  { id: 'slide-2', isActive: true, displayOrder: 1 },
]
const ASSEMBLIES = [
  { id: 'a1', slug: 'hq', name: 'HQ Assembly', isHQ: true },
  { id: 'a2', slug: 'lekki', name: 'Lekki Assembly', isHQ: false },
]
const GLOBAL_EVENTS = [{ id: 'e1', title: 'Convocation', isGlobal: true }]
const DEVOTIONAL = { id: 'd1', title: 'Grace for today' }
const FEATURED_GAME = { id: 'g1', isFeatured: true, isActive: true }

/**
 * Point every Prisma call at a sensible default; individual tests override single entries.
 * Each method returns a real resolved promise because the page chains `.catch(...)` onto it.
 */
function primePrisma() {
  prisma.heroSlide.findMany.mockResolvedValue(HERO_SLIDES)
  prisma.youtubeChannel.findUnique.mockResolvedValue({ channelId: 'UC_main_live' })
  prisma.assembly.findMany.mockResolvedValue(ASSEMBLIES)
  prisma.event.findMany.mockResolvedValue(GLOBAL_EVENTS)
  prisma.devotional.findFirst.mockResolvedValue(DEVOTIONAL)
  prisma.game.findFirst.mockResolvedValue(FEATURED_GAME)
  prisma.game.findMany.mockResolvedValue([])
  prisma.siteContent.findMany.mockResolvedValue([])
}

beforeEach(() => {
  vi.clearAllMocks()
  for (const key of Object.keys(captured)) delete captured[key]
  primePrisma()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('module exports', () => {
  it('sets the home page metadata', () => {
    expect(metadata.title).toBe('Destiny Mission Global Assembly')
    expect(metadata.description).toMatch(/Igniting Faith/)
  })

  it('opts the route out of static rendering', () => {
    expect(dynamic).toBe('force-dynamic')
  })
})

describe('HomePage — happy path', () => {
  it('renders all ten home sections', async () => {
    render(await HomePage())

    for (const testid of [
      'hero-section',
      'destiny-nation-preview',
      'live-section',
      'yellow-pages-preview',
      'upcoming-programmes',
      'assemblies-strip',
      'founder-section',
      'royal-feed-preview',
      'creative-arts-preview',
      'games-preview',
    ]) {
      expect(screen.getByTestId(testid)).toBeInTheDocument()
    }
  })

  it('places the new Yellow Pages band directly after the live stream and before upcoming programmes', async () => {
    render(await HomePage())

    const live = screen.getByTestId('live-section')
    const yellow = screen.getByTestId('yellow-pages-preview')
    const programmes = screen.getByTestId('upcoming-programmes')

    expect(live.compareDocumentPosition(yellow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(yellow.compareDocumentPosition(programmes) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('feeds the active hero slides straight to HeroSection', async () => {
    render(await HomePage())
    expect(captured['hero-section'].slides).toEqual(HERO_SLIDES)
  })

  it('passes only the main-live channel id (not the whole record) to LiveSection', async () => {
    render(await HomePage())
    expect(captured['live-section'].channelId).toBe('UC_main_live')
  })

  it('hands the global events to UpcomingProgrammes and assemblies to AssembliesStrip', async () => {
    render(await HomePage())
    expect(captured['upcoming-programmes'].events).toEqual(GLOBAL_EVENTS)
    expect(captured['assemblies-strip'].assemblies).toEqual(ASSEMBLIES)
  })

  it("passes today's devotional to RoyalFeedPreview", async () => {
    render(await HomePage())
    expect(captured['royal-feed-preview'].devotional).toEqual(DEVOTIONAL)
  })

  it('passes the featured game to GamesPreview', async () => {
    render(await HomePage())
    expect(captured['games-preview'].featuredGame).toEqual(FEATURED_GAME)
  })
})

describe('HomePage — LiveSection channel id edge cases', () => {
  it('is undefined when there is no MAIN_LIVE channel', async () => {
    prisma.youtubeChannel.findUnique.mockResolvedValue(null)

    render(await HomePage())

    expect(captured['live-section'].channelId).toBeUndefined()
  })

  it('is undefined when the channel record has no channelId', async () => {
    prisma.youtubeChannel.findUnique.mockResolvedValue({ channelType: 'MAIN_LIVE' })

    render(await HomePage())

    expect(captured['live-section'].channelId).toBeUndefined()
  })
})

describe('HomePage — games derivation (enabledKeys / crossword words)', () => {
  it('collects the keys of active games only, skipping non-object gameData', async () => {
    prisma.game.findMany.mockResolvedValue([
      { isActive: true, gameData: { key: 'quiz', component: 'HomeBibleQuiz' } },
      { isActive: false, gameData: { key: 'memory', component: 'MemoryMatch' } },
      { isActive: true, gameData: { key: 'wordsearch', component: 'BibleWordSearch', words: ['FAITH', 'HOPE'] } },
      { isActive: true, gameData: 'legacy-string-payload' },
      { isActive: true, gameData: null },
    ])

    render(await HomePage())

    expect(captured['games-preview'].enabledKeys).toEqual(['quiz', 'wordsearch'])
  })

  it('forwards the BibleWordSearch word list when it is non-empty', async () => {
    prisma.game.findMany.mockResolvedValue([
      { isActive: true, gameData: { key: 'ws', component: 'BibleWordSearch', words: ['GRACE', 'MERCY', 'PEACE'] } },
    ])

    render(await HomePage())

    expect(captured['games-preview'].words).toEqual(['GRACE', 'MERCY', 'PEACE'])
  })

  it('leaves words null when the BibleWordSearch game has an empty word list', async () => {
    prisma.game.findMany.mockResolvedValue([
      { isActive: true, gameData: { key: 'ws', component: 'BibleWordSearch', words: [] } },
    ])

    render(await HomePage())

    expect(captured['games-preview'].enabledKeys).toEqual(['ws'])
    expect(captured['games-preview'].words).toBeNull()
  })

  it('leaves words null when there is no BibleWordSearch game at all', async () => {
    prisma.game.findMany.mockResolvedValue([
      { isActive: true, gameData: { key: 'quiz', component: 'HomeBibleQuiz' } },
    ])

    render(await HomePage())

    expect(captured['games-preview'].words).toBeNull()
  })

  it('leaves both enabledKeys and words null when no games exist', async () => {
    prisma.game.findMany.mockResolvedValue([])

    render(await HomePage())

    expect(captured['games-preview'].enabledKeys).toBeNull()
    expect(captured['games-preview'].words).toBeNull()
  })

  it('yields an empty enabledKeys array (not null) when games exist but none are active', async () => {
    prisma.game.findMany.mockResolvedValue([
      { isActive: false, gameData: { key: 'quiz' } },
    ])

    render(await HomePage())

    expect(captured['games-preview'].enabledKeys).toEqual([])
  })
})

describe('HomePage — founder section mapping', () => {
  it('splits the home_founder* site content rows into two founder objects', async () => {
    prisma.siteContent.findMany.mockResolvedValue([
      { key: 'home_founder1_name', value: 'Bishop A. Leader' },
      { key: 'home_founder1_title', value: 'Presiding Bishop' },
      { key: 'home_founder1_bio1', value: 'First paragraph.' },
      { key: 'home_founder1_quote', value: 'Faith moves mountains.' },
      { key: 'home_founder2_name', value: 'Rev. B. Partner' },
      { key: 'home_founder2_bio', value: 'A servant leader.' },
      { key: 'home_founder2_tagline', value: 'Serving the nations.' },
    ])

    render(await HomePage())

    expect(captured['founder-section'].founder1).toMatchObject({
      name: 'Bishop A. Leader',
      title: 'Presiding Bishop',
      bio1: 'First paragraph.',
      quote: 'Faith moves mountains.',
    })
    expect(captured['founder-section'].founder1.bio2).toBeUndefined()
    expect(captured['founder-section'].founder2).toMatchObject({
      name: 'Rev. B. Partner',
      bio: 'A servant leader.',
      tagline: 'Serving the nations.',
    })
  })

  it('produces founder objects full of undefined fields when there is no founder content', async () => {
    prisma.siteContent.findMany.mockResolvedValue([])

    render(await HomePage())

    expect(captured['founder-section'].founder1.name).toBeUndefined()
    expect(captured['founder-section'].founder2.name).toBeUndefined()
  })

  it('survives the site_content table being unavailable (query rejects)', async () => {
    prisma.siteContent.findMany.mockRejectedValue(new Error('relation "SiteContent" does not exist'))

    render(await HomePage())

    expect(screen.getByTestId('founder-section')).toBeInTheDocument()
    expect(captured['founder-section'].founder1.name).toBeUndefined()
  })
})

describe('HomePage — per-query failure is absorbed', () => {
  it('falls back to an empty list when the assemblies query rejects', async () => {
    prisma.assembly.findMany.mockRejectedValue(new Error('timeout'))

    render(await HomePage())

    expect(captured['assemblies-strip'].assemblies).toEqual([])
    // The rest of the page is unaffected.
    expect(captured['hero-section'].slides).toEqual(HERO_SLIDES)
  })

  it('falls back to null when the devotional query rejects', async () => {
    prisma.devotional.findFirst.mockRejectedValue(new Error('timeout'))

    render(await HomePage())

    expect(captured['royal-feed-preview'].devotional).toBeNull()
  })

  it('falls back to an empty hero slide list when that query rejects', async () => {
    prisma.heroSlide.findMany.mockRejectedValue(new Error('timeout'))

    render(await HomePage())

    expect(captured['hero-section'].slides).toEqual([])
  })
})

describe('HomePage — total data-layer outage', () => {
  it('renders every section with safe fallbacks when Prisma throws synchronously', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    // A hard connection failure: the call itself throws before `.catch` can attach.
    prisma.heroSlide.findMany.mockImplementation(() => {
      throw new Error('database connection refused')
    })

    render(await HomePage())

    expect(consoleError).toHaveBeenCalledWith('Error fetching home data:', expect.any(Error))
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(captured['hero-section'].slides).toEqual([])
    expect(captured['live-section'].channelId).toBeUndefined()
    expect(captured['upcoming-programmes'].events).toEqual([])
    expect(captured['assemblies-strip'].assemblies).toEqual([])
    expect(captured['royal-feed-preview'].devotional).toBeNull()
    expect(captured['games-preview'].featuredGame).toBeNull()
    expect(captured['games-preview'].enabledKeys).toBeNull()
    expect(captured['games-preview'].words).toBeNull()
    expect(captured['founder-section'].founder1.name).toBeUndefined()
  })
})
