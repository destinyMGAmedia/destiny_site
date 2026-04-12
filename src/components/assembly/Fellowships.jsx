'use client'
import { useRef } from 'react'
import Image from 'next/image'
import SectionWrapper from './SectionWrapper'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DEFAULT_FELLOWSHIPS = [
  {
    key: 'KINGS_MEN',
    label: "King's Men",
    tagline: 'Raising Kingdom Builders',
    gradient: 'linear-gradient(160deg, rgba(26,35,126,0.88) 0%, rgba(40,53,147,0.75) 100%)',
    bgColor: '#1a237e',
    icon: '👑',
    description: `The King's Men Fellowship is the brotherhood of DMGA — a gathering of men committed to walking in purpose, accountability, and kingdom influence. We are builders: of families, businesses, communities, and the church. Through regular meetings, mentorship, and ministry, the King's Men challenge one another to grow in faith, character, and service.`,
    activities: ['Monthly Brotherhood Meetings', 'Family Mentorship', 'Community Outreach', 'Kingdom Business Network'],
  },
  {
    key: 'DESTINY_PRESERVERS',
    label: 'Destiny Preservers',
    tagline: 'Women of Purpose & Grace',
    gradient: 'linear-gradient(160deg, rgba(74,20,140,0.88) 0%, rgba(106,27,154,0.75) 100%)',
    bgColor: '#4a148c',
    icon: '💜',
    description: `The Destiny Preservers are the women of DMGA — daughters of the King who carry grace, wisdom, and strength. This fellowship equips women to fulfil their God-given destinies in the home, workplace, and ministry. Through prayer, discipleship, and sisterhood, Destiny Preservers guard and advance God's purposes in every sphere of life.`,
    activities: ['Prayer & Intercession', 'Discipleship & Mentoring', 'Women in Business', 'Home & Family Support'],
  },
  {
    key: 'DESTINY_DEFENDERS',
    label: 'Destiny Defenders',
    tagline: 'Champions of the Next Generation',
    gradient: 'linear-gradient(160deg, rgba(183,28,28,0.88) 0%, rgba(198,40,40,0.75) 100%)',
    bgColor: '#b71c1c',
    icon: '⚡',
    description: `Destiny Defenders is the youth and young adults fellowship of DMGA — a movement of passionate believers who refuse to compromise their faith. We champion the next generation through bold worship, the uncompromising Word, and intentional discipleship. Defenders are equipped to face the world with confidence and transform it for God's glory.`,
    activities: ['Youth Sunday Services', 'Campus Outreach', 'Leadership Training', 'Annual Youth Convention'],
  },
  {
    key: 'DESTINY_TREASURES',
    label: 'Destiny Treasures',
    tagline: 'Nurturing Young Hearts for God',
    gradient: 'linear-gradient(160deg, rgba(230,81,0,0.88) 0%, rgba(245,124,0,0.75) 100%)',
    bgColor: '#e65100',
    icon: '⭐',
    description: `Destiny Treasures is the children's fellowship of DMGA — a vibrant, fun, and faith-filled community for kids. Through creative learning, Bible stories, worship, and play, we plant seeds of faith in young hearts that will bear fruit for generations. Every child in DMGA is a treasure, and we are committed to nurturing them to know and love God.`,
    activities: ["Sunday Children's Church", 'Bible Quizzes & Games', 'Vacation Bible School', 'Kids Worship'],
  },
]

function FellowshipCard({ f }) {
  return (
    <div
      className="shrink-0 w-72 sm:w-80 rounded-3xl overflow-hidden shadow-xl relative"
      style={{ height: '420px', background: f.bgColor }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0" style={{ background: f.gradient }} />

      {/* Decorative orb */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(-30%, 30%)' }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-7">
        <p className="text-5xl mb-4">{f.icon}</p>
        <h3
          className="text-2xl font-bold text-white leading-snug mb-1"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {f.label}
        </h3>
        <p className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">
          {f.tagline}
        </p>

        <div className="h-px bg-white/20 mb-4" />

        <p className="text-white/80 text-sm leading-relaxed flex-1 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 5,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {f.description}
        </p>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">What We Do</p>
          <div className="flex flex-wrap gap-1.5">
            {f.activities.map((a) => (
              <span
                key={a}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Fellowships({ section }) {
  const scrollRef = useRef(null)

  // Merge any per-assembly overrides from customContent.items with defaults
  const cc = section?.customContent || {}
  const overrides = (cc.items || []).reduce((map, item) => ({ ...map, [item.key]: item }), {})
  const FELLOWSHIPS = DEFAULT_FELLOWSHIPS.map(f => ({ ...f, ...overrides[f.key] }))

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <SectionWrapper
      id="fellowships"
      bgClass="section-lavender"
      section={section}
      defaultLabel="Fellowships"
      defaultTitle="Our Fellowships"
      defaultSubtitle="Every member belongs to a fellowship family — find yours"
    >
        <div className="relative mt-10">
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full shadow-lg hidden sm:flex items-center justify-center"
            style={{ background: 'var(--purple-700)', color: 'white' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full shadow-lg hidden sm:flex items-center justify-center"
            style={{ background: 'var(--purple-700)', color: 'white' }}
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {FELLOWSHIPS.map((f) => (
              <FellowshipCard key={f.key} f={f} />
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 sm:hidden">Swipe to explore all fellowships</p>
    </SectionWrapper>
  )
}
