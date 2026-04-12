export default function SectionHeader({ label, title, subtitle, centered = false, light = false }) {
  return (
    <div className={centered ? 'text-center' : ''}>
      {label && (
        <span
          className="text-xs font-bold uppercase tracking-widest mb-3 block"
          style={{ color: 'var(--gold-500)' }}
        >
          {label}
        </span>
      )}
      <h2
        className="section-heading"
        style={{ color: light ? '#fff' : 'var(--purple-900)' }}
      >
        {title}
      </h2>
      <div
        className={`gold-bar mt-3 ${centered ? 'mx-auto' : ''}`}
        style={{ background: light ? 'rgba(255,255,255,0.4)' : 'var(--gold-500)' }}
      />
      {subtitle && (
        <p
          className="section-subheading mt-3"
          style={{ color: light ? 'rgba(255,255,255,0.75)' : 'var(--gray-600)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
