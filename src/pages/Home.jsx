import { useState } from 'react'
import { Link } from 'react-router-dom'

// Components
import QuickActions from '../components/QuickActions'
import Carousel from '../components/Carousel'
import EventCard from '../components/EventCard'
import TestimonyCard from '../components/TestimonyCard'
import EventDetailModal from '../components/EventDetailModal'

// Import all centralized data
import {
  events,
  recentTestimonies,
  recentGalleryImages,
  YOUTUBE_CHANNEL_ID
} from '../Data'

function Home() {
  // -------------------------------------------
  // EVENT MODAL LOGIC
  // -------------------------------------------

  // Stores the currently selected event for the modal
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Handles actions coming from EventCard
  const handleCardAction = (actionType, event) => {
    if (actionType === 'details') {
      setSelectedEvent(event)      // opens modal
    }
  }

  // Closes the event modal
  const closeDetailModal = () => setSelectedEvent(null)

  // YouTube channel embed link
  const homeVideoUrl = `https://www.youtube.com/embed/videoseries?list=UU${YOUTUBE_CHANNEL_ID.substring(2)}`

  return (
    <>
      {/* -------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* -------------------------------------------------- */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="container relative z-10 px-8 md:px-12 lg:px-16 xl:ml-36 max-w-6xl">
          <div className="max-w-3xl">
            <img
              src="/images/favicon.png"
              alt="DMGA Logo"
              className="h-24 md:h-32 mb-6"
            />

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              Welcome to Destiny Mission Global Assembly
            </h1>

            <div className="h-1 w-32 bg-accent-300 mb-8" />

            <p className="text-xl md:text-2xl text-gray-200 mb-10 opacity-90">
              Igniting Faith. Transforming Lives.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/live"
                className="px-8 py-4 bg-accent-300 text-primary-900 rounded-lg font-semibold hover:bg-accent-400 transform hover:scale-105 transition duration-300 shadow-lg text-center"
              >
                Watch Live
              </Link>

              <a
                href="#give"
                className="px-8 py-4 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transform hover:scale-105 transition duration-300 shadow-lg text-center"
              >
                Give Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* QUICK ACTIONS */}
      {/* -------------------------------------------------- */}
      <QuickActions />

      {/* -------------------------------------------------- */}
      {/* LIVE STREAM SECTION */}
      {/* -------------------------------------------------- */}
      <section id="live" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            Watch Live
          </h2>

          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-2xl">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={homeVideoUrl}
              title="DMGA Live Stream"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <p className="text-center mt-4 text-lg text-pink-600">
            Next Service: <strong>Sunday 9:00 AM WAT</strong>
          </p>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* GIVING SECTION */}
      {/* -------------------------------------------------- */}
      <section id="give" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-4">
            Give Securely
          </h2>

          <p className="text-center italic text-gray-600 mb-8">
            "Bring the whole tithe into the storehouse..." – Malachi 3:10
          </p>

          <div className="text-center">
            <Link
              to="/giving"
              className="inline-block px-8 py-4 bg-accent-300 text-primary-900 rounded-lg font-semibold hover:bg-accent-400 transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Give Now
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* PRAYER REQUEST SECTION */}
      {/* -------------------------------------------------- */}
      <section id="prayer" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-4">
            Submit Prayer Request
          </h2>

          <p className="text-center text-gray-600 mb-12">
            Share your prayer needs with us and our prayer team will intercede for you
          </p>

          <div className="text-center">
            <Link
              to="/prayer"
              className="inline-block px-8 py-4 bg-accent-300 text-primary-900 rounded-lg font-semibold hover:bg-accent-400 transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Submit Prayer Request
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* TESTIMONIES SECTION */}
      {/* -------------------------------------------------- */}
      <section id="testimonies" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            Recent Testimonies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {recentTestimonies.map((testimony, index) => (
              <TestimonyCard key={index} testimony={testimony} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/testimonies"
              className="inline-block px-8 py-4 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors shadow-lg"
            >
              Share Your Testimony
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* EVENTS SECTION (Now using new EventCard + modal) */}
      {/* -------------------------------------------------- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            Upcoming Events
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <EventCard
                key={index}
                event={event}
                onAction={handleCardAction}   // enables modal trigger
              />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* GALLERY CAROUSEL */}
      {/* -------------------------------------------------- */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-4">
            Moments of Faith
          </h2>

          <p className="text-center text-gray-600 mb-12 text-lg">
            Recent highlights from our services and events
          </p>

          {/* Carousel wrapper */}
          <div className="relative w-full max-w-5xl mx-auto">

            <Carousel autoPlayInterval={6000}>
              {recentGalleryImages.map((image, index) => (
                <div
                  key={index}
                  className="relative w-full flex items-center justify-center"
                >
                  <div className="relative w-full h-[260px] sm:h-[320px] md:h-[420px] lg:h-[700px]
                    rounded-2xl  overflow-hidden shadow-xl bg-gray-200                ">
                    <img
                      src={image.src}
                      alt={image.caption}
                      className="w-[400px] lg:w-[1100px] max-h-full object-cover bg-black/5"
                       loading="eager"
                    />

                    <div className="absolute bottom-10 left-[170px] lg:left-[500px] -translate-x-1/2 bg-white/25 backdrop-blur-md text-white px-7 py-3 rounded-xl font-medium text-lg shadow-lg">
                      {image.caption}
                    </div>
                  </div>

                </div>

              ))}
            </Carousel>

          </div>

          {/* Gallery button */}
          <div className="text-center mt-8">
            <Link
              to="/gallery"
              className="inline-block px-8 py-3 bg-gradient-to-r from-primary-900 to-primary-800 text-white rounded-lg font-semibold hover:from-accent-300 hover:to-accent-400 hover:text-primary-900 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>




      {/* -------------------------------------------------- */}
      {/* EVENT DETAIL MODAL (Always kept at bottom) */}
      {/* -------------------------------------------------- */}
      <EventDetailModal event={selectedEvent} onClose={closeDetailModal} />
    </>
  )
}

export default Home
