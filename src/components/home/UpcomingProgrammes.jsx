import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, Calendar, MapPin, Clock } from 'lucide-react'

function EventCard({ event }) {
  const date = new Date(event.startDate)
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase()
  const day = date.getDate()
  const weekday = date.toLocaleString('default', { weekday: 'short' })

  return (
    <div className="group card overflow-hidden flex flex-col">
      {/* Flyer / header */}
      <div className="relative h-52 bg-gray-100 flex-shrink-0 overflow-hidden">
        {event.flyerImage ? (
          <Image
            src={event.flyerImage}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, var(--purple-800), var(--purple-900))' }}
          >
            <Calendar size={40} style={{ color: 'rgba(255,179,0,0.4)' }} />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)'
        }} />
        {/* Date badge */}
        <div
          className="absolute top-4 right-4 text-center min-w-[52px] px-3 py-2 rounded-2xl shadow-lg"
          style={{ background: 'var(--gold-500)' }}
        >
          <p className="text-xs font-bold leading-none" style={{ color: 'var(--purple-900)' }}>{weekday}</p>
          <p className="text-3xl font-black leading-none mt-1" style={{ color: 'var(--purple-900)' }}>{day}</p>
          <p className="text-xs font-bold leading-none mt-0.5" style={{ color: 'var(--purple-900)' }}>{month}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3
          className="font-bold text-gray-900 mb-3 leading-snug text-lg"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {event.title}
        </h3>

        <div className="space-y-1.5 mb-4">
          {event.venue && (
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={13} style={{ color: 'var(--purple-600)' }} />
              {event.venue}
            </p>
          )}
          {event.time && (
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={13} style={{ color: 'var(--purple-600)' }} />
              {event.time}
            </p>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-gray-500 line-clamp-2 flex-1 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default function UpcomingProgrammes({ events }) {
  return (
    <section className="section-lavender">
      <div className="section-container">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            label="Programmes"
            title="Upcoming Events"
            subtitle="Don't miss what God is doing"
          />
          <Link href="/assemblies" className="btn-outline btn-sm hidden sm:inline-flex">
            View All <ArrowRight size={13} />
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-3xl"
            style={{ background: 'rgba(74,20,140,0.04)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--purple-50)' }}
            >
              <Calendar size={28} style={{ color: 'var(--purple-300)' }} />
            </div>
            <p className="font-semibold text-gray-500 mb-1">No Global Events Scheduled</p>
            <p className="text-sm text-gray-400">
              Check individual assemblies for local events.
            </p>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/assemblies" className="btn-outline btn-sm">
            View All Events <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}
