import Image from 'next/image'

export default function CustomSection({ section }) {
  const content = section.customContent || {}
  const id = section.title.toLowerCase().replace(/\s+/g, '-')
  const layout = content.layout || 'text'

  return (
    <section id={id} className="section-ivory">
      <div className="section-container">
        <div className={`flex flex-col ${layout === 'image-right' ? 'lg:flex-row' : layout === 'image-left' ? 'lg:flex-row-reverse' : ''} gap-10 items-center`}>
          {/* Text */}
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--gold-500)' }}>
              {section.title}
            </span>
            {content.heading && (
              <h2 className="section-heading mb-4">{content.heading}</h2>
            )}
            <div className="w-14 h-1 rounded-full mb-4" style={{ background: 'var(--gold-500)' }} />
            {content.body && (
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{content.body}</p>
            )}
            {content.ctaText && content.ctaLink && (
              <a href={content.ctaLink} className="btn-primary mt-6 inline-flex">
                {content.ctaText}
              </a>
            )}
          </div>

          {/* Image */}
          {content.imageUrl && layout !== 'text' && (
            <div className="flex-1 w-full">
              <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={content.imageUrl}
                  alt={content.heading || section.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
