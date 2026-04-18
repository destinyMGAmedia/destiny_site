'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const INTERVAL = 2 * 60 * 1000 // 2 minutes

export default function HeroSection({ slides }) {
  const [current, setCurrent] = useState(0)
  const [greeting, setGreeting] = useState('Welcome')

  // Time-based greeting
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  // Auto-rotate every 2 minutes
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length)
    }, INTERVAL)
    return () => clearInterval(timer)
  }, [slides.length])

  const hasSlides = slides.length > 0

  return (
    <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
      {/* Background slides */}
      <div className="absolute inset-0 z-0">
        {hasSlides ? (
          slides.map((slide, i) => (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-[2000ms]"
              style={{ opacity: i === current ? 1 : 0 }}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.caption || 'DMGA'}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, var(--purple-900) 0%, var(--purple-700) 50%, #1a0040 100%)' }}
          />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(45,0,96,0.85) 0%, rgba(45,0,96,0.5) 50%, rgba(0,0,0,0.1) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl">
          {/* Greeting */}
          {/* <p
            className="text-sm font-semibold tracking-widest uppercase mb-4 opacity-80"
            style={{ color: 'var(--gold-400)' }}
          >
            ICON
          </p> */}
           <Image
                              src="https://res.cloudinary.com/diun1hy3v/image/upload/q_auto/f_auto/v1776378534/dmga/global/branding/favicon.png"
                              alt="Destiny Icon"
                              width={500}
                              height={700}
                              className="brightness-0 invert mb-4"
                              style={{ height: '200px', width: 'auto' }}
                              loading="lazy"
                            />

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Welcome to  <br />
            <span 
            className="text-7xl md:text-9xl lg:text-[7rem] xl:text-[8rem]"
            style={{ 
              color: 'var(--gold-400)',
              lineHeight: '1.0',   // Tighter spacing for larger text
              fontFamily: '"Arial Rounded MT Bold", "Helvetica Rounded", -apple-system, BlinkMacSystemFont, sans-serif'
            }}
            >DESTINY</span>
          </h1>

          <div className="w-16 h-1 rounded-full mb-6" style={{ background: 'var(--gold-500)' }} />

          <p className="text-xl text-white/80 mb-10">
            ... a prophetic church with an apostolic mandate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/assemblies" className="btn-primary">
              Find Your Assembly
            </Link>
            <a href="#live" className="btn-outline-white">
              Watch Live
            </a>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                background: i === current ? 'var(--gold-500)' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-white/30 animate-pulse" />
        <span className="text-white/40 text-xs tracking-widest" style={{ writingMode: 'vertical-rl' }}>SCROLL</span>
      </div>
    </section>
  )
}
