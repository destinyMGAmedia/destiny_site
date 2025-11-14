import { useState } from 'react'
import { Link } from 'react-router-dom'
import QuickActions from '../components/QuickActions'
import Carousel from '../components/Carousel'
import EventCard from '../components/EventCard'
import TestimonyCard from '../components/TestimonyCard'

function Home() {
  const [activeTab, setActiveTab] = useState('one-time')
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showTestimonyForm, setShowTestimonyForm] = useState(false)

  // Sample events data
  const events = [
    {
      day: '15',
      month: 'NOV',
      title: 'Annual Harvest Crusade',
      time: '4:00 PM – 8:00 PM',
      location: 'Main Auditorium, Lagos',
      onRegister: () => alert('Registration coming soon!'),
    },
    {
      day: '22',
      month: 'NOV',
      title: 'Youth Ablaze Conference',
      time: '9:00 AM – 3:00 PM',
      location: 'Youth Hall',
      onRegister: () => alert('Registration coming soon!'),
    },
    {
      day: '01',
      month: 'DEC',
      title: 'Christmas Carol Service',
      time: '6:00 PM',
      location: 'Main Sanctuary',
      onRegister: () => alert('Registration coming soon!'),
    },
  ]

  // Sample testimonies for carousel
  const testimonySlides = [
    {
      image: '/images/userPlaceHolder.jpg',
      quote: 'I was bound by addiction for 7 years. Through prayer at Destiny Mission Global Assembly, God set me free!',
      name: 'Sarah K., Lagos',
      link: '/testimonies',
    },
    {
      image: '/images/userPlaceHolder.jpg',
      quote: 'My marriage was restored after attending the Couples Retreat. God is faithful!',
      name: 'John & Mary A., Abuja',
      link: '/testimonies',
    },
    {
      image: '/images/userPlaceHolder.jpg',
      quote: 'Doctors gave up, but God healed my child during the Healing Service!',
      name: 'Grace O., Port Harcourt',
      link: '/testimonies',
    },
  ]

  // Sample testimonies for grid
  const testimonies = [
    {
      image: '/images/userPlaceHolder.jpg',
      title: 'From Addiction to Freedom',
      author: '— Sarah K., Lagos',
      text: 'I was lost in drugs for 7 years...',
      fullText: 'I was lost in drugs for 7 years before finding hope in Christ at Destiny Mission Global Assembly. Through prayer and the Word, God set me free and restored my life completely.',
    },
  ]

  // Gallery images
  const galleryImages = [
    { src: '/images/gallery/gImage1.jpg', caption: 'Sunday Worship Service' },
    { src: '/images/gallery/gImage2.jpg', caption: 'Youth Ablaze Conference' },
    { src: '/images/gallery/gImage3.jpg', caption: 'Water Baptism' },
    { src: '/images/gallery/gImage4.jpg', caption: 'Community Outreach' },
    { src: '/images/gallery/gImage5.jpg', caption: 'All-Night Prayer' },
    { src: '/images/gallery/gImage6.jpg', caption: 'Christmas Carol Service' },
    { src: '/images/gallery/gImage7.jpg', caption: 'Annual Harvest Crusade' },
  ]

  const YOUTUBE_CHANNEL_ID = 'UCH3uj1-ubXiKKhj4WZskflw'
  const homeVideoUrl = `https://www.youtube.com/embed/videoseries?list=UU${YOUTUBE_CHANNEL_ID.substring(2)}`

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900">
            {/* Add background image if available */}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl">
            <img
              src="/images/favicon.png"
              alt="DMGA Logo"
              className="h-24 md:h-32 mb-6"
            />
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
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

      {/* QUICK ACTIONS */}
      <QuickActions />

      {/* LIVE STREAM SECTION */}
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
            ></iframe>
          </div>
          <p className="text-center mt-4 text-lg text-pink-600">
            Next Service: <strong>Sunday 9:00 AM WAT</strong>
          </p>
        </div>
      </section>

      {/* GIVING SECTION */}
      <section id="give" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-4">
            Give Securely
          </h2>
          <p className="text-center italic text-gray-600 mb-8">
            &quot;Bring the whole tithe into the storehouse...&quot; – Malachi 3:10
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('one-time')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'one-time'
                  ? 'bg-primary-900 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              One-Time
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'recurring'
                  ? 'bg-primary-900 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Recurring
            </button>
          </div>

          <form className="space-y-4 max-w-md mx-auto">
            <div className="flex flex-wrap gap-2">
              {[10, 50, 100].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount('')
                  }}
                  className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                    selectedAmount === amount
                      ? 'border-accent-300 bg-yellow-50 text-primary-900'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  ${amount}
                </button>
              ))}
              <input
                type="number"
                placeholder="Custom"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg flex-1 min-w-[100px]"
              />
            </div>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg">
              <option>Tithe</option>
              <option>Offering</option>
              <option>Missions</option>
            </select>
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              className="w-full px-6 py-3 bg-accent-300 text-primary-900 rounded-lg font-semibold hover:bg-accent-400 transform hover:-translate-y-1 transition-all duration-300"
            >
              Give Now
            </button>
          </form>
        </div>
      </section>

      {/* PRAYER REQUEST SECTION */}
      <section id="prayer" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            Submit Prayer Request
          </h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              type="email"
              placeholder="Email (for follow-up)"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="Share your prayer need..."
              rows="5"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
            ></textarea>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Keep anonymous</span>
            </label>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-accent-300 text-primary-900 rounded-lg font-semibold hover:bg-accent-400 transform hover:-translate-y-1 transition-all duration-300"
            >
              Send Prayer
            </button>
          </form>
        </div>
      </section>

      {/* TESTIMONIES SECTION */}
      <section id="testimonies" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            Testimonies of Faith
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {testimonies.map((testimony, index) => (
              <TestimonyCard key={index} testimony={testimony} />
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={() => setShowTestimonyForm(!showTestimonyForm)}
              className="px-8 py-3 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transition-colors"
            >
              Share Yours
            </button>
          </div>

          {showTestimonyForm && (
            <div className="mt-8 max-w-2xl mx-auto bg-gray-100 p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-serif font-bold text-primary-900 mb-6">
                Share Your Testimony
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Your Testimony</label>
                  <textarea
                    rows="5"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Upload a Photo (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent-300 text-primary-900 rounded-lg font-semibold hover:bg-accent-400 transition-colors"
                  >
                    Submit Testimony
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTestimonyForm(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONY CAROUSEL */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-yellow-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            Testimonies of Transformation
          </h2>
          <Carousel autoPlayInterval={8000}>
            {testimonySlides.map((slide, index) => (
              <div
                key={index}
                className="bg-white p-12 text-center min-h-[300px] flex flex-col justify-center items-center rounded-2xl shadow-xl"
              >
                <img
                  src={slide.image}
                  alt={slide.name}
                  className="w-20 h-20 rounded-full border-4 border-accent-300 object-cover mb-4"
                />
                <blockquote className="text-xl italic text-primary-900 mb-4 leading-relaxed">
                  &quot;{slide.quote}&quot;
                </blockquote>
                <p className="text-gray-500 font-medium mb-4">{slide.name}</p>
                <Link
                  to={slide.link}
                  className="text-accent-300 font-semibold hover:underline"
                >
                  Read Full Story →
                </Link>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY CAROUSEL */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-4">
            Moments of Faith
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Recent highlights from our services and events
          </p>
          <div className="max-w-5xl mx-auto">
            <Carousel autoPlayInterval={6000}>
              {galleryImages.map((image, index) => (
                <div key={index} className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={image.src}
                    alt={image.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/25 backdrop-blur-md text-white px-7 py-3 rounded-xl font-medium text-lg shadow-lg">
                    {image.caption}
                  </div>
                </div>
              ))}
            </Carousel>
            <div className="text-center mt-8">
              <Link
                to="/gallery"
                className="inline-block px-8 py-3 bg-gradient-to-r from-primary-900 to-primary-800 text-white rounded-lg font-semibold hover:from-accent-300 hover:to-accent-400 hover:text-primary-900 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                View Full Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
