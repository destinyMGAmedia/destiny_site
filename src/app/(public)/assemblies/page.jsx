import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { MapPin, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Our Assemblies',
  description: 'Find a Destiny Mission Global Assembly near you.',
}

export const revalidate = 60

export default async function AssembliesPage() {
  const assemblies = await prisma.assembly.findMany({
    where: { isActive: true },
    orderBy: [{ isHQ: 'desc' }, { name: 'asc' }],
  })

  return (
    <div className="section-ivory min-h-screen">
      <div className="section-container">

        {/* Header — title only, no CTA */}
        <div className="text-center mb-16">
          <SectionHeader
            label="Our Family"
            title="Our Assemblies"
            subtitle="A global family committed to Igniting Faith, Transforming Lives, and Reaching Nations."
            centered
          />
        </div>

        {/* All assemblies in one grid — HQ always first */}
        {assemblies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assemblies.map((a) => (
              <Link
                key={a.slug}
                href={`/${a.slug}`}
                className="group card overflow-hidden"
              >
                <div className="relative h-52" style={{ background: 'var(--purple-900)' }}>
                  {a.heroImage ? (
                    <Image
                      src={a.heroImage}
                      alt={a.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(135deg, var(--purple-800), var(--purple-900))' }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}
                  />
                  {a.isHQ && (
                    <div className="absolute top-3 left-3">
                      <span className="pill text-xs font-bold" style={{ background: 'var(--gold-500)', color: 'var(--purple-900)' }}>
                        Headquarters
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3
                    className="font-bold text-lg text-gray-900 mb-1"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {a.name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                    <MapPin size={12} style={{ color: 'var(--purple-600)' }} />
                    {a.city}, {a.country}
                  </p>
                  {a.tagline && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{a.tagline}</p>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--purple-700)' }}>
                    Visit <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400">No assemblies found. Check back soon.</p>
          </div>
        )}

      </div>
    </div>
  )
}
