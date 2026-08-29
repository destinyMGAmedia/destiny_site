// ATS-friendly résumé PDF for an INDIVIDUAL listing. Every template is single column, one
// standard font (Helvetica, built into @react-pdf/renderer), standard section headings, and
// no tables / columns / graphics / icons — so applicant tracking systems extract the text
// cleanly. Templates differ only in typography and spacing.
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { buildResumeModel } from './resumeModel'

const TEMPLATE_STYLES = {
  CLASSIC: {
    page: { paddingTop: 44, paddingBottom: 44, paddingHorizontal: 52, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', lineHeight: 1.45 },
    name: { fontSize: 20, fontFamily: 'Helvetica-Bold' },
    headline: { fontSize: 11, marginTop: 2, color: '#333' },
    contactLine: { fontSize: 9, marginTop: 4, color: '#444' },
    sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 16, marginBottom: 4, textTransform: 'uppercase', borderBottom: '1 solid #999', paddingBottom: 2 },
    entryHeader: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginTop: 8 },
    entryMeta: { fontSize: 9, color: '#555', marginBottom: 2 },
    body: { fontSize: 10 },
    bullet: { fontSize: 10, marginTop: 1, marginLeft: 10, textIndent: -10 },
  },
  COMPACT: {
    page: { paddingTop: 34, paddingBottom: 34, paddingHorizontal: 44, fontFamily: 'Helvetica', fontSize: 9, color: '#1a1a1a', lineHeight: 1.3 },
    name: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
    headline: { fontSize: 10, marginTop: 1, color: '#333' },
    contactLine: { fontSize: 8, marginTop: 3, color: '#444' },
    sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 11, marginBottom: 3, textTransform: 'uppercase' },
    entryHeader: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, marginTop: 5 },
    entryMeta: { fontSize: 8, color: '#555', marginBottom: 1 },
    body: { fontSize: 9 },
    bullet: { fontSize: 9, marginTop: 0.5, marginLeft: 9, textIndent: -9 },
  },
  MODERN: {
    page: { paddingTop: 48, paddingBottom: 48, paddingHorizontal: 56, fontFamily: 'Helvetica', fontSize: 10, color: '#222', lineHeight: 1.5 },
    name: { fontSize: 24, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
    headline: { fontSize: 11, marginTop: 3, color: '#444' },
    contactLine: { fontSize: 9, marginTop: 6, color: '#555', borderBottom: '1 solid #ddd', paddingBottom: 10 },
    sectionTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: '#333' },
    entryHeader: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, marginTop: 10 },
    entryMeta: { fontSize: 9, color: '#666', marginBottom: 3 },
    body: { fontSize: 10 },
    bullet: { fontSize: 10, marginTop: 2, marginLeft: 11, textIndent: -11 },
  },
}

function Section({ styles, title, children }) {
  return (
    <View wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function Bullets({ styles, items }) {
  return items.map((b, i) => (
    <Text key={i} style={styles.bullet}>• {b}</Text>
  ))
}

export function ResumeDocument({ model }) {
  const styles = StyleSheet.create(TEMPLATE_STYLES[model.template] || TEMPLATE_STYLES.CLASSIC)
  const c = model.contact
  const contactBits = [c.email, c.phone, c.location, c.website, ...c.links.map((l) => `${l.label}: ${l.value}`)].filter(Boolean)

  return (
    <Document title={`${model.name} — ${model.docWord}`} author={model.name}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{model.name}</Text>
        {model.headline ? <Text style={styles.headline}>{model.headline}</Text> : null}
        {contactBits.length ? <Text style={styles.contactLine}>{contactBits.join('  |  ')}</Text> : null}

        {model.summary ? (
          <Section styles={styles} title="Summary">
            <Text style={styles.body}>{model.summary}</Text>
          </Section>
        ) : null}

        {model.skills.length ? (
          <Section styles={styles} title="Skills">
            <Text style={styles.body}>{model.skills.join(', ')}</Text>
          </Section>
        ) : null}

        {model.experience.length ? (
          <Section styles={styles} title={model.experienceHeading}>
            {model.experience.map((x, i) => {
              const meta = [x.dateRange, x.location].filter(Boolean).join('  |  ')
              return (
                <View key={i} wrap={false}>
                  <Text style={styles.entryHeader}>{[x.title, x.organization].filter(Boolean).join(' — ')}</Text>
                  {meta ? <Text style={styles.entryMeta}>{meta}</Text> : null}
                  <Bullets styles={styles} items={x.bullets} />
                </View>
              )
            })}
          </Section>
        ) : null}

        {model.education.length ? (
          <Section styles={styles} title="Education">
            {model.education.map((x, i) => (
              <View key={i} wrap={false}>
                <Text style={styles.entryHeader}>{[x.heading, x.org].filter(Boolean).join(' — ')}</Text>
                {x.meta ? <Text style={styles.entryMeta}>{x.meta}</Text> : null}
                {x.description ? <Text style={styles.body}>{x.description}</Text> : null}
              </View>
            ))}
          </Section>
        ) : null}

        {model.projects.length ? (
          <Section styles={styles} title="Projects">
            {model.projects.map((x, i) => (
              <View key={i} wrap={false}>
                <Text style={styles.entryHeader}>{x.heading}</Text>
                {x.url ? <Text style={styles.entryMeta}>{x.url}</Text> : null}
                {x.description ? <Text style={styles.body}>{x.description}</Text> : null}
              </View>
            ))}
          </Section>
        ) : null}

        {model.certifications ? (
          <Section styles={styles} title="Certifications">
            <Text style={styles.body}>{model.certifications}</Text>
          </Section>
        ) : null}

        {model.languages.length ? (
          <Section styles={styles} title="Languages">
            <Text style={styles.body}>{model.languages.join(', ')}</Text>
          </Section>
        ) : null}
      </Page>
    </Document>
  )
}

/** Renders the résumé to a PDF Buffer. Kept here so route files stay JSX-free. */
export function renderResumePdf(listing, opts = {}) {
  const model = buildResumeModel(listing, opts)
  return renderToBuffer(<ResumeDocument model={model} />)
}

export default ResumeDocument
