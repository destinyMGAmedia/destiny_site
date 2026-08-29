/**
 * Self-contained flat-style illustration of people at work (a tradesperson, a laptop-based
 * professional, a market seller) for the cover page hero — no external image dependency.
 * Themed off the .yp-theme CSS variables so it matches the palette automatically.
 */
export default function WorkersIllustration() {
  return (
    <svg viewBox="0 0 480 340" role="img" aria-label="Illustration of people offering their skills and businesses" className="w-full h-auto">
      <rect x="0" y="270" width="480" height="70" rx="8" fill="var(--yp-yellow-100)" />

      {/* Figure 1 — tradesperson with a toolbox */}
      <g transform="translate(50,110)">
        <circle cx="40" cy="30" r="26" fill="var(--yp-yellow-400)" />
        <rect x="14" y="56" width="52" height="90" rx="18" fill="var(--yp-ink)" />
        <rect x="6" y="150" width="26" height="70" rx="8" fill="var(--yp-ink-soft)" />
        <rect x="48" y="150" width="26" height="70" rx="8" fill="var(--yp-ink-soft)" />
        <rect x="-6" y="190" width="34" height="24" rx="6" fill="var(--yp-yellow-600)" />
      </g>

      {/* Figure 2 — laptop professional (centre, slightly taller/forward) */}
      <g transform="translate(190,90)">
        <circle cx="50" cy="26" r="28" fill="var(--yp-yellow-500)" />
        <rect x="20" y="54" width="60" height="100" rx="20" fill="var(--yp-ink-soft)" />
        <rect x="10" y="150" width="80" height="14" rx="6" fill="var(--yp-ink)" />
        <rect x="30" y="120" width="40" height="26" rx="4" fill="var(--yp-cream)" />
      </g>

      {/* Figure 3 — market seller with a tray of goods */}
      <g transform="translate(340,115)">
        <circle cx="35" cy="28" r="24" fill="var(--yp-yellow-400)" />
        <rect x="10" y="52" width="50" height="86" rx="16" fill="var(--yp-ink)" />
        <rect x="-10" y="86" width="90" height="16" rx="6" fill="var(--yp-yellow-600)" />
        <circle cx="0" cy="90" r="8" fill="var(--yp-yellow-200)" />
        <circle cx="20" cy="86" r="8" fill="var(--yp-yellow-200)" />
        <circle cx="40" cy="90" r="8" fill="var(--yp-yellow-200)" />
        <rect x="0" y="138" width="20" height="62" rx="7" fill="var(--yp-ink-soft)" />
        <rect x="42" y="138" width="20" height="62" rx="7" fill="var(--yp-ink-soft)" />
      </g>

      {/* Ground line + accent dots */}
      <circle cx="120" cy="60" r="5" fill="var(--yp-yellow-400)" />
      <circle cx="420" cy="70" r="7" fill="var(--yp-yellow-200)" />
      <circle cx="250" cy="40" r="4" fill="var(--yp-yellow-600)" />
    </svg>
  )
}
