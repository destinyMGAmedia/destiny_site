import { useState, useEffect, useRef } from 'react'

export default function Carousel({ children, autoPlayInterval = 5000 }) {
  const [index, setIndex] = useState(0)
  const sliderRef = useRef(null)
  const slides = Array.isArray(children) ? children : [children]

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => next(), autoPlayInterval)
    return () => clearInterval(timer)
  }, [index, slides.length])

  const next = () => setIndex((prev) => (prev + 1) % slides.length)
  const prev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length)

  // Slide movement
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${index * 100}%)`
    }
  }, [index])

  return (
    <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl">

      {/* Slider Wrapper */}
      <div
        ref={sliderRef}
        className="flex transition-transform duration-700 ease-out"
        style={{ width: `${slides.length * 100}%` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full flex-shrink-0 flex justify-center">
            
            {/* IMPORTANT FIX: no forced aspect ratio here */}
            <div className="w-full rounded-2xl overflow-hidden shadow-xl">
              {slide}
            </div>

          </div>
        ))}
      </div>

      {/* Prev Button */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 
        bg-purple-900/90 text-white py-3 px-5 rounded-full hover:bg-purple-900/60 z-10"
      >
        ❮
      </button>

      {/* Next Button */}
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 
        bg-purple-900/90 text-white py-3 px-5 rounded-full hover:bg-purple-900/60 z-10"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition 
            ${index === i ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  )
}
