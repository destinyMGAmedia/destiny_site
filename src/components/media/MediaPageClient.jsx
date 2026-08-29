'use client'
import { useState } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { Video, Music, Image, PlayCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import CloudinaryImage from '@/components/ui/CloudinaryImage'

export default function MediaPageClient({ hasChannel, youtubeVideos, featuredVideo, audioContent, mediaItems }) {
  return (
    <MediaTabs 
      hasChannel={hasChannel}
      youtubeVideos={youtubeVideos}
      featuredVideo={featuredVideo}
      audioContent={audioContent}
      mediaItems={mediaItems}
    />
  )
}

function MediaTabs({ hasChannel, youtubeVideos, featuredVideo, audioContent, mediaItems }) {
  const [activeTab, setActiveTab] = useState('videos')

  const tabs = [
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'photos', label: 'Photos', icon: Image },
  ]

  return (
    <div className="section-container">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-12">
        <div className="flex bg-white rounded-2xl p-2 shadow-lg">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  isActive 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' && (
        <VideoSection hasChannel={hasChannel} youtubeVideos={youtubeVideos} featuredVideo={featuredVideo} />
      )}
      {activeTab === 'audio' && (
        <AudioSection audioContent={audioContent} />
      )}
      {activeTab === 'photos' && (
        <PhotoSection mediaItems={mediaItems} />
      )}
    </div>
  )
}

function VideoSection({ hasChannel, youtubeVideos, featuredVideo }) {
  return (
    <section className="mb-20">
      <SectionHeader 
        label="Latest Messages" 
        title="Sermon Videos" 
        subtitle="Watch our latest services and special messages"
      />
      
      <div className="mt-8">
        {hasChannel && featuredVideo ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Featured Video */}
            <div className="lg:col-span-2">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-xl">
                <iframe
                  src={`https://www.youtube.com/embed/${featuredVideo.id}`}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={featuredVideo.title}
                />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
                  {featuredVideo.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar size={16} />
                  {new Date(featuredVideo.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <p className="text-gray-600 line-clamp-3">
                  {featuredVideo.description}
                </p>
              </div>
            </div>

            {/* Video Playlist */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">More Sermons</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {youtubeVideos.slice(1, 8).map(video => (
                  <Link
                    key={video.id}
                    href={`/media/video/${video.id}`}
                    className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={video.thumbnail} 
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <PlayCircle size={16} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-purple-800">
                        {video.title}
                      </h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(video.publishedAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link 
                href="/media/videos"
                className="btn-secondary w-full"
              >
                View All Videos
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl flex items-center justify-center text-center py-20 px-6"
            style={{ background: 'var(--purple-900)', minHeight: '300px' }}
          >
            <div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,179,0,0.15)' }}>
                <Video size={24} style={{ color: 'var(--gold-500)' }} />
              </div>
              <p className="text-white font-bold text-xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>Sermon Videos Coming Soon</p>
              <p className="text-white/50 text-sm">Videos will appear here once the YouTube channel is configured.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function AudioSection({ audioContent }) {
  return (
    <section className="mb-20">
      <SectionHeader 
        label="Listen Anytime" 
        title="Audio Sermons" 
        subtitle="Download or stream audio messages"
      />
      
      <div className="mt-8">
        {audioContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {audioContent.map(audio => (
              <Link
                key={audio.id}
                href={`/media/audio/${audio.id}`}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="flex items-start gap-4">
                  {audio.thumbnail ? (
                    <img 
                      src={audio.thumbnail} 
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--purple-100)' }}>
                      <Music size={24} style={{ color: 'var(--purple-700)' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-800">
                      {audio.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{audio.speaker}</p>
                    <p className="text-xs text-gray-500">
                      {audio.assembly.name} • {audio.duration ? `${Math.round(audio.duration / 60)}min` : 'Listen'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--purple-100)' }}>
              <Music size={24} style={{ color: 'var(--purple-700)' }} />
            </div>
            <p className="font-semibold text-gray-700 mb-1">Audio Sermons Coming Soon</p>
            <p className="text-sm text-gray-500">Audio messages will be available here soon.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function PhotoSection({ mediaItems }) {
  return (
    <section className="mb-20">
      <SectionHeader 
        label="Moments Captured" 
        title="Photo Gallery" 
        subtitle="Pictures from our services and events"
      />
      
      <div className="mt-8">
        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map(photo => (
              <Link
                key={photo.id}
                href={`/media/photo/${photo.id}`}
                className="relative aspect-square rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all"
              >
                <CloudinaryImage
                  src={photo.url}
                  alt={photo.caption || 'DMGA Photo'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--purple-100)' }}>
              <Image size={24} style={{ color: 'var(--purple-700)' }} />
            </div>
            <p className="font-semibold text-gray-700 mb-1">Photo Gallery Coming Soon</p>
            <p className="text-sm text-gray-500">Photos from services and events will be displayed here.</p>
          </div>
        )}
      </div>
    </section>
  )
}