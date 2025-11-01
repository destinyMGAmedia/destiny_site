function Home() {
  // YouTube channel ID - same as used in Gallery page
  const YOUTUBE_CHANNEL_ID = "UCH3uj1-ubXiKKhj4WZskflw"
  
  // Show channel uploads by default (better than live_stream which errors when not live)
  const homeVideoUrl = `https://www.youtube.com/embed?listType=playlist&list=UU${YOUTUBE_CHANNEL_ID.substring(2)}`

  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Placeholder for church image - Replace with actual church image */}
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900">
            {/* Add your church image here: <img src="/path-to-church-image.jpg" className="w-full h-full object-cover" alt="Church" /> */}
          </div>
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        {/* Hero Content - Left Aligned */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Destiny Mission<br />
              <span className="text-purple-300">Global Assembly</span>
            </h1>
            <div className="h-1 w-32 bg-purple-400 mb-8"></div>
            <p className="text-xl md:text-2xl text-purple-200 mb-8 italic font-light">
              To bring people and places into their destiny in God and raise dynamic leaders
            </p>
            <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-2xl">
              Welcome to our community of faith, hope, and love. Join us as we worship together and grow in our relationship with Christ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 shadow-lg">
                Join Us This Sunday
              </button>
              <a
                href="/video-gallery"
                className="px-8 py-4 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg text-center"
              >
                Watch Online
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Welcome Home</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-8"></div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              At Destiny Mission Global Assembly, we believe that everyone has a God-given purpose and destiny. 
              Our mission is to help you discover and walk in that destiny through powerful worship, life-changing teaching, 
              and authentic community.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you're seeking God for the first time or looking to deepen your faith, you'll find a home here.
            </p>
          </div>
        </div>
      </section>

      {/* Service Times Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">Join Us For Worship</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition duration-300">
                <h3 className="text-2xl font-bold text-purple-900 mb-4">Sunday Service</h3>
                <p className="text-gray-700 text-lg mb-2">📅 Every Sunday</p>
                <p className="text-gray-700 text-lg mb-2">⏰ 9:00 AM - 12:00 PM</p>
                <p className="text-gray-700 text-lg">📍 Main Sanctuary</p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition duration-300">
                <h3 className="text-2xl font-bold text-purple-900 mb-4">Midweek Service</h3>
                <p className="text-gray-700 text-lg mb-2">📅 Every Wednesday</p>
                <p className="text-gray-700 text-lg mb-2">⏰ 6:00 PM - 8:00 PM</p>
                <p className="text-gray-700 text-lg">📍 Fellowship Hall</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stream Preview Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
              Watch Our Services
            </h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>
            
            {/* Live Stream Preview */}
            <div className="bg-gray-100 rounded-xl p-4 shadow-lg mb-6">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={homeVideoUrl}
                  title="DMGA Channel Videos"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Stream Info + Gallery Button */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300">
                <h3 className="text-xl font-bold text-purple-900 mb-3">
                  📺 Watch Services
                </h3>
                <p className="text-gray-700 mb-4">
                  Watch our latest messages and services. Join us live every Sunday and Wednesday, 
                  or catch up on previous services anytime!
                </p>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Sunday: 9:00 AM</li>
                  <li>• Wednesday: 6:00 PM</li>
                </ul>
              </div>

              <div className="bg-purple-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition duration-300 flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-3">
                  🎬 Full Video Gallery
                </h3>
                <p className="mb-4 text-purple-100">
                  Explore our complete video collection organized by categories, watch live streams, 
                  and browse all messages in one place!
                </p>
                <a
                  href="/video-gallery"
                  className="inline-block text-center px-6 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                >
                  Go to Video Gallery
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prayer & Testimonies Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">Prayer & Testimonies</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Prayer Requests */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition duration-300">
                <div className="text-5xl mb-4 text-center">🙏</div>
                <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Submit Prayer Request</h3>
                <p className="text-gray-700 mb-6 text-center">
                  Our prayer team is ready to intercede for you. Share your prayer requests with us.
                </p>
                <p className="text-purple-700 text-sm mb-6 text-center italic">
                  &quot;The prayer of a righteous person is powerful and effective.&quot; - James 5:16
                </p>
                <div className="text-center">
                  <a
                    href="mailto:prayer@dmga.org?subject=Prayer Request"
                    className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition duration-300 shadow-md"
                  >
                    Send Prayer Request
                  </a>
                </div>
              </div>

              {/* Testimonies */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition duration-300">
                <div className="text-5xl mb-4 text-center">✨</div>
                <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Share Your Testimony</h3>
                <p className="text-gray-700 mb-6 text-center">
                  Has God moved in your life? Share your testimony to encourage others in their faith journey.
                </p>
                <p className="text-purple-700 text-sm mb-6 text-center italic">
                  &quot;They overcame by the blood of the Lamb and the word of their testimony.&quot; - Rev 12:11
                </p>
                <div className="text-center">
                  <a
                    href="mailto:testimonies@dmga.org?subject=My Testimony"
                    className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition duration-300 shadow-md"
                  >
                    Share Testimony
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Step Into Your Destiny</h2>
            <p className="text-xl text-purple-200 mb-8">
              God has a purpose and plan for your life. Come and discover what He has in store for you.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg"
            >
              Plan Your Visit
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home

