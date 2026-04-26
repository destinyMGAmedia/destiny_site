'use client'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

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
  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselRef = useRef(null)
  
  const visibleEvents = events.slice(0, 6) // Show max 6 events
  const totalSlides = Math.ceil(visibleEvents.length / 3)
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  // Auto-scroll carousel
  useEffect(() => {
    if (visibleEvents.length <= 3) return // No need to auto-scroll if all fit
    
    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // Auto-scroll every 5 seconds

    return () => clearInterval(interval)
  }, [totalSlides, visibleEvents.length])

  return (
    <section className="section-lavender">
      <div className="section-container">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            label="Programmes"
            title="Upcoming Events"
            subtitle="Don't miss what God is doing"
          />
          <Link href="/events" className="btn-outline btn-sm hidden sm:inline-flex">
            View All Events <ArrowRight size={13} />
          </Link>
        </div>

        {visibleEvents.length > 0 ? (
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden" ref={carouselRef}>
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * 100}%)`,
                  width: `${totalSlides * 100}%`
                }}
              >
                {Array.from({ length: totalSlides }, (_, slideIndex) => (
                  <div 
                    key={slideIndex}
                    className="flex gap-6"
                    style={{ width: `${100 / totalSlides}%` }}
                  >
                    {visibleEvents
                      .slice(slideIndex * 3, (slideIndex + 1) * 3)
                      .map((event) => (
                        <div key={event.id} className="flex-1 min-w-0">
                          <EventCard event={event} />
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows - only show if more than 3 events */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors z-10"
                  style={{ boxShadow: '0 10px 25px rgba(74,20,140,0.15)' }}
                >
                  <ChevronLeft size={20} style={{ color: 'var(--purple-900)' }} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors z-10"
                  style={{ boxShadow: '0 10px 25px rgba(74,20,140,0.15)' }}
                >
                  <ChevronRight size={20} style={{ color: 'var(--purple-900)' }} />
                </button>

                {/* Slide Indicators */}
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalSlides }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide 
                          ? 'w-8' 
                          : 'hover:bg-opacity-60'
                      }`}
                      style={{ 
                        backgroundColor: index === currentSlide ? 'var(--purple-600)' : 'var(--purple-200)'
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Show View All button if there are more than 6 events */}
            {events.length > 6 && (
              <div className="text-center mt-8">
                <Link href="/events" className="btn-outline">
                  View All {events.length} Events <ArrowRight size={16} />
                </Link>
              </div>
            )}
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
          <Link href="/events" className="btn-outline btn-sm">
            View All Events <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}
