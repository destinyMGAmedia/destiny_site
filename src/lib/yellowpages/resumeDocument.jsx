// ATS-friendly résumé PDF for an INDIVIDUAL listing. Deliberately plain: single column, one
// standard font (Helvetica, built into @react-pdf/renderer), no tables / columns / graphics /
// icons — so applicant tracking systems can extract the text cleanly. Rendered server-side by
// GET /api/yellowpages/listings/[id]/resume.
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 44, paddingHorizontal: 52, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', lineHeight: 1.45 },
  name: { fontSize: 20, fontFamily: 'Helvetica-Bold' },
  headline: { fontSize: 11, marginTop: 2, color: '#333' },
  contactLine: { fontSize: 9, marginTop: 4, color: '#444' },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 16, marginBottom: 4, textTransform: 'uppercase', borderBottom: '1 solid #999', paddingBottom: 2 },
  entryHeader: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginTop: 8 },
  entryMeta: { fontSize: 9, color: '#555', marginBottom: 2 },
  body: { fontSize: 10 },
  para: { marginTop: 2 },
})

const clean = (v) => (typeof v === 'string' ? v.trim() : '')
const arr = (v) => (Array.isArray(v) ? v : [])

function dateRange(start, end, current) {
  const s = clean(start)
  const e = current ? 'Present' : clean(end)
  if (s && e) return `${s} – ${e}`
  return s || e || ''
}

function Section({ title, children }) {
  return (
    <View wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

export function ResumeDocument({ listing = {} }) {
  const name = clean(listing.name) || 'Résumé'
  const headline = clean(listing.headline)
  const summary = clean(listing.resumeSummary) || clean(listing.description)
  const location = [listing.city, listing.state, listing.country].map(clean).filter(Boolean).join(', ')
  const contactBits = [clean(listing.email), clean(listing.phone), location, clean(listing.website)].filter(Boolean)

  const skills = arr(listing.skills).map(clean).filter(Boolean)
  const languages = arr(listing.languages).map(clean).filter(Boolean)
  const experience = arr(listing.experience)
  const education = arr(listing.education)
  const projects = arr(listing.projects)
  const certifications = clean(listing.certifications)

  return (
    <Document title={`${name} — Résumé`} author={name}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{name}</Text>
        {headline ? <Text style={styles.headline}>{headline}</Text> : null}
        {contactBits.length ? <Text style={styles.contactLine}>{contactBits.join('  |  ')}</Text> : null}

        {summary ? (
          <Section title="Summary">
            <Text style={styles.body}>{summary}</Text>
          </Section>
        ) : null}

        {skills.length ? (
          <Section title="Skills">
            <Text style={styles.body}>{skills.join(', ')}</Text>
          </Section>
        ) : null}

        {experience.length ? (
          <Section title="Experience">
            {experience.map((x, i) => {
              const title = clean(x.title)
              const org = clean(x.organization)
              const meta = [dateRange(x.startDate, x.endDate, x.current), clean(x.location)].filter(Boolean).join('  |  ')
              return (
                <View key={i} wrap={false}>
                  <Text style={styles.entryHeader}>{[title, org].filter(Boolean).join(' — ')}</Text>
                  {meta ? <Text style={styles.entryMeta}>{meta}</Text> : null}
                  {clean(x.description) ? <Text style={[styles.body, styles.para]}>{clean(x.description)}</Text> : null}
                </View>
              )
            })}
          </Section>
        ) : null}

        {education.length ? (
          <Section title="Education">
            {education.map((x, i) => {
              const degree = [clean(x.degree), clean(x.field)].filter(Boolean).join(', ')
              const meta = dateRange(x.startYear, x.endYear)
              return (
                <View key={i} wrap={false}>
                  <Text style={styles.entryHeader}>{[degree, clean(x.school)].filter(Boolean).join(' — ')}</Text>
                  {meta ? <Text style={styles.entryMeta}>{meta}</Text> : null}
                  {clean(x.description) ? <Text style={[styles.body, styles.para]}>{clean(x.description)}</Text> : null}
                </View>
              )
            })}
          </Section>
        ) : null}

        {projects.length ? (
          <Section title="Projects">
            {projects.map((x, i) => (
              <View key={i} wrap={false}>
                <Text style={styles.entryHeader}>{[clean(x.name), clean(x.role)].filter(Boolean).join(' — ')}</Text>
                {clean(x.url) ? <Text style={styles.entryMeta}>{clean(x.url)}</Text> : null}
                {clean(x.description) ? <Text style={[styles.body, styles.para]}>{clean(x.description)}</Text> : null}
              </View>
            ))}
          </Section>
        ) : null}

        {certifications ? (
          <Section title="Certifications">
            <Text style={styles.body}>{certifications}</Text>
          </Section>
        ) : null}

        {languages.length ? (
          <Section title="Languages">
            <Text style={styles.body}>{languages.join(', ')}</Text>
          </Section>
        ) : null}
      </Page>
    </Document>
  )
}

/** Renders the résumé to a PDF Buffer. Kept here so route files stay JSX-free. */
export function renderResumePdf(listing) {
  return renderToBuffer(<ResumeDocument listing={listing} />)
}

export default ResumeDocument
