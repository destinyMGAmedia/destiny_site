import prisma from '@/lib/prisma'
import MediaPageClient from '@/components/media/MediaPageClient'
import BackButton from '@/components/ui/BackButton'
import { Video } from 'lucide-react'

export const metadata = {
  title: 'Media — Sermons, Music & Photos',
  description: 'Watch sermons, listen to worship music, and view photos from DMGA.',
}

export const revalidate = 3600

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

async function getMediaData() {
  // Get YouTube channel first (lightweight query)
  const mediaChannel = await prisma.youtubeChannel.findUnique({
    where: { channelType: 'MEDIA_GALLERY' },
  })

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

  const hasChannel = mediaChannel && !mediaChannel.channelId.startsWith('PLACEHOLDER')
  const youtubeVideos = hasChannel ? await getYouTubeVideos(mediaChannel.channelId) : []
  const featuredVideo = youtubeVideos[0]

  return {
    hasChannel,
    youtubeVideos,
    featuredVideo,
    audioContent,
    mediaItems
  }
}

export default async function MediaPage() {
  const { hasChannel, youtubeVideos, featuredVideo, audioContent, mediaItems } = await getMediaData()

  return (
    <div className="section-ivory min-h-screen">
      {/* Header */}
      <div
        className="relative py-24 px-6 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--purple-900), var(--purple-700))' }}
      >
        <BackButton className="absolute top-8 left-8 z-20" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--gold-500)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,179,0,0.15)' }}>
            <Video size={24} style={{ color: 'var(--gold-500)' }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Media</h1>
          <p className="text-white/60">Sermons, worship, music, and moments from DMGA</p>
        </div>
      </div>

      <MediaPageClient 
        hasChannel={hasChannel}
        youtubeVideos={youtubeVideos}
        featuredVideo={featuredVideo}
        audioContent={audioContent}
        mediaItems={mediaItems}
      />
    </div>
  )
}
