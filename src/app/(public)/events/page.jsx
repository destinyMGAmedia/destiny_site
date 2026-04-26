import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Clock, ArrowLeft, Users, Globe, Baby } from 'lucide-react'
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import prisma from '@/lib/prisma'

async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { isGlobal: true },
          { assemblyId: { not: null } }
        ]
      },
      include: {
        assembly: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    })
    return events
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

// Helper function to safely parse date (handles both Date objects and strings)
function safeParseDate(date) {
  if (date instanceof Date) return date
  if (typeof date === 'string') return parseISO(date)
  return new Date(date)
}

function EventCard({ event }) {
  const startDate = safeParseDate(event.startDate)
  const endDate = event.endDate ? safeParseDate(event.endDate) : null
  const isUpcoming = isAfter(startDate, new Date())
  const isPast = isBefore(startDate, new Date())

  const formatEventDate = (start, end) => {
    if (end) {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    }
    return format(start, 'MMMM d, yyyy')
  }

  return (
    <div className="group card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Event Image */}
        <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
          {event.flyerImage ? (
            <Image
              src={event.flyerImage}
              alt={event.title}
              fill
              sizes="(max-width: 640px) 100vw, 192px"
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
          
          {/* Status Badge */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
            isUpcoming 
              ? 'bg-green-100 text-green-800' 
              : isPast 
              ? 'bg-gray-100 text-gray-600'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Today'}
          </div>
        </div>

        {/* Event Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-bold text-xl text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                {event.title}
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {event.isGlobal && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    <Globe size={12} />
                    Global Event
                  </span>
                )}
                {event.isChildrensEvent && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                    <Baby size={12} />
                    Kids Event
                  </span>
                )}
                {event.assembly && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    <Users size={12} />
                    {event.assembly.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {event.description && (
            <p className="text-gray-600 mb-4 leading-relaxed">{event.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={16} style={{ color: 'var(--purple-600)' }} />
              <span className="font-medium">{formatEventDate(startDate, endDate)}</span>
            </div>
            
            {event.time && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={16} style={{ color: 'var(--purple-600)' }} />
                <span>{event.time}</span>
              </div>
            )}
            
            {event.venue && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={16} style={{ color: 'var(--purple-600)' }} />
                <span>{event.venue}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function EventsPage() {
  const events = await getEvents()
  
  const now = new Date()
  const upcomingEvents = events.filter(event => isAfter(safeParseDate(event.startDate), now))
  const pastEvents = events.filter(event => isBefore(safeParseDate(event.startDate), now))

  return (
    <div className="min-h-screen bg-[#F9F7F5]">
      {/* Header */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>
          
          <div className="max-w-3xl">
            <h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" 
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Church Events
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Stay connected with what God is doing in our community. Join us for worship, 
              fellowship, and opportunities to grow in faith together.
            </p>
          </div>
        </div>
      </section>

      {/* Events Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {events.length === 0 ? (
            <div className="text-center py-20">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--purple-50)' }}
              >
                <Calendar size={36} style={{ color: 'var(--purple-300)' }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Events Scheduled</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                We're always planning new events and programs. Check back soon or follow us 
                on social media for the latest updates.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div>
                  <h2 
                    className="text-3xl font-bold text-gray-900 mb-8" 
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Upcoming Events
                  </h2>
                  <div className="space-y-6">
                    {upcomingEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <h2 
                    className="text-3xl font-bold text-gray-900 mb-8" 
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Past Events
                  </h2>
                  <div className="space-y-6 opacity-75">
                    {pastEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}