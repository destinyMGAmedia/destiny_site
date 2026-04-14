import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import AssemblyHero from '@/components/assembly/AssemblyHero'
import AssemblyAnchorNav from '@/components/assembly/AssemblyAnchorNav'
import FindUs from '@/components/assembly/FindUs'
import Fellowships from '@/components/assembly/Fellowships'
import Departments from '@/components/assembly/Departments'
import AssemblyEvents from '@/components/assembly/AssemblyEvents'
import AssemblyMedia from '@/components/assembly/AssemblyMedia'
import ArkCenters from '@/components/assembly/ArkCenters'
import Giving from '@/components/assembly/Giving'
import PrayerSection from '@/components/assembly/PrayerSection'
import TestimoniesSection from '@/components/assembly/TestimoniesSection'
import ContactSection from '@/components/assembly/ContactSection'
import CustomSection from '@/components/assembly/CustomSection'
import JoinUsQR from '@/components/assembly/JoinUsQR'
import TeamSection from '@/components/assembly/TeamSection'

// Force dynamic rendering for database-dependent content
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const assembly = await prisma.assembly.findUnique({
    where: { slug, isActive: true },
    select: { name: true, tagline: true, city: true },
  })
  if (!assembly) return { title: 'Not Found' }
  return {
    title: assembly.name,
    description: assembly.tagline || `${assembly.name} — Destiny Mission Global Assembly, ${assembly.city}`,
  }
}

export default async function AssemblyPage({ params }) {
  let assembly
  
  try {
    const { slug } = await params
    assembly = await prisma.assembly.findUnique({
      where: { slug, isActive: true },
      include: {
        sections: {
          where: { isVisible: true },
          orderBy: { position: 'asc' },
        },
        teamMembers: { orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] },
        events: {
          where: { startDate: { gte: new Date() } },
          orderBy: { startDate: 'asc' },
          take: 6,
        },
        givingDetails: true,
        testimonies: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 8,
        },
        mediaItems: {
          orderBy: { createdAt: 'desc' },
          take: 9,
        },
        audioContent: {
          orderBy: { publishedAt: 'desc' },
          take: 4,
        },
        arkCenters: {
          where: { isActive: true },
          include: {
            leader: {
              select: { firstName: true, lastName: true, photo: true }
            }
          },
          orderBy: { name: 'asc' }
        }
      },
    })

    if (!assembly) {
      console.warn(`Assembly not found for slug: ${slug}`)
      notFound()
    }
  } catch (error) {
    console.error('Error loading assembly:', error)
    notFound()
  }

  // Build anchor nav from visible sections (excluding HERO which is above the fold)
  const anchorSections = assembly.sections.filter((s) => s.type !== 'HERO')

  // Render each section in order
  const renderSection = (section) => {
    switch (section.type) {
      case 'FIND_US':
        return (
          <FindUs
            key={section.id}
            assembly={assembly}
          />
        )
      case 'FELLOWSHIPS':
        return <Fellowships key={section.id} section={section} />
      case 'ARK_CENTERS':
        return <ArkCenters key={section.id} section={section} centers={assembly.arkCenters} />
      case 'DEPARTMENTS':
        return <Departments key={section.id} section={section} />
      case 'EVENTS':
        return (
          <AssemblyEvents
            key={section.id}
            section={section}
            events={assembly.events}
            assemblySlug={assembly.slug}
          />
        )
      case 'MEDIA':
        return (
          <AssemblyMedia
            key={section.id}
            section={section}
            mediaItems={assembly.mediaItems}
            audioContent={assembly.audioContent}
            assemblySlug={assembly.slug}
            youtubeChannelId={assembly.youtubeChannelId}
          />
        )
      case 'GIVING':
        return (
          <Giving
            key={section.id}
            givingDetails={assembly.givingDetails}
            assemblyName={assembly.name}
          />
        )
      case 'PRAYER':
        return (
          <PrayerSection
            key={section.id}
            section={section}
            assemblySlug={assembly.slug}
          />
        )
      case 'TESTIMONIES':
        return (
          <TestimoniesSection
            key={section.id}
            section={section}
            testimonies={assembly.testimonies}
            assemblySlug={assembly.slug}
          />
        )
      case 'CONTACT':
        return (
          <ContactSection
            key={section.id}
            assembly={assembly}
          />
        )
      case 'CUSTOM':
        return (
          <CustomSection
            key={section.id}
            section={section}
          />
        )
      default:
        return null
    }
  }

  const heroSection = assembly.sections.find((s) => s.type === 'HERO')

  return (
    <>
      {/* Hero */}
      <AssemblyHero assembly={assembly} heroSection={heroSection} />

      {/* Sticky Anchor Nav */}
      <AssemblyAnchorNav sections={anchorSections} />

      {/* Join Us QR — shown after hero on mobile for easy scan */}
      <JoinUsQR assemblySlug={assembly.slug} assemblyName={assembly.name} />

      {/* Team section — shown unless admin has hidden it */}
      {heroSection?.customContent?.showLeadership !== false && (
        <TeamSection teamMembers={assembly.teamMembers} />
      )}

      {/* Remaining sections in order */}
      {assembly.sections
        .filter((s) => s.type !== 'HERO')
        .map((section) => renderSection(section))}
    </>
  )
}
