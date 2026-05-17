import SectionHeader from '@/components/ui/SectionHeader'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, User } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import prisma from '@/lib/prisma'

const DEFAULTS = {
  about_hero_title: 'About DMGA',
  about_hero_tagline: '... a prophetic church with an apostolic mandate',
  about_mission_title: 'A People of Destiny',
  about_mission_body: 'To bring people and places into their destiny in God and raise dynamic leaders.',
  about_vision_title: 'Impact the World',
  about_vision_body: 'To establish and advance the kingdom of God on earth by discerning His voice, declaring His will, and delivering His purpose.',
  about_history_p1: "Destiny Mission Global Assembly began with a divine vision to bring people into alignment with God's purpose for their lives. What started as a small fellowship of believers has grown into a thriving church family committed to raising leaders, transforming communities, and reaching nations for Christ.",
  about_history_p2: 'Over the years, the church has experienced tremendous growth in membership and impact — hosting life-changing conferences, outreaches, and discipleship programs. Through faith, dedication, and the leading of the Holy Spirit, Destiny Mission continues to stand as a beacon of light, hope, and transformation.',
  about_scripture_1_ref: 'Psalm 139:14-16',
  about_scripture_1_text: 'I will praise You, for I am fearfully and wonderfully made; marvelous are Your works, and that my soul knows very well. My frame was not hidden from you, when I was made in secret, and skillfully wrought in the lowest parts of the earth. Your eyes saw my substance, being yet unformed. And in your book they all were written, the days fashioned for me, when as yet there were none of them.',
  about_scripture_2_ref: 'Ecclesiastes 9:11',
  about_scripture_2_text: 'I returned, and saw under the sun, that the race is not to the swift, nor the battle to the strong, neither yet bread to the wise, nor yet riches to men of understanding, nor yet favour to men of skill; but time and chance happeneth to them all.',
  about_scripture_3_ref: 'Romans 9:15-17',
  about_scripture_3_text: 'For he saith to Moses, I will have mercy on whom I will have mercy, and I will have compassion on whom I will have compassion. So then it is not of him that willeth, nor of him that runneth, but of God that sheweth mercy. For the scripture saith unto Pharaoh, Even for this same purpose have I raised thee up, that I might shew my power in thee, and that my name might be declared throughout all the earth.',
  about_declaration: 'I am wonderfully made and dignified \n\nDestined to rule and reign \n\nI am a champion because \n\nI have the seed of greatness in me.',
  about_declaration_closing: 'Destiny Family... Champions forever!',
  about_anthem_verse: "We're the building of the Lord, standing on the rock \nWashed by the Blood of the Lamb, destined to reign \nTo redeem this land to God and to worship in spirit and truth",
  about_anthem_chorus: "People of Destiny, a family we are, an oasis of Love in a thirsty land \nSmall enough to know you, big enough to serve you \nHere the pastures are green and the Lord is in this place \nAnd He's building us to stand",
}

