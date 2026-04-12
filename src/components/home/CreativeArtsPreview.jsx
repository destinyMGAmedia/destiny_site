import prisma from '@/lib/prisma'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, Video } from 'lucide-react'

async function getCreativeArtsChannel() {
  return prisma.youtubeChannel.findUnique({
    where: { channelType: 'CREATIVE_ARTS' },
  })
}

export default async function CreativeArtsPreview() {
  const channel = await getCreativeArtsChannel()
  const isPlaceholder = !channel || channel.channelId.startsWith('PLACEHOLDER')

  return (
    <section className="section-white">
      <div className="section-container">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            label="Creative Arts"
            title="From the Skit Stage"
            subtitle="Faith, laughter, and life — DMGA Creative Arts"
          />
          {!isPlaceholder && (
            <Link href="/media?tab=creative-arts" className="btn-outline btn-sm hidden sm:inline-flex">
              Watch More <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {isPlaceholder ? (
          <div
            className="rounded-3xl flex items-center justify-center overflow-hidden relative"
            style={{ background: 'var(--purple-900)', minHeight: '280px' }}
          >
            {/* Decorative */}
            <div
              className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
              style={{ background: 'var(--purple-500)', transform: 'translate(-30%, 30%)' }}
            />
            <div className="relative z-10 text-center py-16 px-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(255,179,0,0.15)' }}
              >
                <Video size={28} style={{ color: 'var(--gold-500)' }} />
              </div>
              <p
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Creative Arts Channel Coming Soon
              </p>
              <p className="text-white/50 text-sm">Faith-based skits and creative productions</p>
            </div>
          </div>
        ) : (
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
            <iframe
              src={`https://www.youtube.com/embed?listType=user_uploads&list=${channel.channelId}&index=1`}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="DMGA Creative Arts"
            />
          </div>
        )}

        {!isPlaceholder && (
          <div className="mt-6 flex justify-center sm:hidden">
            <Link href="/media?tab=creative-arts" className="btn-outline btn-sm">
              Watch More <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
