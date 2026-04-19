'use client'
import { useEffect, useState } from 'react'

const SECTION_LABELS = {
  FIND_US:      'Find Us',
  FELLOWSHIPS:  'Fellowships',
  ARK_CENTERS:  'Ark Centers',
  DEPARTMENTS:  'Departments',
  EVENTS:       "What's On",
  MEDIA:        'Media',
  GIVING:       'Giving',
  PRAYER:       'Prayer',
  TESTIMONIES:  'Testimonies',
  CONTACT:      'Contact',
  CUSTOM:       null, // uses section.title
}

export default function AssemblyAnchorNav({ sections }) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    sections.forEach((s) => {
      const el = document.getElementById(s.type.toLowerCase().replace('_', '-'))
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="anchor-nav">
      <div className="anchor-nav-inner">
        {sections.map((s) => {
          const label = SECTION_LABELS[s.type] ?? s.title
          if (!label) return null
          const id = s.type === 'CUSTOM'
            ? s.title.toLowerCase().replace(/\s+/g, '-')
            : s.type.toLowerCase().replace('_', '-')

          return (
            <button
              key={s.id}
              onClick={() => scrollTo(id)}
              className={`anchor-nav-item ${activeId === id ? 'active' : ''}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
