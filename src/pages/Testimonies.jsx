import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

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

  // Featured testimonies (manually curated - update these from approved testimonies)
  const featuredTestimonies = [
    {
      name: "Sister Grace",
      testimony: "After years of believing God for a child, He blessed us with twins! God is faithful to His promises.",
      date: "January 2025"
    },
    {
      name: "Brother Michael",
      testimony: "I was healed from a chronic illness that doctors said was incurable. God's power is real!",
      date: "December 2024"
    },
    {
      name: "Mrs. Johnson",
      testimony: "My family was restored after years of separation. God truly brings beauty from ashes.",
      date: "November 2024"
    }
  ]

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Testimonies
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300">
            Share how God has moved in your life and inspire others
          </p>
        </div>

        {/* Featured Testimonies Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            What God Has Done
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTestimonies.map((item, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20"
              >
                <div className="text-4xl mb-4">✨</div>
                <p className="text-gray-300 mb-4 italic">&quot;{item.testimony}&quot;</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200 font-semibold">{item.name}</span>
                  <span className="text-gray-400 text-sm">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Submit Testimony Form */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Share Your Testimony
          </h2>

          {submitted ? (
            // Success Message
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 border border-white border-opacity-20 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Thank You For Sharing!
              </h3>
              <p className="text-gray-300 mb-6">
                Your testimony has been received and will be reviewed by our team. 
                Once approved, it may be featured to encourage others in their faith journey.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition duration-300"
              >
                Share Another Testimony
              </button>
            </div>
          ) : (
            // Form
            <form
              action="https://formsubmit.co/testimonies@dmga.org"
              method="POST"
              className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 border border-white border-opacity-20"
            >
              {/* FormSubmit Configuration */}
              <input type="text" name="_honey" style={{display: 'none'}} />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_subject" value="New Testimony Submission from DMGA Website" />
              <input type="hidden" name="_next" value={`${window.location.origin}/testimonies?success=true`} />

              {/* Name */}
              <div className="mb-6">
                <label htmlFor="name" className="block text-white mb-2 font-medium">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Email */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-white mb-2 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Required for verification and follow-up
                </p>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-white mb-2 font-medium">
                  Testimony Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" className="text-gray-900">Select a category</option>
                  <option value="healing" className="text-gray-900">Healing & Miracles</option>
                  <option value="deliverance" className="text-gray-900">Deliverance</option>
                  <option value="financial" className="text-gray-900">Financial Breakthrough</option>
                  <option value="salvation" className="text-gray-900">Salvation</option>
                  <option value="family" className="text-gray-900">Family Restoration</option>
                  <option value="career" className="text-gray-900">Career & Business</option>
                  <option value="other" className="text-gray-900">Other</option>
                </select>
              </div>

              {/* Testimony */}
              <div className="mb-6">
                <label htmlFor="testimony" className="block text-white mb-2 font-medium">
                  Your Testimony
                </label>
                <textarea
                  id="testimony"
                  name="testimony"
                  required
                  rows="8"
                  placeholder="Share what God has done in your life..."
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                ></textarea>
              </div>

              {/* Permission Checkbox */}
              <div className="mb-6">
                <label className="flex items-start text-gray-300">
                  <input
                    type="checkbox"
                    name="permission"
                    value="yes"
                    required
                    className="mr-2 h-4 w-4 mt-1"
                  />
                  <span className="text-sm">
                    I give permission for my testimony to be shared publicly on the website 
                    and in church services to glorify God and encourage others.
                  </span>
                </label>
              </div>

              {/* Anonymous Option */}
              <div className="mb-6">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    name="anonymous"
                    value="yes"
                    className="mr-2 h-4 w-4"
                  />
                  <span>Post my testimony anonymously (only first name/initial)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition duration-300 shadow-lg"
              >
                Submit Testimony
              </button>

              {/* Note */}
              <p className="text-gray-400 text-sm mt-4 text-center">
                All testimonies are reviewed before being published to ensure authenticity and appropriateness.
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

export default Testimonies

