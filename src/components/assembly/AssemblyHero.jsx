'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
<<<<<<< HEAD
import BackButton from '@/components/ui/BackButton'
=======
>>>>>>> origin/main

function resolveBg(bg) {
  if (!bg) return null
  if (bg.type === 'image' && bg.image) return { background: `url(${bg.image}) center/cover no-repeat` }
  if (bg.type === 'gradient' && bg.gradient) return { background: bg.gradient }
  // type may be 'color' or absent (BackgroundPicker defaults to colour tab without writing type)
  if (bg.color && (!bg.type || bg.type === 'color')) return { background: bg.color }
  return null
}

export default function AssemblyHero({ assembly, heroSection }) {
  const cc = heroSection?.customContent || {}

  // Heading / subheading from customContent, fallback to assembly fields
  const heading = cc.heading || assembly.welcomeText || `Welcome to ${assembly.name}`
  const subheading = cc.subheading || assembly.tagline || ''
  const ctaText = cc.ctaText || null
  const ctaLink = cc.ctaLink || '#find-us'

  // Background resolution:
  // 1. customContent.bg (colour/gradient/image from BackgroundPicker)
  // 2. customContent.heroImage (single image uploaded in HeroForm)
  // 3. assembly.heroImages[] / assembly.heroImage (legacy)
  const bgStyle = resolveBg(cc.bg)
  const customHeroImage = cc.heroImage || null
  const legacyImages = assembly.heroImages?.length
    ? assembly.heroImages
    : [assembly.heroImage].filter(Boolean)

  // Which image array to cycle through
  const images = customHeroImage ? [customHeroImage] : legacyImages
  const hasImages = !bgStyle && images.length > 0

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % images.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section id="hero" className="relative min-h-[70vh] flex items-end">
<<<<<<< HEAD
      <BackButton className="absolute top-8 left-8 z-20" />
=======
>>>>>>> origin/main
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {bgStyle ? (
          // Solid colour or gradient from BackgroundPicker
          <div className="absolute inset-0" style={bgStyle} />
        ) : hasImages ? (
          images.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === current ? 1 : 0 }}
            >
              <Image src={src} alt={assembly.name} fill sizes="100vw" className="object-cover" priority={i === 0} />
            </div>
          ))
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, var(--purple-900), var(--purple-700))' }}
          />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 pt-24">
        <div className="max-w-2xl">
          {assembly.isHQ && (
            <span className="pill pill-gold mb-4 inline-block">Headquarters</span>
          )}
          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {heading}
          </h1>
          {subheading && (
            <p className="text-lg text-white/80 mb-8">{subheading}</p>
          )}
          <div className="flex flex-wrap gap-3">
            {ctaText ? (
              <a href={ctaLink} className="btn-primary">{ctaText}</a>
            ) : (
              <a href="#find-us" className="btn-primary">Find Us</a>
            )}
            <a href="#giving" className="btn-outline-white">Give</a>
          </div>
        </div>
      </div>

      {/* Image dots */}
      {hasImages && images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: i === current ? 'var(--gold-500)' : 'rgba(255,255,255,0.4)',
                transform: i === current ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
