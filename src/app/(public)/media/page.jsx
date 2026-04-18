import prisma from '@/lib/prisma'
import SectionHeader from '@/components/ui/SectionHeader'
<<<<<<< HEAD
import { Video, Music, Image, PlayCircle, Calendar } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import Link from 'next/link'
import CloudinaryImage from '@/components/ui/CloudinaryImage'

export const metadata = {
  title: 'Media — Sermons, Music & Photos',
  description: 'Watch sermons, listen to worship music, and view photos from DMGA.',
=======
import { Video } from 'lucide-react'

export const metadata = {
  title: 'Media — Sermons & Music',
  description: 'Watch and listen to sermons, worship music, and messages from DMGA.',
>>>>>>> origin/main
}

export const revalidate = 3600

<<<<<<< HEAD
async function getYouTubeVideos(channelId) {
  if (!channelId || channelId.startsWith('PLACEHOLDER')) return []
  
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY
    if (!API_KEY) return []
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) return []
    const data = await response.json()
    
    return data.items?.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    })) || []
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    return []
  }
}

export default async function MediaPage() {
  // Get YouTube channel first (lightweight query)
=======
export default async function MediaPage() {
>>>>>>> origin/main
  const mainChannel = await prisma.youtubeChannel.findUnique({
    where: { channelType: 'MAIN_LIVE' },
  })

<<<<<<< HEAD
  // Then get media content in batch (2 queries instead of 3 concurrent)
  const [audioContent, mediaItems] = await Promise.all([
    prisma.audioContent.findMany({
      take: 8,
      orderBy: { publishedAt: 'desc' },
      include: { assembly: { select: { name: true, slug: true } } }
    }),
    prisma.mediaItem.findMany({
      where: { type: 'PHOTO' },
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: { assembly: { select: { name: true, slug: true } } }
    })
  ])

  const hasChannel = mainChannel && !mainChannel.channelId.startsWith('PLACEHOLDER')
  const youtubeVideos = hasChannel ? await getYouTubeVideos(mainChannel.channelId) : []
  const featuredVideo = youtubeVideos[0]

  return (
    <div className="section-ivory min-h-screen">
=======
  const hasChannel = mainChannel && !mainChannel.channelId.startsWith('PLACEHOLDER')

  return (
    <div className="section-ivory min-h-screen">

>>>>>>> origin/main
      {/* Header */}
      <div
        className="relative py-24 px-6 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--purple-900), var(--purple-700))' }}
      >
<<<<<<< HEAD
        <BackButton className="absolute top-8 left-8 z-20" />
=======
>>>>>>> origin/main
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--gold-500)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,179,0,0.15)' }}>
            <Video size={24} style={{ color: 'var(--gold-500)' }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Media</h1>
<<<<<<< HEAD
          <p className="text-white/60">Sermons, worship, music, and moments from DMGA</p>
=======
          <p className="text-white/60">Sermons, worship, and messages from DMGA</p>
>>>>>>> origin/main
        </div>
      </div>

      <div className="section-container">
<<<<<<< HEAD
        {/* Format Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-white rounded-2xl p-2 shadow-lg">
            <a href="#videos" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-100 text-purple-800 font-semibold text-sm">
              <Video size={18} />
              Videos
            </a>
            <a href="#audio" className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors font-semibold text-sm">
              <Music size={18} />
              Audio
            </a>
            <a href="#photos" className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors font-semibold text-sm">
              <Image size={18} />
              Photos
            </a>
          </div>
        </div>

        {/* VIDEO SECTION */}
        <section id="videos" className="mb-20">
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
=======

        {/* Live / Sermon Archive */}
        <div className="mb-16">
          <SectionHeader label="Live Services" title="Sermon Archive" subtitle="Watch past services and messages" />
          <div className="mt-8">
            {hasChannel ? (
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-3xl shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed?listType=user_uploads&list=${mainChannel.channelId}&index=1`}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="DMGA Sermons"
                />
              </div>
            ) : (
              <div
                className="rounded-3xl flex items-center justify-center text-center py-20 px-6"
>>>>>>> origin/main
                style={{ background: 'var(--purple-900)', minHeight: '300px' }}
              >
                <div>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,179,0,0.15)' }}>
                    <Video size={24} style={{ color: 'var(--gold-500)' }} />
                  </div>
<<<<<<< HEAD
                  <p className="text-white font-bold text-xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>Sermon Videos Coming Soon</p>
                  <p className="text-white/50 text-sm">Videos will appear here once the YouTube channel is configured.</p>
=======
                  <p className="text-white font-bold text-xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>Sermon Archive Coming Soon</p>
                  <p className="text-white/50 text-sm">Videos will appear here once the channel is configured.</p>
>>>>>>> origin/main
                </div>
              </div>
            )}
          </div>
<<<<<<< HEAD
        </section>

        {/* AUDIO SECTION */}
        <section id="audio" className="mb-20">
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

        {/* PHOTOS SECTION */}
        <section id="photos" className="mb-20">
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
      </div>
    </div>
  )
}
=======
        </div>

        {/* Placeholder for future audio sermons */}
        <div
          className="rounded-3xl p-8 text-center"
          style={{ background: 'var(--surface-alt)' }}
        >
          <p className="font-semibold text-gray-500 mb-1">Audio Sermons</p>
          <p className="text-sm text-gray-400">Audio sermons from assemblies will be available here.</p>
        </div>

      </div>
    </div>
  )
}
>>>>>>> origin/main
