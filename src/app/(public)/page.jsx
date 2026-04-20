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

// Revalidate every 60s — keeps homepage fresh without full SSR on every request
export const revalidate = 60

async function getHomeData() {
  try {
    const [heroSlides, mainChannel, assemblies, globalEvents, todayDevotional, featuredGame] =
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
        // Today's latest published devotional
        prisma.devotional.findFirst({
          where: {
            scheduledDate: {
              lte: new Date(),
            },
          },
          orderBy: { scheduledDate: 'desc' },
        }).catch(() => null),
        prisma.game.findFirst({
          where: { isFeatured: true, isActive: true },
        }).catch(() => null),
      ])

    return { heroSlides, mainChannel, assemblies, globalEvents, todayDevotional, featuredGame }
  } catch (error) {
    console.error('Error fetching home data:', error)
    // Return fallback data
    return {
      heroSlides: [],
      mainChannel: null,
      assemblies: [],
      globalEvents: [],
      todayDevotional: null,
      featuredGame: null
    }
  }
}

export default async function HomePage() {
  const { heroSlides, mainChannel, assemblies, globalEvents, todayDevotional, featuredGame } =
    await getHomeData()

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
      <FounderSection />

      {/* 6. Royal Feed Preview */}
      <RoyalFeedPreview devotional={todayDevotional} />

      {/* 7. Creative Arts Preview */}
      <CreativeArtsPreview />

      {/* 8. Games Preview */}
      <GamesPreview featuredGame={featuredGame} />
    </>
  )
}
