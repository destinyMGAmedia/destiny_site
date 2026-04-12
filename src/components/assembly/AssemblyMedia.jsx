'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SectionWrapper from './SectionWrapper'
import { Play, ArrowRight, ImageIcon, Music, Video, Image as ImgIcon } from 'lucide-react'

function PhotoGrid({ items }) {
  const [lightbox, setLightbox] = useState(null)
  const photos = items.filter((i) => i.type === 'PHOTO')

  if (!photos.length) return <p className="text-gray-400 text-sm text-center py-6">No photos uploaded yet.</p>

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.slice(0, 9).map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setLightbox(item.url)}
          >
            <Image src={item.url} alt={item.caption || ''} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
            {item.caption && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end p-2">
                <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] rounded-xl object-contain" />
        </div>
      )}
    </>
  )
}

function AudioList({ items }) {
  const [playing, setPlaying] = useState(null)
  const audios = items.slice(0, 4)

  if (!audios.length) return <p className="text-gray-400 text-sm text-center py-6">No audio uploaded yet.</p>

  return (
    <div className="space-y-3">
      {audios.map((a) => (
        <div key={a.id} className="audio-player flex items-center gap-4">
          <button
            onClick={() => setPlaying(playing === a.id ? null : a.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--gold-500)' }}
          >
            <Play size={16} style={{ color: 'var(--purple-900)' }} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{a.title}</p>
            <p className="text-xs text-white/60">{a.speaker}</p>
          </div>
          {playing === a.id && (
            <audio autoPlay controls src={a.audioUrl} className="hidden" onEnded={() => setPlaying(null)} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function AssemblyMedia({ mediaItems, audioContent, assemblySlug, youtubeChannelId, section }) {
  const [tab, setTab] = useState('photos')
  const videos = mediaItems.filter((i) => i.type === 'VIDEO')

  const tabs = [
    { key: 'photos', label: 'Photos', icon: ImageIcon },
    { key: 'audio',  label: 'Sermons', icon: Music },
    ...(youtubeChannelId || videos.length ? [{ key: 'video', label: 'Video', icon: Video }] : []),
  ]

  const libraryLink = (
    <Link href={`/media?assembly=${assemblySlug}`} className="btn-outline btn-sm mt-1">
      Full Library <ArrowRight size={13} />
    </Link>
  )

  return (
    <SectionWrapper
      id="media"
      bgClass="section-white"
      section={section}
      defaultLabel="Gallery"
      defaultTitle="Media"
      headerRight={libraryLink}
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`admin-tab flex items-center gap-2 ${tab === t.key ? 'active' : ''}`}
            >
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'photos' && <PhotoGrid items={mediaItems} />}
      {tab === 'audio'  && <AudioList items={audioContent} />}
      {tab === 'video'  && (
        <div className="space-y-4">
          {youtubeChannelId && (
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl">
              <iframe
                src={`https://www.youtube.com/embed?listType=user_uploads&list=${youtubeChannelId}`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {videos.map((v) => (
            <div key={v.id} className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl">
              <iframe
                src={v.url.replace('watch?v=', 'embed/')}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                title={v.caption || ''}
              />
            </div>
          ))}
        </div>
      )}
    </SectionWrapper>
  )
}
