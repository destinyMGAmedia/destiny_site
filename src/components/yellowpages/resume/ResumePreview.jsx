'use client'

// On-screen approximation of the résumé PDF. Not pixel-perfect to @react-pdf output — just a
// faithful, readable preview so the owner sees the structure, template feel, and content
// before downloading. Single column, standard headings — same ATS-safe shape as the PDF.

const TEMPLATE_CLASS = {
  CLASSIC: 'yp-resume-classic',
  COMPACT: 'yp-resume-compact',
  MODERN: 'yp-resume-modern',
}

function Section({ title, children }) {
  return (
    <section className="yp-resume-section">
      <h3 className="yp-resume-h">{title}</h3>
      {children}
    </section>
  )
}

const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

export default function ResumePreview({ model }) {
  const c = model.contact
  const primaryContact = [c.email, c.phone, c.location, c.website].filter(Boolean).join('  |  ')
  const socialContact = c.links.map((l) => `${titleCase(l.label)}: ${l.value}`).join('   ')

  return (
    <div className={`yp-resume-sheet ${TEMPLATE_CLASS[model.template] || TEMPLATE_CLASS.CLASSIC}`}>
      <header className="yp-resume-head">
        <h2 className="yp-resume-name">{model.name}</h2>
        {model.headline && <p className="yp-resume-headline">{model.headline}</p>}
        {primaryContact && <p className="yp-resume-contact">{primaryContact}</p>}
        {socialContact && <p className="yp-resume-contact yp-resume-contact-2">{socialContact}</p>}
      </header>

      {model.summary && (
        <Section title="Summary">
          <p>{model.summary}</p>
        </Section>
      )}

      {model.skills.length > 0 && (
        <Section title="Skills">
          <p>{model.skills.join(', ')}</p>
        </Section>
      )}

      {model.experience.length > 0 && (
        <Section title={model.experienceHeading}>
          {model.experience.map((x, i) => (
            <div key={i} className="yp-resume-entry">
              <p className="yp-resume-entry-h">{[x.title, x.organization].filter(Boolean).join(' — ')}</p>
              {[x.dateRange, x.location].filter(Boolean).length > 0 && (
                <p className="yp-resume-meta">{[x.dateRange, x.location].filter(Boolean).join('  |  ')}</p>
              )}
              {x.bullets.length > 0 && (
                <ul className="yp-resume-bullets">
                  {x.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {model.education.length > 0 && (
        <Section title="Education">
          {model.education.map((x, i) => (
            <div key={i} className="yp-resume-entry">
              <p className="yp-resume-entry-h">{[x.heading, x.org].filter(Boolean).join(' — ')}</p>
              {x.meta && <p className="yp-resume-meta">{x.meta}</p>}
              {x.description && <p>{x.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {model.projects.length > 0 && (
        <Section title="Projects">
          {model.projects.map((x, i) => (
            <div key={i} className="yp-resume-entry">
              <p className="yp-resume-entry-h">{x.heading}</p>
              {x.url && <p className="yp-resume-meta">{x.url}</p>}
              {x.description && <p>{x.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {model.certifications && (
        <Section title="Certifications">
          <p>{model.certifications}</p>
        </Section>
      )}

      {model.languages.length > 0 && (
        <Section title="Languages">
          <p>{model.languages.join(', ')}</p>
        </Section>
      )}
    </div>
  )
}
