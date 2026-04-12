import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { MapPin, ArrowRight } from 'lucide-react'

function AssemblyCard({ assembly }) {
  return (
    <Link
      href={`/${assembly.slug}`}
      className="group flex-shrink-0 relative w-72 h-96 rounded-3xl overflow-hidden shadow-xl cursor-pointer"
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Background */}
      {assembly.heroImage ? (
        <Image
          src={assembly.heroImage}
          alt={assembly.name}
          fill
          sizes="288px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, var(--purple-800) 0%, var(--purple-900) 100%)' }}
        />
      )}

      {/* Gradient overlay — stronger at bottom */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
      }} />

      {/* HQ pill */}
      {assembly.isHQ && (
        <span
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
          style={{ background: 'var(--gold-500)', color: 'var(--purple-900)' }}
        >
          Headquarters
        </span>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="font-bold text-xl leading-snug mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
          {assembly.name}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-white/70 mb-4">
          <MapPin size={12} />
          {assembly.city}, {assembly.country}
        </p>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all duration-300 group-hover:gap-3"
          style={{ background: 'var(--gold-500)', color: 'var(--purple-900)' }}
        >
          Visit Assembly <ArrowRight size={11} />
        </span>
      </div>
    </Link>
  )
}

export default function AssembliesStrip({ assemblies }) {
  return (
    <section className="section-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            label="Our Family"
            title="Our Assemblies"
            subtitle="Find a Destiny family near you"
          />
          <Link href="/assemblies" className="btn-outline btn-sm hidden sm:inline-flex">
            View All <ArrowRight size={13} />
          </Link>
        </div>

        {/* Scrollable strip */}
        <div
          className="flex gap-5 overflow-x-auto pb-6 -mx-6 px-6"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {assemblies.map((a) => (
            <AssemblyCard key={a.slug} assembly={a} />
          ))}

          {/* See All card */}
          <Link
            href="/assemblies"
            className="group flex-shrink-0 w-52 h-96 rounded-3xl flex flex-col items-center justify-center gap-4 border-2 border-dashed transition-all duration-300"
            style={{
              scrollSnapAlign: 'start',
              borderColor: 'var(--border)',
              color: 'var(--gray-400)',
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ background: 'var(--purple-50)' }}
            >
              <ArrowRight size={20} style={{ color: 'var(--purple-700)' }} />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--purple-700)' }}>
              All Assemblies
            </span>
          </Link>
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link href="/assemblies" className="btn-outline btn-sm">
            View All Assemblies <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}
