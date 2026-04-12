import Link from 'next/link'
import Image from 'next/image'
import SectionWrapper from './SectionWrapper'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'

function EventCard({ event }) {
  const start = new Date(event.startDate)
  const month = start.toLocaleString('default', { month: 'short' }).toUpperCase()
  const day   = start.getDate()

  return (
    <div className="card flex overflow-hidden">
      {/* Date block */}
      <div
        className="flex flex-col items-center justify-center px-5 py-4 flex-shrink-0 text-white"
        style={{ background: 'var(--purple-800)', minWidth: '70px' }}
      >
        <span className="text-xs font-bold opacity-80">{month}</span>
        <span className="text-3xl font-bold leading-none">{day}</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-w-0">
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 truncate">{event.title}</h3>
        {event.time && (
          <p className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Clock size={11} /> {event.time}
          </p>
        )}
        {event.venue && (
          <p className="flex items-center gap-1 text-xs text-gray-500 truncate">
            <MapPin size={11} /> {event.venue}
          </p>
        )}
      </div>

      {/* Flyer thumbnail */}
      {event.flyerImage && (
        <div className="relative w-16 flex-shrink-0">
          <Image src={event.flyerImage} alt={event.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        </div>
      )}
    </div>
  )
}

export default function AssemblyEvents({ events, assemblySlug, section }) {
  const allEventsLink = (
    <Link href="/assemblies" className="btn-outline btn-sm mt-2">
      All Events <ArrowRight size={13} />
    </Link>
  )

  return (
    <SectionWrapper
      id="events"
      bgClass="section-lavender"
      section={section}
      defaultLabel="Calendar"
      defaultTitle="What's On"
      headerRight={allEventsLink}
    >
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 text-sm">No upcoming events at this assembly.</p>
          <p className="text-gray-300 text-xs mt-1">Check back soon or contact us for more information.</p>
        </div>
      )}
    </SectionWrapper>
  )
}
