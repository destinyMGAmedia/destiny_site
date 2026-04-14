import prisma from '@/lib/prisma'
import SectionHeader from '@/components/ui/SectionHeader'
import { Video } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

export const metadata = {
  title: 'Media — Sermons & Music',
  description: 'Watch and listen to sermons, worship music, and messages from DMGA.',
}

export const revalidate = 3600

export default async function MediaPage() {
  const mainChannel = await prisma.youtubeChannel.findUnique({
    where: { channelType: 'MAIN_LIVE' },
  })

  const hasChannel = mainChannel && !mainChannel.channelId.startsWith('PLACEHOLDER')

  return (
    <div className="section-ivory min-h-screen">

      {/* Header */}
      <div
        className="relative py-24 px-6 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--purple-900), var(--purple-700))' }}
      >
        <BackButton className="absolute top-8 left-8 z-20" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--gold-500)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,179,0,0.15)' }}>
            <Video size={24} style={{ color: 'var(--gold-500)' }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Media</h1>
          <p className="text-white/60">Sermons, worship, and messages from DMGA</p>
        </div>
      </div>

      <div className="section-container">

        {/* Live / Sermon Archive */}
        <div className="mb-16">
          <SectionHeader label="Live Services" title="Sermon Archive" subtitle="Watch past services and messages" />
          <div className="mt-8">
            {hasChannel ? (
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-3xl shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed?listType=user_uploads&list=${mainChannel.channelId}&index=1`}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="DMGA Sermons"
                />
              </div>
            ) : (
              <div
                className="rounded-3xl flex items-center justify-center text-center py-20 px-6"
                style={{ background: 'var(--purple-900)', minHeight: '300px' }}
              >
                <div>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,179,0,0.15)' }}>
                    <Video size={24} style={{ color: 'var(--gold-500)' }} />
                  </div>
                  <p className="text-white font-bold text-xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>Sermon Archive Coming Soon</p>
                  <p className="text-white/50 text-sm">Videos will appear here once the channel is configured.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Placeholder for future audio sermons */}
        <div
          className="rounded-3xl p-8 text-center"
          style={{ background: 'var(--surface-alt)' }}
        >
          <p className="font-semibold text-gray-500 mb-1">Audio Sermons</p>
          <p className="text-sm text-gray-400">Audio sermons from assemblies will be available here.</p>
        </div>

      </div>
    </div>
  )
}
