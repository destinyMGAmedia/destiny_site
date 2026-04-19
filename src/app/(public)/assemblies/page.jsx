import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { MapPin, ArrowRight, Home, Users, Calendar, Clock } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

export const metadata = {
  title: 'Our Assemblies',
  description: 'Find a Destiny Mission Global Assembly near you.',
}

export const revalidate = 60

export default async function AssembliesPage() {
  let assemblies = []
  try {
    assemblies = await prisma.assembly.findMany({
      where: { isActive: true },
      orderBy: [{ isHQ: 'desc' }, { name: 'asc' }],
    })
  } catch (error) {
    console.error('Error loading assemblies:', error)
    // Return empty array if database fails, page will show "no assemblies" message
  }

  return (
    <div className="section-ivory min-h-screen">
      {/* Header */}
      <div
        className="relative py-24 px-6 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--purple-900), var(--purple-700))' }}
      >
        <BackButton className="absolute top-8 left-8 z-20" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--gold-500)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,179,0,0.15)' }}>
            <Users size={24} style={{ color: 'var(--gold-500)' }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Our Assemblies</h1>
          <p className="text-white/60">A global family committed to Igniting Faith, Transforming Lives, and Reaching Nations.</p>
        </div>
      </div>

      <div className="section-container mt-16">

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

      {/* Ark Centers Section */}
      <div className="bg-white py-20 mt-20">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                label="Community"
                title="Ark Centers"
                subtitle="Our house fellowships (Ark Centers) provide a closer-knit community where you can grow in faith, share life together, and support one another in your local neighborhood."
              />
              
              <div className="space-y-6 mt-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Home className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Neighborhood Fellowships</h4>
                    <p className="text-sm text-gray-500">Find a group meeting close to your home for a more personal experience.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Calendar className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Alternating Thursdays</h4>
                    <p className="text-sm text-gray-500">Ark Centers usually meet every other Thursday evening. Check your local assembly for the schedule.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Everyone is Welcome</h4>
                    <p className="text-sm text-gray-500">Whether you're a long-time member or just visiting, there's a place for you at an Ark Center.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=2070&auto=format&fit=crop"
                alt="Community Fellowship"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <p className="text-2xl font-bold mb-2">"Better Together"</p>
                  <p className="text-purple-100 opacity-90 text-sm italic">Sharing life and faith in our local communities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
