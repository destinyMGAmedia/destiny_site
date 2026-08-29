'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, Radio, TvMinimalPlay, Clock } from 'lucide-react'

const POLL_INTERVAL_MS = 90_000 // check every 90 seconds

function getNextServiceLabel() {
  const now = new Date()
  // WAT is UTC+1
  const watOffset = 60 // minutes
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000
  const wat = new Date(utcMs + watOffset * 60_000)

  const day = wat.getDay() // 0=Sun, 4=Thu
  const hour = wat.getHours()
  const minute = wat.getMinutes()
  const pastServiceStart = hour > 9 || (hour === 9 && minute >= 0)

  // If it's Sunday and service hasn't ended (~12pm cutoff), say "on now"
  if (day === 0 && hour >= 9 && hour < 12) return 'Streaming Now'
  if (day === 0 && !pastServiceStart) return 'Today — 9:00 AM WAT'
  if (day === 4 && hour >= 9 && hour < 12) return 'Streaming Now'
  if (day === 4 && !pastServiceStart) return 'Today — 9:00 AM WAT'

  // Find days until next Sunday
  const daysUntilSun = (7 - day) % 7 || 7
  if (daysUntilSun === 1) return 'Tomorrow (Sunday) — 9:00 AM WAT'
  return `Next Sunday — 9:00 AM WAT`
}

function LiveThumbnail({ channelId }) {
  const serviceLabel = getNextServiceLabel()
  const isImminentOrLive = serviceLabel === 'Streaming Now'

  return (
    <div className="absolute inset-0 z-10 rounded-3xl overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d0a52 50%, #1a0533 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'var(--gold-500, #FFB300)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-8"
          style={{ background: 'var(--gold-500, #FFB300)' }}
        />
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,179,0,0.5) 40px, rgba(255,179,0,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,179,0,0.5) 40px, rgba(255,179,0,0.5) 41px)'
          }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center px-6">
        <div className="mb-6">
          <Image
            src="/images/dmga-logo.png"
            alt="DMGA"
            width={72}
            height={72}
            className="rounded-xl opacity-90"
          />
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-2 mb-5">
          {isImminentOrLive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,179,0,0.15)', color: 'var(--gold-500, #FFB300)' }}>
              <Radio size={10} />
              LIVE SERVICE
            </span>
          )}
        </div>

        <h3
          className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Destiny Mission<br />Global Assembly
        </h3>

        <p className="text-white/50 text-sm mb-2">Live stream begins on service days</p>

        {/* Schedule */}
        <div className="flex items-center gap-4 mt-3 mb-6 text-sm">
          <div className="flex items-center gap-1.5 text-white/70">
            <Clock size={13} style={{ color: 'var(--gold-500, #FFB300)' }} />
            <span>Sundays &amp; select Thursdays</span>
          </div>
        </div>

        {/* Next service chip */}
        <div className="px-4 py-2 rounded-2xl mb-8 text-sm font-medium"
          style={{
            background: 'rgba(255,179,0,0.12)',
            border: '1px solid rgba(255,179,0,0.25)',
            color: 'var(--gold-500, #FFB300)'
          }}>
          {serviceLabel}
        </div>

        {/* Stream hint */}
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <TvMinimalPlay size={14} />
          <span>Stream will appear here automatically</span>
        </div>
      </div>
    </div>
  )
}

export default function LiveSection({ channelId }) {
  const embedUrl = channelId
    ? `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=0`
    : null

  const [isLive, setIsLive] = useState(false)
  const [checked, setChecked] = useState(false)

  const checkLiveStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/live-status', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setIsLive(!!data.isLive)
      }
    } catch {
      // keep current state on error
    } finally {
      setChecked(true)
    }
  }, [])

  useEffect(() => {
    checkLiveStatus()
    const timer = setInterval(checkLiveStatus, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [checkLiveStatus])

  return (
    <section id="live" className="section-ivory">
      <div className="section-container">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            label="Live Service"
            title="Watch Live"
            subtitle="Join us for worship and the Word"
          />
          <Link href="/media" className="btn-outline btn-sm hidden sm:inline-flex">
            Sermon Archive <ArrowRight size={13} />
          </Link>
        </div>

        {embedUrl ? (
          <>
            {/* Player wrapper — thumbnail overlays the iframe when not live */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title="DMGA Live Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {/* Show thumbnail until we confirm the stream is live */}
              {(!checked || !isLive) && (
                <LiveThumbnail channelId={channelId} />
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {isLive ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                      <Radio size={10} className="animate-pulse" />
                      LIVE NOW
                    </span>
                    <span className="text-sm text-gray-500">9:00 AM WAT</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                      <Radio size={10} />
                      Sundays &amp; select Thursdays
                    </span>
                    <span className="text-sm text-gray-500">9:00 AM WAT</span>
                  </>
                )}
              </div>
              <Link href="/media" className="btn-secondary btn-sm">
                Full Sermon Archive <ArrowRight size={13} />
              </Link>
            </div>
          </>
        ) : (
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{ background: 'var(--purple-900)', minHeight: '320px' }}
          >
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
              style={{ background: 'var(--gold-500)', transform: 'translate(30%, -30%)' }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center py-20 px-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'rgba(255,179,0,0.15)' }}
              >
                <Radio size={28} style={{ color: 'var(--gold-500)' }} />
              </div>
              <p
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Join Us Live
              </p>
              <p className="text-white/50 text-sm">Sundays &amp; select Thursdays — 9:00 AM WAT</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
