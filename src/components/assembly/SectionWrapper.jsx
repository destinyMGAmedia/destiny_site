import SectionHeader from '@/components/ui/SectionHeader'

function resolveBg(bg) {
  if (!bg) return null
  if (bg.type === 'image' && bg.image) return `url(${bg.image}) center/cover no-repeat`
  if (bg.type === 'gradient' && bg.gradient) return bg.gradient
  if (bg.color && (!bg.type || bg.type === 'color')) return bg.color
  return null
}

/**
 * Shared wrapper for all assembly page sections.
 *
 * Handles:
 * - Background override from section.customContent.bg (colour / gradient / image)
 * - Heading override from section.customContent.headingOverride
 * - Intro paragraph from section.customContent.intro
 * - Optional JSX rendered to the right of the section header (headerRight prop)
 */
export default function SectionWrapper({
  id,
  bgClass = 'section-white',
  section,
  defaultLabel,
  defaultTitle,
  defaultSubtitle,
  centered = false,
  light = false,
  headerRight,
  children,
}) {
  const cc = section?.customContent || {}
  const bgValue = resolveBg(cc.bg)
  const title = cc.headingOverride || defaultTitle
  const subtitle = cc.intro !== undefined ? cc.intro : defaultSubtitle

  return (
    <section
      id={id}
      className={bgClass}
      style={bgValue ? { background: bgValue } : undefined}
    >
      <div className="section-container">
        {headerRight ? (
          <div className="flex items-start justify-between mb-8">
            <SectionHeader
              label={defaultLabel}
              title={title}
              subtitle={subtitle}
              centered={centered}
              light={light}
            />
            {headerRight}
          </div>
        ) : (
          <SectionHeader
            label={defaultLabel}
            title={title}
            subtitle={subtitle}
            centered={centered}
            light={light}
          />
        )}
        {children}
      </div>
    </section>
  )
}
