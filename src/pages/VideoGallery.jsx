function VideoGallery() {
  // ⚠️ IMPORTANT: Replace with your actual YouTube channel ID
  const YOUTUBE_CHANNEL_ID = "UCH3uj1-ubXiKKhj4WZskflw"
  
  // Shows all uploaded videos with playlist sidebar visible
  const liveStreamUrl = `https://www.youtube.com/embed/videoseries?list=UU${YOUTUBE_CHANNEL_ID.substring(2)}`

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-900 to-pink-600 text-white py-32 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            Video Gallery
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Watch live services or browse our collection of messages and events
          </p>
        </div>
      </div>

      {/* Live Stream Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Latest Videos & Live Streams
                </h2>
              </div>
            </div>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-8"></div>
            
            {/* Channel Videos Player */}
            <div className="bg-gray-100 rounded-xl p-6 shadow-lg mb-8">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={liveStreamUrl}
                  title="DMGA Channel Videos"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  📺 Browse all our uploaded videos and saved live streams from our YouTube channel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Watch on YouTube Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Watch on YouTube
              </h3>
              <p className="text-gray-700 mb-6">
                Subscribe to our channel for notifications when we go live and never miss a service!
              </p>
              <a
                href={`https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}?sub_confirmation=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition duration-300 shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Subscribe on YouTube
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default VideoGallery