function LeaderCard({ leader, index }) {
  const imgPositionClass = index === 0
    ? 'object-cover object-top group-hover:scale-105 transition-transform duration-300 scale-110 -translate-y-6'
    : 'object-cover object-top group-hover:scale-105 transition-transform duration-300 -translate-y-4'
  return (
    <div className="card p-0 overflow-hidden text-center group">
      <div className="h-72 bg-purple-50 relative overflow-hidden flex items-center justify-center">
        {leader.photo ? (
          <Image
            src={leader.photo}
            alt={leader.name}
            fill
            className={imgPositionClass}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index === 0}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-purple-900/10 flex items-center justify-center text-purple-900 group-hover:scale-110 transition-transform">
            <User size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-8">
        <h4 className="text-xl font-bold text-purple-900" style={{ fontFamily: 'var(--font-serif)' }}>{leader.name}</h4>
        <p className="text-gold-600 font-bold text-xs uppercase tracking-widest mb-4">{leader.title}</p>
        {leader.bio && <p className="text-gray-500 text-sm leading-relaxed">{leader.bio}</p>}
      </div>
    </div>
  )
}

export const metadata = {
  title: 'About DMGA',
  description: 'Learn about Destiny Mission Global Assembly — our vision, mission, and values.',
}

export const dynamic = 'force-dynamic'

const VALUES = [
  { title: 'Vision', desc: "We see beyond the present, casting a compelling picture of God's future for individuals and communities." },
  { title: 'Integrity', desc: 'We operate with transparency, honesty, and moral uprightness in all our dealings.' },
  { title: 'Pioneering', desc: "We boldly venture into new territories and embrace innovative approaches to fulfill God's mission." },
  { title: 'Leadership', desc: 'We raise and empower dynamic leaders who influence their generation for Christ.' },
  { title: 'Excellence', desc: 'We pursue excellence in all we do to honor God and serve His people with distinction.' },
  { title: 'Action', desc: 'We are doers of the Word, translating faith into practical demonstration and tangible results.' },
  { title: 'Devotion', desc: 'We maintain unwavering commitment to God, His Word, and our divine assignment.' },
]

export default async function AboutPage() {
  let leaders = []
  let sc = { ...DEFAULTS }
  try {
    const leaderRows = await prisma.globalLeader.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })
    leaders = leaderRows

    const contentRows = await (
      prisma.siteContent?.findMany?.({ where: { key: { startsWith: 'about_' } } }) ?? Promise.resolve([])
    ).catch(() => [])
    contentRows.forEach(r => { sc[r.key] = r.value })
  } catch {
    // DB unavailable — fall back to defaults
  }

  const leaderGridClass =
    leaders.length === 1
      ? 'grid grid-cols-1 gap-8 max-w-sm mx-auto'
      : leaders.length === 2
        ? 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto'
        : 'grid grid-cols-1 md:grid-cols-3 gap-8'

  return (
    <div className="section-ivory min-h-screen">

      {/* Hero */}
      <div
        className="relative py-28 px-6 text-white text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--purple-900), var(--purple-700))' }}
      >
        <BackButton className="absolute top-8 left-8 z-20" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'var(--gold-500)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--gold-400)' }}>Who We Are</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
            {sc.about_hero_title}
          </h1>
          <p className="text-lg text-white/75 leading-relaxed">
            {sc.about_hero_tagline}
          </p>
        </div>
      </div>

      <div className="section-container">

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {[
            {
              label: 'Our Mission',
              title: sc.about_mission_title,
              body: sc.about_mission_body,
            },
            {
              label: 'Our Vision',
              title: sc.about_vision_title,
              body: sc.about_vision_body,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl p-8"
              style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold-500)' }}>{item.label}</p>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>{item.title}</h2>
              <div className="w-10 h-1 rounded mb-4" style={{ background: 'var(--gold-500)' }} />
              <div className="text-gray-600 leading-relaxed">{item.body}</div>
            </div>
          ))}
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <SectionHeader label="What We Stand For" title="Our Core Values" centered />
            <h4 className="text-3xl font-black text-purple-900/10 mt-2 tracking-[0.5em] uppercase">VIP LEAD</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <div key={v.title} className="card p-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black mb-4"
                  style={{ background: 'var(--purple-50)', color: 'var(--purple-800)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Story — full width */}
        <div className="mb-12">
          <SectionHeader label="Our Journey" title="Our Story" />
          <div className="space-y-4 text-gray-600 leading-relaxed mt-6 max-w-3xl">
            <p>{sc.about_history_p1}</p>
            <p>{sc.about_history_p2}</p>
          </div>
        </div>

        {/* Declaration + Anthem — side by side */}
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="card p-8 md:p-10 relative overflow-hidden border-none shadow-2xl z-10" style={{ background: 'var(--purple-900)', color: 'white' }}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <p className="text-gold-400 font-bold uppercase tracking-[0.2em] text-xs mb-6">Daily Proclamation</p>
              <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-500)' }}>Our Declaration</h3>
              <div className="space-y-6">
                <p className="italic text-xl md:text-2xl leading-relaxed font-medium border-l-4 border-gold-500/30 pl-6 whitespace-pre-line">
                  {sc.about_declaration}
                </p>
                <div className="space-y-4">
                  <p className="text-lg md:text-xl font-black text-gold-500 uppercase tracking-tight">
                    {sc.about_declaration_closing}
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-widest">
                    Victory!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8 border-gold-200 bg-white">
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>Our Anthem</h3>
            <div className="space-y-4 text-gray-600 text-sm italic leading-relaxed">
              <p className="whitespace-pre-line">{sc.about_anthem_verse}</p>
              <p className="font-bold text-purple-900 not-italic">Chorus:</p>
              <p className="whitespace-pre-line">{sc.about_anthem_chorus}</p>
            </div>
          </div>
        </div>

        {/* Our Scriptures */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <SectionHeader label="The Word That Grounds Us" title="Our Scriptures" centered />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { ref: sc.about_scripture_1_ref, text: sc.about_scripture_1_text },
              { ref: sc.about_scripture_2_ref, text: sc.about_scripture_2_text },
              { ref: sc.about_scripture_3_ref, text: sc.about_scripture_3_text },
            ].filter(s => s.ref || s.text).map((scripture, i) => (
              <div
                key={i}
                className="rounded-3xl p-8 flex flex-col"
                style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="w-10 h-1 rounded mb-6" style={{ background: 'var(--gold-500)' }} />
                <p className="text-gray-600 leading-relaxed italic flex-1 text-sm">
                  &ldquo;{scripture.text}&rdquo;
                </p>
                <p className="mt-6 font-bold text-xs uppercase tracking-widest" style={{ color: 'var(--purple-800)' }}>
                  — {scripture.ref}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership */}
        <div className="mb-20">
          <SectionHeader label="Anointed Direction" title="Our Leadership" centered />
          <p className="text-center text-gray-500 max-w-2xl mx-auto mb-12">
            Meet the anointed men and women leading Destiny Mission Global Assembly under God&apos;s direction and grace.
          </p>
          <div className={leaderGridClass}>
            {leaders.map((leader, index) => (
              <LeaderCard key={leader.id} leader={leader} index={index} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-3xl py-14 px-8 text-center text-white relative overflow-hidden"
          style={{ background: 'var(--purple-900)' }}
        >
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'var(--gold-500)', transform: 'translate(30%, 30%)' }} />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Find Your Assembly</h2>
            <p className="text-white/60 mb-8">Join a DMGA family near you and step into your destiny.</p>
            <Link href="/assemblies" className="btn-primary inline-flex">
              View All Assemblies <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
