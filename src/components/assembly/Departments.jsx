'use client'
import { useRef } from 'react'
import SectionWrapper from './SectionWrapper'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DEFAULT_DEPARTMENTS = [
  {
    key: 'CHOIR',
    label: 'Choir & Worship',
    tagline: "Leading the Church into God's Presence",
    gradient: 'linear-gradient(160deg, rgba(27,94,32,0.90) 0%, rgba(46,125,50,0.78) 100%)',
    bgColor: '#1b5e20',
    icon: '🎵',
    description: 'The DMGA Choir leads the congregation into Spirit-filled worship every service. More than a music team, we are worshippers who understand that praise is a weapon and worship is a lifestyle. Through rigorous rehearsal and spiritual development, the choir creates an atmosphere where God moves.',
    activities: ['Sunday Worship Leading', 'Special Ministrations', 'Choir Practice', 'Music Recordings'],
  },
  {
    key: 'SANCTUARY_KEEPERS',
    label: 'Sanctuary Keepers',
    tagline: "Maintaining God's House with Excellence",
    gradient: 'linear-gradient(160deg, rgba(55,71,79,0.90) 0%, rgba(69,90,100,0.78) 100%)',
    bgColor: '#37474f',
    icon: '🏛️',
    description: "The Sanctuary Keepers are the stewards of God's house. This dedicated team ensures that the church building is clean, orderly, and beautiful — a fitting place for the King of kings. They serve quietly but powerfully, preparing the sanctuary before every service with excellence and love.",
    activities: ['Pre-service Setup', 'Post-service Tidying', 'Building Maintenance', 'Event Preparation'],
  },
  {
    key: 'PROTOCOL',
    label: 'Protocol & Greeters',
    tagline: 'First Impressions That Last',
    gradient: 'linear-gradient(160deg, rgba(0,77,64,0.90) 0%, rgba(0,105,92,0.78) 100%)',
    bgColor: '#004d40',
    icon: '🤝',
    description: 'The Protocol & Greeters team is the face of DMGA. From the car park to the main hall, this team ensures that every visitor and member feels warmly welcomed and guided. They manage orderly seating, guest relations, and the dignified flow of our services.',
    activities: ['Welcoming Visitors', 'Seating & Ushering', 'Guest Relations', 'Service Order Management'],
  },
  {
    key: 'MEDIA_TECHNICAL',
    label: 'Media & Technical',
    tagline: 'Broadcasting the Kingdom to the World',
    gradient: 'linear-gradient(160deg, rgba(13,71,161,0.90) 0%, rgba(21,101,192,0.78) 100%)',
    bgColor: '#0d47a1',
    icon: '🎬',
    description: 'The Media & Technical department keeps DMGA connected to the world. From live streaming services to managing sound and visuals during worship, this team uses technology to extend the reach of the gospel. They handle photography, videography, social media, and all broadcast operations.',
    activities: ['Live Streaming', 'Sound & Visuals', 'Social Media & Content', 'Photography & Video'],
  },
  {
    key: 'CREATIVE_ARTS',
    label: 'Creative Arts',
    tagline: 'Faith Expressed Through Art',
    gradient: 'linear-gradient(160deg, rgba(74,20,140,0.90) 0%, rgba(123,31,162,0.78) 100%)',
    bgColor: '#4a148c',
    icon: '🎭',
    description: 'The Creative Arts department uses drama, dance, spoken word, and visual art to communicate the gospel in compelling and memorable ways. Through skits, stage performances, and creative productions, this team reaches hearts in ways that words alone cannot. Art is their language, faith is their fuel.',
    activities: ['Drama & Skits', 'Dance Ministry', 'Spoken Word & Poetry', 'Creative Outreach'],
  },
  {
    key: 'EVANGELISM',
    label: 'Evangelism',
    tagline: 'Taking the Gospel to Every Street',
    gradient: 'linear-gradient(160deg, rgba(191,54,12,0.90) 0%, rgba(216,67,21,0.78) 100%)',
    bgColor: '#bf360c',
    icon: '🌍',
    description: "The Evangelism department carries the heartbeat of DMGA's mission — reaching the lost. Through street evangelism, outreach programmes, and gospel campaigns, this team takes the message of salvation beyond the four walls of the church. Every soul won is a destiny ignited.",
    activities: ['Street Evangelism', 'Community Outreach', 'Hospital & Prison Visits', 'Gospel Campaigns'],
  },
  {
    key: 'PRAYER',
    label: 'Prayer & Intercession',
    tagline: 'The Engine Room of the Church',
    gradient: 'linear-gradient(160deg, rgba(26,35,126,0.90) 0%, rgba(40,53,147,0.78) 100%)',
    bgColor: '#1a237e',
    icon: '🙏',
    description: 'The Prayer & Intercession team is the engine room of DMGA. This dedicated group carries the spiritual covering of the church through consistent, fervent prayer. They intercede for the leadership, members, nation, and global missions — standing in the gap and holding the spiritual atmosphere of the assembly.',
    activities: ['Early Morning Prayer', 'Intercessory Meetings', 'Prayer Chains', 'Fasting Programmes'],
  },
  {
    key: 'FACILITY',
    label: 'Facility',
    tagline: 'Keeping the House in Order',
    gradient: 'linear-gradient(160deg, rgba(62,39,35,0.90) 0%, rgba(78,52,46,0.78) 100%)',
    bgColor: '#3e2723',
    icon: '🔧',
    description: 'The Facility team handles the physical maintenance and infrastructure of the church premises. From electrical repairs to plumbing, landscaping to furniture arrangement — they ensure the building is always safe, functional, and presentable. Their work behind the scenes enables every other ministry to thrive.',
    activities: ['Building Maintenance', 'Electrical & Plumbing', 'Grounds & Landscaping', 'Equipment Management'],
  },
]

function DepartmentCard({ d }) {
  return (
    <div
      className="shrink-0 w-72 sm:w-80 rounded-3xl overflow-hidden shadow-xl relative"
      style={{ height: '420px', background: d.bgColor }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: d.gradient }} />

      {/* Decorative orbs */}
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
        <p className="text-5xl mb-4">{d.icon}</p>
        <h3
          className="text-2xl font-bold text-white leading-snug mb-1"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {d.label}
        </h3>
        <p className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">
          {d.tagline}
        </p>

        <div className="h-px bg-white/20 mb-4" />

        <p
          className="text-white/80 text-sm leading-relaxed flex-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {d.description}
        </p>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">What We Do</p>
          <div className="flex flex-wrap gap-1.5">
            {d.activities.map((a) => (
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

export default function Departments({ section }) {
  const scrollRef = useRef(null)

  const cc = section?.customContent || {}
  const overrides = (cc.items || []).reduce((map, item) => ({ ...map, [item.key]: item }), {})
  const DEPARTMENTS = DEFAULT_DEPARTMENTS.map(d => ({ ...d, ...overrides[d.key] }))

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <SectionWrapper
      id="departments"
      bgClass="section-white"
      section={section}
      defaultLabel="Departments"
      defaultTitle="Our Departments"
      defaultSubtitle="Serving together — every gift has a place in God's house"
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
            {DEPARTMENTS.map((d) => (
              <DepartmentCard key={d.key} d={d} />
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 sm:hidden">Swipe to explore all departments</p>
    </SectionWrapper>
  )
}
