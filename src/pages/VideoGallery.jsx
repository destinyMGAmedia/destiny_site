import { useState } from 'react'

function VideoGallery() {
  // ⚠️ IMPORTANT: Replace with your actual YouTube channel ID
  const YOUTUBE_CHANNEL_ID = "UCH3uj1-ubXiKKhj4WZskflw"
  
  // Live stream embed URL (will show live stream when active, or latest video when offline)
  const liveStreamUrl = `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}`
  
  // Add your recent videos here - Get video IDs from YouTube URLs
  // Example: youtube.com/watch?v=VIDEO_ID_HERE
  const recentVideos = [
    {
      id: "VIDEO_ID_1", // Replace with actual video IDs from your channel
      title: "Sunday Service - Latest Message",
      date: "Recent",
      category: "Sunday Services"
    },
    {
      id: "VIDEO_ID_2",
      title: "Midweek Service - Bible Study",
      date: "Recent",
      category: "Midweek Services"
    },
    {
      id: "VIDEO_ID_3",
      title: "Special Conference Highlights",
      date: "Recent",
      category: "Special Events"
    },
    {
      id: "VIDEO_ID_4",
      title: "Teaching Series",
      date: "Recent",
      category: "Teachings"
    },
    {
      id: "VIDEO_ID_5",
      title: "Sunday Service",
      date: "Recent",
      category: "Sunday Services"
    },
    {
      id: "VIDEO_ID_6",
      title: "Prayer & Worship",
      date: "Recent",
      category: "Midweek Services"
    },
  ]

  const categories = ["All", "Sunday Services", "Midweek Services", "Special Events", "Teachings"]

  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Filter videos by category
  const filteredVideos = selectedCategory === "All" 
    ? recentVideos 
    : recentVideos.filter(video => video.category === selectedCategory)

  // Get video to display in main player
  const mainVideoId = selectedVideo || recentVideos[0]?.id

  return (
    <>
      {/* Page Header */}
      <section className="bg-purple-900 py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Video Gallery
          </h1>
          <div className="h-1 w-24 bg-purple-400 mx-auto mb-6"></div>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Watch live services or browse our collection of messages and events
          </p>
        </div>
      </section>

      {/* Live Stream Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Live Stream
                </h2>
              </div>
            </div>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-8"></div>
            
            {/* Live Stream Player */}
            <div className="bg-gray-100 rounded-xl p-6 shadow-lg mb-8">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={liveStreamUrl}
                  title="DMGA Live Stream"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  🔴 When we&apos;re live, the stream will appear above. When offline, you&apos;ll see our most recent video.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Video Player */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Selected Video
            </h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-8"></div>
            
            {/* Large Video Player */}
            <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                <iframe
                  key={mainVideoId} // Force re-render when video changes
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${mainVideoId}`}
                  title="Selected Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  Click on any video below to watch
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Browse Videos
            </h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-8"></div>
            
            {/* Category Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold transition duration-300 ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Video Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedVideo(video.id)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300 cursor-pointer ${
                    selectedVideo === video.id ? 'ring-4 ring-purple-600' : ''
                  }`}
                >
                  {/* Video Thumbnail */}
                  <div className="relative pb-[56.25%] h-0 overflow-hidden bg-gray-200">
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to standard quality if maxres not available
                        e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                      }}
                    />
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition">
                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{video.category}</span>
                      <span>{video.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No videos message */}
            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No videos found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Admin Note */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-purple-100 rounded-xl p-6 border border-purple-300">
              <p className="text-gray-800 text-sm mb-2">
                <strong>📝 Note:</strong> To add your actual videos to this gallery:
              </p>
              <ol className="text-gray-700 text-sm ml-4 space-y-1">
                <li>1. Go to your YouTube channel and find a video</li>
                <li>2. Copy the video ID from the URL (youtube.com/watch?v=<strong>VIDEO_ID</strong>)</li>
                <li>3. Edit <code className="bg-purple-200 px-2 py-1 rounded">src/pages/VideoGallery.jsx</code></li>
                <li>4. Replace <code className="bg-purple-200 px-2 py-1 rounded">VIDEO_ID_1</code>, <code className="bg-purple-200 px-2 py-1 rounded">VIDEO_ID_2</code>, etc. with your actual video IDs</li>
                <li>5. Update titles and dates for each video</li>
              </ol>
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

