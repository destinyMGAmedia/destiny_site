import SectionHeader from '@/components/ui/SectionHeader'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'About DMGA',
  description: 'Learn about Destiny Mission Global Assembly — our vision, mission, and values.',
}

const VALUES = [
  { title: 'Vision', desc: "We see beyond the present, casting a compelling picture of God's future for individuals and communities." },
  { title: 'Integrity', desc: 'We operate with transparency, honesty, and moral uprightness in all our dealings.' },
  { title: 'Pioneering', desc: "We boldly venture into new territories and embrace innovative approaches to fulfill God's mission." },
  { title: 'Leadership', desc: 'We raise and empower dynamic leaders who influence their generation for Christ.' },
  { title: 'Excellence', desc: 'We pursue excellence in all we do to honor God and serve His people with distinction.' },
  { title: 'Action', desc: 'We are doers of the Word, translating faith into practical demonstration and tangible results.' },
  { title: 'Devotion', desc: 'We maintain unwavering commitment to God, His Word, and our divine assignment.' },
]

export default function AboutPage() {
  return (
    <div className="section-ivory min-h-screen">

      {/* Hero */}
      <div
        className="relative py-28 px-6 text-white text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--purple-900), var(--purple-700))' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'var(--gold-500)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--gold-400)' }}>Who We Are</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
            About DMGA
          </h1>
          <p className="text-lg text-white/75 leading-relaxed">
            To bring people and places into their destiny in God and raise dynamic leaders.
          </p>
        </div>
      </div>

      <div className="section-container">

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {[
            {
              label: 'Our Vision',
              title: 'A People of Destiny',
              body: 'Bringing people and places into their destiny in God and raising dynamic leaders.',
            },
            {
              label: 'Our Mission',
              title: 'A road map to fulfil destiny',
              body: 'To establish and advance the kingdom of God on earth by discerning His voice, declaring His will, and delivering His purpose.',
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
              <p className="text-gray-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <SectionHeader label="What We Stand For" title="Our Core Values" centered />
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

        {/* Our History */}
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader label="Our Journey" title="Our History" />
            <div className="space-y-4 text-gray-600 leading-relaxed mt-6">
              <p>
                Destiny Mission Global Assembly began with a divine vision to bring people into alignment with God’s purpose for their lives. What started as a small fellowship of believers has grown into a thriving church family committed to raising leaders, transforming communities, and reaching nations for Christ.
              </p>
              <p>
                Over the years, the church has experienced tremendous growth in membership and impact — hosting life-changing conferences, outreaches, and discipleship programs. Through faith, dedication, and the leading of the Holy Spirit, Destiny Mission continues to stand as a beacon of light, hope, and transformation.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8">
            <div className="card p-8 md:p-10 relative overflow-hidden border-none shadow-2xl scale-105 z-10" style={{ background: 'var(--purple-900)', color: 'white' }}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <p className="text-gold-400 font-bold uppercase tracking-[0.2em] text-xs mb-6">Daily Proclamation</p>
                <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-500)' }}>Our Declaration</h3>
                <div className="space-y-6">
                  <p className="italic text-xl md:text-2xl leading-relaxed font-medium border-l-4 border-gold-500/30 pl-6">
                    I am wonderfully made and dignified <br /><br />
                    Destined to rule and reign <br /><br />
                    I am a champion because <br /><br />
                    I have the seed of greatness in me.
                  </p>
                  <div className="space-y-4">
                    <p className="text-lg md:text-xl font-black text-gold-500 uppercase tracking-tight">
                      Destiny Family... Champions forever!
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
                <p>
                  We&apos;re the building of the Lord, standing on the rock <br />
                  Washed by the Blood of the Lamb, destined to reign <br />
                  To redeem this land to God and to worship in spirit and truth
                </p>
                <p className="font-bold text-purple-900 not-italic">Chorus:</p>
                <p>
                  People of Destiny, a family we are, an oasis of Love in a thirsty land <br />
                  Small enough to know you, big enough to serve you <br />
                  Here the pastures are green and the Lord is in this place <br />
                  And He&apos;s building us to stand
                </p>
              </div>
            </div>
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
