import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import TestimonyCard from '../components/TestimonyCard'
import { testimonies } from '../Data'   // ← now pulling from data.js

function Testimonies() {
  const [submitted, setSubmitted] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('success') === 'true') {
      setSubmitted(true)
      setTimeout(() => {
        window.history.replaceState({}, '', '/testimonies')
      }, 100)
    }
  }, [location])

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-primary-900 to-pink-600 text-white py-32 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            Testimonies of Faith & Transformation
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Real stories of healing, deliverance, and breakthrough through Christ.
          </p>
        </div>
      </div>

      {/* TESTIMONIES GRID */}
      <section id="testimonies" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            All Testimonies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {testimonies.map((testimony, index) => (
              <TestimonyCard key={index} testimony={testimony} />
            ))}
          </div>
        </div>
      </section>

      {/* SHARE TESTIMONY FORM */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            Share Your Testimony
          </h2>

          {submitted ? (
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">🙏</div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">
                Thank You!
              </h3>
              <p className="text-gray-700 mb-6">
                Your testimony has been received. We will review it and may share it to encourage others.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-8 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
              >
                Share Another Testimony
              </button>
            </div>
          ) : (
            <form
              action="https://formsubmit.co/testimonies@dmga.org"
              method="POST"
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              {/* FormSubmit Hidden Settings */}
              <input type="text" name="_honey" style={{ display: 'none' }} />
              <input type="hidden" name="_captcha" value="false" />
              <input
                type="hidden"
                name="_subject"
                value="New Testimony Submission from DMGA Website"
              />
              <input
                type="hidden"
                name="_next"
                value={`${window.location.origin}/testimonies?success=true`}
              />

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                  />
                  <p className="text-sm text-gray-500 mt-1">For follow-up purposes only</p>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Your Testimony *</label>
                  <textarea
                    name="testimony"
                    rows="6"
                    required
                    placeholder="Share your story of transformation, healing, breakthrough, or how God has worked in your life..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-900"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Upload a Photo (optional)</label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-accent-300 text-primary-900 rounded-lg font-semibold hover:bg-accent-400 transition-colors"
                  >
                    Submit Testimony
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  By submitting, you agree that your testimony may be shared publicly to encourage others.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-6xl pb-12 text-center">
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}

export default Testimonies
