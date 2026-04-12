'use client'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function PastorCard({ member }) {
  return (
    <div
      className="shrink-0 w-72 sm:w-80 rounded-3xl overflow-hidden shadow-xl group cursor-pointer"
      style={{ height: '420px', background: 'var(--purple-900)' }}
    >
      {/* Image — top 2/3 */}
      <div className="relative w-full" style={{ height: '280px' }}>
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes="320px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-7xl font-black"
            style={{
              background: 'linear-gradient(135deg, var(--purple-700), var(--purple-900))',
              color: 'rgba(255,179,0,0.7)',
            }}
          >
            {member.name.charAt(0)}
          </div>
        )}
        {/* Gradient fade into card bottom */}
        <div className="absolute bottom-0 inset-x-0 h-16" style={{ background: 'linear-gradient(to top, var(--purple-900), transparent)' }} />
      </div>

      {/* Info — bottom 1/3 */}
      <div className="px-7 py-5">
        <h3
          className="text-2xl font-bold text-white leading-snug mb-1"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {member.name}
        </h3>
        <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--gold-400)' }}>
          {member.role}
        </p>
        {member.department && member.department !== 'PASTORS' && (
          <p className="text-xs text-white/50 mt-1">{member.department}</p>
        )}
        {member.bio && (
          <p className="text-white/60 text-sm mt-3 leading-relaxed line-clamp-2">{member.bio}</p>
        )}
      </div>
    </div>
  )
}

export default function TeamSection({ teamMembers }) {
  const pastors = teamMembers?.filter(
    (m) => m.category === 'DEPARTMENT' && m.department === 'PASTORS'
  ) ?? []

  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <section id="team" className="section-white">
      <div className="section-container">
        <SectionHeader
          label="Leadership"
          title="Our Pastors"
          subtitle="Shepherding the flock with faith and vision"
        />

        <div className="relative mt-10">
          {/* Scroll buttons */}
          {pastors.length > 3 && (
            <>
              <button
                onClick={() => scroll(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full shadow-lg flex items-center justify-center"
                style={{ background: 'var(--purple-700)', color: 'white' }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full shadow-lg flex items-center justify-center"
                style={{ background: 'var(--purple-700)', color: 'white' }}
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {pastors.length === 0 ? (
            /* Skeleton placeholder when no pastors added yet */
            <div className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-72 sm:w-80 rounded-3xl overflow-hidden"
                  style={{ height: '420px', background: 'var(--purple-50)', border: '2px dashed var(--purple-200)' }}
                >
                  <div
                    className="w-full flex flex-col items-center justify-center gap-3"
                    style={{ height: '280px', background: 'linear-gradient(135deg, var(--purple-100), var(--purple-50))' }}
                  >
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--purple-200)' }}>
                      <span className="text-4xl">👤</span>
                    </div>
                  </div>
                  <div className="px-7 py-5 space-y-2">
                    <div className="h-4 rounded-lg animate-pulse" style={{ background: 'var(--purple-100)', width: ['70%', '85%', '60%'][i] }} />
                    <div className="h-3 rounded-lg animate-pulse" style={{ background: 'var(--purple-50)', width: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Actual pastor cards */
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {pastors.map((m) => (
                <PastorCard key={m.id} member={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
