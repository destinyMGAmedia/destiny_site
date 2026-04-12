import prisma from '@/lib/prisma'
import { BookOpen, Calendar } from 'lucide-react'

export const metadata = {
  title: 'Royal Feed — Daily Devotionals',
  description: 'Daily devotionals and the Word of God from Destiny Mission Global Assembly.',
}

export const revalidate = 3600

export default async function RoyalFeedPage() {
  const devotionals = await prisma.devotional.findMany({
    where: { scheduledDate: { lte: new Date() } },
    orderBy: { scheduledDate: 'desc' },
    take: 20,
  })

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="section-ivory min-h-screen">

      {/* Header */}
      <div
        className="relative py-24 px-6 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--purple-900), var(--purple-700))' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--gold-500)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,179,0,0.15)' }}>
            <BookOpen size={24} style={{ color: 'var(--gold-500)' }} />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-2 uppercase tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            ROYAL FEED
          </h1>
          <p className="text-gold-500 font-black mb-4 tracking-[0.2em] text-lg md:text-2xl uppercase max-w-2xl mx-auto leading-tight">
            DAILY DEVOTIONAL BY ARCHBISHOP CLETUS BASSEY
          </p>
          <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
            <Calendar size={14} />
            <span className="font-medium">{today}</span>
          </div>
        </div>
      </div>

      <div className="section-container max-w-4xl">
        {devotionals.length > 0 ? (
          <div className="space-y-6">
            {devotionals.map((d, i) => {
              const date = new Date(d.scheduledDate).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
              })
              return (
                <article
                  key={d.id}
                  className="card p-8 relative overflow-hidden"
                >
                  {i === 0 && (
                    <span className="absolute top-5 right-5 pill" style={{ background: 'var(--gold-500)', color: 'var(--purple-900)' }}>
                      Today
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
                    <Calendar size={12} />
                    {date}
                  </div>
                  <h2
                    className="text-xl font-bold mb-2 uppercase"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
                  >
                    {d.title}
                  </h2>
                  {d.scriptureRef && (
                    <p className="text-sm font-bold mb-3" style={{ color: 'var(--gold-500)' }}>
                      📖 {d.scriptureRef}
                    </p>
                  )}
                  {d.scripture && (
                    <blockquote
                      className="border-l-4 pl-4 mb-4 italic text-gray-500 text-sm leading-relaxed"
                      style={{ borderColor: 'var(--gold-500)' }}
                    >
                      &quot;{d.scripture}&quot;
                    </blockquote>
                  )}
                  <div
                    className="text-base md:text-lg text-gray-700 leading-relaxed max-w-none whitespace-pre-wrap"
                    style={{ lineHeight: '1.8' }}
                    dangerouslySetInnerHTML={{ __html: d.content }}
                  />
                </article>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--purple-50)' }}>
              <BookOpen size={24} style={{ color: 'var(--purple-300)' }} />
            </div>
            <p className="font-semibold text-gray-500 mb-1">No Devotionals Yet</p>
            <p className="text-sm text-gray-400">Check back soon — daily devotionals will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
