import prisma from '@/lib/prisma'
import HeroSection from '@/components/home/HeroSection'
import LiveSection from '@/components/home/LiveSection'
import UpcomingProgrammes from '@/components/home/UpcomingProgrammes'
import AssembliesStrip from '@/components/home/AssembliesStrip'
import FounderSection from '@/components/home/FounderSection'
import RoyalFeedPreview from '@/components/home/RoyalFeedPreview'
import CreativeArtsPreview from '@/components/home/CreativeArtsPreview'
import GamesPreview from '@/components/home/GamesPreview'

export const metadata = {
  title: 'Destiny Mission Global Assembly',
  description: 'Igniting Faith. Transforming Lives. Reaching Nations.',
}

export const dynamic = 'force-dynamic'

async function getHomeData() {
  try {
    const [heroSlides, mainChannel, assemblies, globalEvents, todayDevotional, featuredGame, allGames] =
      await Promise.all([
        prisma.heroSlide.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        }).catch(() => []),
        prisma.youtubeChannel.findUnique({ where: { channelType: 'MAIN_LIVE' } }).catch(() => null),
        prisma.assembly.findMany({
          where: { isActive: true },
          select: {
            id: true, slug: true, name: true, city: true, country: true,
            heroImage: true, tagline: true, isHQ: true,
          },
          orderBy: [{ isHQ: 'desc' }, { name: 'asc' }],
        }).catch(() => []),
        prisma.event.findMany({
          where: {
            isGlobal: true,
            startDate: { gte: new Date() },
          },
          orderBy: { startDate: 'asc' },
          take: 3,
        }).catch(() => []),
        prisma.devotional.findFirst({
          where: { scheduledDate: { lte: new Date() } },
          orderBy: { scheduledDate: 'desc' },
        }).catch(() => null),
        prisma.game.findFirst({
          where: { isFeatured: true, isActive: true },
        }).catch(() => null),
        prisma.game.findMany({
          select: { gameData: true, isActive: true },
        }).catch(() => []),
      ])

    let enabledKeys = null
    let crosswordWords = null
    if (allGames.length > 0) {
      enabledKeys = allGames
        .filter(g => g.isActive)
        .map(g => {
          const d = g.gameData
          return typeof d === 'object' && d !== null ? d.key : null
        })
        .filter(Boolean)

      const crossword = allGames.find(g => {
        const d = g.gameData
        return typeof d === 'object' && d !== null && d.component === 'BibleWordSearch'
      })
      if (Array.isArray(crossword?.gameData?.words) && crossword.gameData.words.length > 0) {
        crosswordWords = crossword.gameData.words
      }
    }

    const founderRows = await (
      prisma.siteContent?.findMany?.({ where: { key: { startsWith: 'home_founder' } } }) ?? Promise.resolve([])
    ).catch(() => [])
    const founderMap = Object.fromEntries(founderRows.map(r => [r.key, r.value]))

    return { heroSlides, mainChannel, assemblies, globalEvents, todayDevotional, featuredGame, enabledKeys, crosswordWords, founderMap }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      heroSlides: [],
      mainChannel: null,
      assemblies: [],
      globalEvents: [],
      todayDevotional: null,
      featuredGame: null,
      enabledKeys: null,
      crosswordWords: null,
      founderMap: {},
    }
  }
}

export default async function HomePage() {
  const { heroSlides, mainChannel, assemblies, globalEvents, todayDevotional, featuredGame, enabledKeys, crosswordWords, founderMap } =
    await getHomeData()

  const founder1 = {
    name: founderMap.home_founder1_name,
    title: founderMap.home_founder1_title,
    bio1: founderMap.home_founder1_bio1,
    bio2: founderMap.home_founder1_bio2,
    quote: founderMap.home_founder1_quote,
    photo: founderMap.home_founder1_photo,
  }
  const founder2 = {
    name: founderMap.home_founder2_name,
    title: founderMap.home_founder2_title,
    bio: founderMap.home_founder2_bio,
    tagline: founderMap.home_founder2_tagline,
    photo: founderMap.home_founder2_photo,
  }

  return (
    <>
      {/* 1. Hero — rotating background images, 2-min crossfade */}
      <HeroSection slides={heroSlides} />

      {/* 2. Live Stream */}
      <LiveSection channelId={mainChannel?.channelId} />

      {/* 3. Upcoming Programmes (global events) */}
      <UpcomingProgrammes events={globalEvents} />

      {/* 4. Assemblies Horizontal Scroll */}
      <AssembliesStrip assemblies={assemblies} />

      {/* 5. Founder Section */}
      <FounderSection founder1={founder1} founder2={founder2} />

      {/* 6. Royal Feed Preview */}
      <RoyalFeedPreview devotional={todayDevotional} />

      {/* 7. Creative Arts Preview */}
      <CreativeArtsPreview />

      {/* 8. Games Preview */}
      <GamesPreview featuredGame={featuredGame} enabledKeys={enabledKeys} words={crosswordWords} />
    </>
  )
}
