import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'

const cloudinaryUrls = {
  primate: "https://res.cloudinary.com/diun1hy3v/image/upload/q_auto/f_auto/v1776378519/dmga/global/leadership/primate.png",
  presbyter: "https://res.cloudinary.com/diun1hy3v/image/upload/v1776378530/dmga/global/leadership/presbyter.jpg"
}

export default function FounderSection() {
  return (
    <section className="section-white">
      <div className="section-container">
        <SectionHeader 
          label="Anointed Leadership" 
          title="Our Spiritual Covering" 
          subtitle="Meet the visionary leaders God has placed over Destiny Mission Global Assembly"
          centered 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
          
          {/* Primate - Full body image, wider column */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Image */}
              <div className="order-2 md:order-1">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-50 to-gold-50">
                  <Image
                    src={cloudinaryUrls.primate}
                    alt="Archbishop (Prof) Cletus Bassy - Primate of DMGA"
                    width={500}
                    height={700}
                    className="object-cover w-full h-[500px] md:h-[600px]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    priority
                    loading="eager"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
                </div>
              </div>

              {/* Content */}
              <div className="order-1 md:order-2 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--gold-500)' }}>
                    Primate & General Overseer
                  </p>
                  <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
                    Archbishop (Prof) <br />Cletus Bassy
                  </h3>
                </div>

                <div className="w-12 h-1 rounded" style={{ background: 'var(--gold-500)' }} />

                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    A man of extraordinary faith and vision, Archbishop (Prof) Cletus Bassy is the Primate and General Overseer of Destiny Mission Global Assembly. His life is dedicated to raising a people of destiny across nations through apostolic ministry and prophetic insight.
                  </p>
                  <p>
                    Under his leadership, DMGA has experienced tremendous growth and impact, touching lives across continents and establishing a legacy of spiritual excellence, leadership development, and kingdom expansion.
                  </p>
                </div>

                <blockquote className="border-l-4 border-gold-500 pl-6 italic text-lg" style={{ color: 'var(--purple-800)' }}>
                  &quot;We are called to bring people and places into their destiny in God and raise dynamic leaders for His kingdom.&quot;
                </blockquote>
              </div>
            </div>
          </div>

          {/* Presbyter - Portrait style, narrower column */}
          <div className="lg:col-span-1">
            <div className="card p-0 overflow-hidden text-center h-full flex flex-col">
              
              {/* Image */}
              <div className="flex-shrink-0 relative">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <Image
                    src={cloudinaryUrls.presbyter}
                    alt="Bishop (Mrs) Blessing Bassey - Presbyter of DMGA"
                    width={400}
                    height={500}
                    className="object-cover w-full h-full"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    loading="lazy"
                  />
                  {/* Elegant overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow p-8 flex flex-col justify-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--gold-500)' }}>
                    Presbyter & First Lady
                  </p>
                  <h4 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
                    Bishop (Mrs) <br />Blessing Bassey
                  </h4>
                </div>

                <div className="w-8 h-1 rounded mx-auto mb-4" style={{ background: 'var(--gold-500)' }} />

                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  The First Lady of DMGA and a pillar of grace and strength in the ministry. She plays a vital role in nurturing families, strengthening the church community, and mentoring women in their spiritual journey.
                </p>

                <div className="text-center">
                  <p className="text-xs font-semibold" style={{ color: 'var(--purple-700)' }}>
                    &quot;A virtuous woman who leads with wisdom and compassion&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div 
            className="inline-block px-8 py-4 rounded-2xl"
            style={{ background: 'var(--purple-50)' }}
          >
            <p className="text-sm" style={{ color: 'var(--purple-800)' }}>
              <span className="font-bold">Under their spiritual covering</span>, DMGA continues to impact lives and raise leaders across nations
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}