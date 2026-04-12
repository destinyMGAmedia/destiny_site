import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, Radio } from 'lucide-react'

export default function LiveSection({ channelId }) {
  const embedUrl = channelId
    ? `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=0`
    : null

  return (
    <section id="live" className="section-ivory">
      <div className="section-container">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            label="Live Service"
            title="Watch Live"
            subtitle="Join us for worship and the Word"
          />
          <Link href="/media" className="btn-outline btn-sm hidden sm:inline-flex">
            Sermon Archive <ArrowRight size={13} />
          </Link>
        </div>

        {embedUrl ? (
          <>
            {/* YouTube embed */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title="DMGA Live Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                  <Radio size={10} className="animate-pulse" />
                  LIVE Every Sunday
                </span>
                <span className="text-sm text-gray-500">9:00 AM WAT</span>
              </div>
              <Link href="/media" className="btn-secondary btn-sm">
                Full Sermon Archive <ArrowRight size={13} />
              </Link>
            </div>
          </>
        ) : (
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{ background: 'var(--purple-900)', minHeight: '320px' }}
          >
            {/* Decorative */}
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
              style={{ background: 'var(--gold-500)', transform: 'translate(30%, -30%)' }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center py-20 px-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'rgba(255,179,0,0.15)' }}
              >
                <Radio size={28} style={{ color: 'var(--gold-500)' }} />
              </div>
              <p
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Join Us Live Every Sunday
              </p>
              <p className="text-white/50 text-sm mb-8">9:00 AM WAT — Stream coming soon</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/media" className="btn-primary">
                  View Past Sermons <ArrowRight size={15} />
                </Link>
                <Link href="/assemblies" className="btn-outline-white">
                  Find Your Assembly
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
