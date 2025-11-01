import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function Prayer() {
  const [submitted, setSubmitted] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('success') === 'true') {
      setSubmitted(true)
      setTimeout(() => {
        window.history.replaceState({}, '', '/prayer')
      }, 100)
    }
  }, [location])

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Prayer Request
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300">
            Submit your prayer requests and our prayer team will intercede for you
          </p>
          <p className="text-gray-400 mt-4 italic">
            "The prayer of a righteous person is powerful and effective." - James 5:16
          </p>
        </div>

        {submitted ? (
          // Success Message
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 border border-white border-opacity-20 text-center">
            <div className="text-6xl mb-4">🙏</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              We&apos;re Praying For You
            </h2>
            <p className="text-gray-300 mb-6">
              Your prayer request has been received. Our prayer team will be interceding on your behalf.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition duration-300"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          // Form
          <form
            action="https://formsubmit.co/prayer@dmga.org"
            method="POST"
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 border border-white border-opacity-20"
          >
            {/* FormSubmit Configuration */}
            <input type="text" name="_honey" style={{display: 'none'}} />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_subject" value="New Prayer Request from DMGA Website" />
            <input type="hidden" name="_next" value={`${window.location.origin}/prayer?success=true`} />

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
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-gray-400 text-sm mt-1">
                Provide if you&apos;d like us to follow up with you
              </p>
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label htmlFor="phone" className="block text-white mb-2 font-medium">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+234 800 000 0000"
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-white mb-2 font-medium">
                Prayer Category
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="" className="text-gray-900">Select a category</option>
                <option value="healing" className="text-gray-900">Healing & Health</option>
                <option value="family" className="text-gray-900">Family & Relationships</option>
                <option value="financial" className="text-gray-900">Financial Breakthrough</option>
                <option value="spiritual" className="text-gray-900">Spiritual Growth</option>
                <option value="guidance" className="text-gray-900">Guidance & Direction</option>
                <option value="thanksgiving" className="text-gray-900">Thanksgiving</option>
                <option value="other" className="text-gray-900">Other</option>
              </select>
            </div>

            {/* Prayer Request */}
            <div className="mb-6">
              <label htmlFor="request" className="block text-white mb-2 font-medium">
                Your Prayer Request
              </label>
              <textarea
                id="request"
                name="request"
                required
                rows="6"
                placeholder="Share your prayer request with us..."
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              ></textarea>
            </div>

            {/* Urgency Checkbox */}
            <div className="mb-6">
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  name="urgent"
                  value="yes"
                  className="mr-2 h-4 w-4"
                />
                <span>This is an urgent request</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition duration-300 shadow-lg"
            >
              Submit Prayer Request
            </button>

            {/* Privacy Note */}
            <p className="text-gray-400 text-sm mt-4 text-center">
              Your request will be kept confidential and handled with care by our prayer team.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default Prayer

