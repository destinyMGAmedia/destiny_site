import { useState } from 'react'
import { Link } from 'react-router-dom'
import Carousel from '../components/Carousel'
import TestimonyCard from '../components/TestimonyCard'

function Testimonies() {
  const [showForm, setShowForm] = useState(false)

  const testimonySlides = [
    {
      image: '/images/userPlaceHolder.jpg',
      quote: 'I was bound by addiction for 7 years. Through prayer at Destiny Mission Global Assembly, God set me free!',
      name: 'Sarah K., Lagos',
      link: '#testimonies',
    },
    {
      image: '/images/userPlaceHolder.jpg',
      quote: 'My marriage was restored after attending the Couples Retreat. God is faithful!',
      name: 'John & Mary A., Abuja',
      link: '#testimonies',
    },
    {
      image: '/images/userPlaceHolder.jpg',
      quote: 'Doctors gave up, but God healed my child during the Healing Service!',
      name: 'Grace O., Port Harcourt',
      link: '#testimonies',
    },
  ]

  const testimonies = [
    {
      image: '/images/userPlaceHolder.jpg',
      title: 'From Addiction to Freedom',
      author: '— Sarah K., Lagos',
      text: 'I was lost in drugs for 7 years before finding hope in Christ at Destiny Mission Global Assembly...',
      fullText: 'I was lost in drugs for 7 years before finding hope in Christ at Destiny Mission Global Assembly. Through prayer and the Word, God set me free and restored my life completely.',
    },
    {
      image: '/images/userPlaceHolder.jpg',
      title: 'Marriage Restored',
      author: '— John & Mary A., Abuja',
      text: 'Our marriage was falling apart until we attended the Couples Retreat. God brought healing and unity...',
      fullText: 'Our marriage was falling apart until we attended the Couples Retreat. God brought healing and unity, and today we are stronger than ever.',
    },
    {
      image: '/images/userPlaceHolder.jpg',
      title: 'Miraculous Healing',
      author: '— Grace O., Port Harcourt',
      text: 'When doctors gave up on my child, God proved His power through healing during the church\'s Healing Service...',
      fullText: 'When doctors gave up on my child, God proved His power through healing during the church\'s Healing Service. My child is now completely healthy!',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50 pt-24">
      <div className="bg-gradient-to-r from-primary-900 to-pink-600 text-white py-16 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Testimonies of Faith & Transformation
          </h1>
          <p className="text-xl opacity-90">
            Real stories of healing, deliverance, and breakthrough through Christ.
          </p>
        </div>
      </div>

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
                <a
                  href={slide.link}
                  className="text-accent-300 font-semibold hover:underline"
                >
                  Read Full Story →
                </a>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* TESTIMONIES GRID */}
      <section id="testimonies" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            Testimonies of Faith
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {testimonies.map((testimony, index) => (
              <TestimonyCard key={index} testimony={testimony} />
            ))}
          </div>

          <div className="text-center mb-8">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-8 py-3 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transition-colors"
            >
              Share Yours
            </button>
          </div>

          {showForm && (
            <div className="max-w-2xl mx-auto bg-gray-100 p-8 rounded-xl shadow-lg">
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
                    onClick={() => setShowForm(false)}
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

      <div className="container mx-auto px-6 max-w-6xl pb-12 text-center space-x-4">
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
        >
          ← Back to Home
        </Link>
        <a
          href="#top"
          className="inline-block px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
        >
          ↑ Back to Top
        </a>
      </div>
    </main>
  )
}

export default Testimonies
