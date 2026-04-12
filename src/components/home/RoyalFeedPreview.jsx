import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, BookOpen } from 'lucide-react'

export default function RoyalFeedPreview({ devotional }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const displayDate = devotional 
    ? new Date(devotional.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    : today

  const isActuallyToday = devotional && 
    new Date(devotional.scheduledDate).toDateString() === new Date().toDateString();

  return (
    <section className="section-lavender">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <SectionHeader
              label="ROYAL FEED DAILY DEVOTIONAL BY ARCHBISHOP CLETUS BASSEY"
              title={isActuallyToday ? "Today's Word" : "Latest Word"}
              subtitle={displayDate}
              centered
            />
          </div>

          {/* Card */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ background: 'var(--purple-900)' }}
          >
            {/* Decorative circles */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
              style={{ background: 'var(--gold-500)', transform: 'translate(30%, -30%)' }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
              style={{ background: 'var(--purple-500)', transform: 'translate(-30%, 30%)' }}
            />

            <div className="relative z-10 p-8 md:p-12">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(255,179,0,0.15)' }}
              >
                <BookOpen size={22} style={{ color: 'var(--gold-500)' }} />
              </div>

              {devotional ? (
                <>
                  <p className="text-gold-500 text-xs font-black uppercase tracking-[0.2em] mb-3">
                    ROYAL FEED DAILY DEVOTIONAL BY ARCHBISHOP CLETUS BASSEY
                  </p>
                  <h3
                    className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {devotional.title}
                  </h3>

                  {devotional.scriptureRef && (
                    <p
                      className="text-sm font-bold tracking-wide mb-4"
                      style={{ color: 'var(--gold-500)' }}
                    >
                      📖 {devotional.scriptureRef}
                    </p>
                  )}

                  {devotional.scripture && (
                    <blockquote
                      className="border-l-4 pl-5 mb-6 italic text-white/70 text-sm leading-relaxed"
                      style={{ borderColor: 'var(--gold-500)' }}
                    >
                      &quot;{devotional.scripture}&quot;
                    </blockquote>
                  )}

                  <p className="text-white/60 text-sm leading-relaxed line-clamp-4 mb-8">
                    {devotional.content.replace(/<[^>]+>/g, '')}
                  </p>

                  <Link href="/royal-feed" className="btn-primary inline-flex">
                    Read Full Devotional <ArrowRight size={15} />
                  </Link>
                </>
              ) : (
                <div className="py-6">
                  <p className="text-white/50 text-sm mb-6">
                    Today&apos;s devotional will be available at midnight.
                  </p>
                  <Link href="/royal-feed" className="btn-outline-white inline-flex">
                    Browse Past Devotionals <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
