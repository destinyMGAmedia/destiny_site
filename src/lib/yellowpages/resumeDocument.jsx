// ATS-friendly résumé PDF for an INDIVIDUAL listing. Every template is single column, one
// standard font (Helvetica, built into @react-pdf/renderer), standard section headings, and
// no tables / columns / graphics / icons — so applicant tracking systems extract the text
// cleanly. Templates differ only in typography and spacing.
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { buildResumeModel } from './resumeModel'

const TEMPLATE_STYLES = {
  CLASSIC: {
    page: { paddingTop: 42, paddingBottom: 46, paddingHorizontal: 50, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', lineHeight: 1.4 },
    header: { borderBottomWidth: 2, borderBottomColor: '#333', borderBottomStyle: 'solid', paddingBottom: 11, marginBottom: 4 },
    name: { fontSize: 22, fontFamily: 'Helvetica-Bold', letterSpacing: 0.3 },
    headline: { fontSize: 11, marginTop: 5, color: '#333' },
    contactLine: { fontSize: 9, marginTop: 9, color: '#444' },
    contactLine2: { fontSize: 9, marginTop: 3, color: '#666' },
    sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 17, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, borderBottomWidth: 1, borderBottomColor: '#999', borderBottomStyle: 'solid', paddingBottom: 3 },
    entryHeader: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, marginTop: 9 },
    entryMeta: { fontSize: 9, color: '#555', marginTop: 1.5, marginBottom: 3 },
    body: { fontSize: 10, marginTop: 2 },
    bullet: { fontSize: 10, marginTop: 3, marginLeft: 12, textIndent: -12 },
  },
  COMPACT: {
    page: { paddingTop: 34, paddingBottom: 36, paddingHorizontal: 42, fontFamily: 'Helvetica', fontSize: 9, color: '#1a1a1a', lineHeight: 1.32 },
    header: { borderBottomWidth: 1, borderBottomColor: '#444', borderBottomStyle: 'solid', paddingBottom: 8, marginBottom: 3 },
    name: { fontSize: 17, fontFamily: 'Helvetica-Bold' },
    headline: { fontSize: 10, marginTop: 3, color: '#333' },
    contactLine: { fontSize: 8, marginTop: 6, color: '#444' },
    contactLine2: { fontSize: 8, marginTop: 2, color: '#666' },
    sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
    entryHeader: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, marginTop: 6 },
    entryMeta: { fontSize: 8, color: '#555', marginTop: 0.5, marginBottom: 2 },
    body: { fontSize: 9, marginTop: 1.5 },
    bullet: { fontSize: 9, marginTop: 2, marginLeft: 10, textIndent: -10 },
  },
  MODERN: {
    page: { paddingTop: 48, paddingBottom: 48, paddingHorizontal: 58, fontFamily: 'Helvetica', fontSize: 10, color: '#222', lineHeight: 1.5 },
    header: { marginBottom: 6 },
    name: { fontSize: 27, fontFamily: 'Helvetica-Bold', letterSpacing: 0.6 },
    headline: { fontSize: 11.5, marginTop: 7, color: '#555' },
    contactLine: { fontSize: 9, marginTop: 12, color: '#555', borderTopWidth: 1, borderTopColor: '#ddd', borderTopStyle: 'solid', paddingTop: 9 },
    contactLine2: { fontSize: 9, marginTop: 3, color: '#777' },
    sectionTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', marginTop: 21, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 1.6, color: '#333' },
    entryHeader: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, marginTop: 12 },
    entryMeta: { fontSize: 9, color: '#666', marginTop: 1.5, marginBottom: 4 },
    body: { fontSize: 10, marginTop: 2 },
    bullet: { fontSize: 10, marginTop: 3.5, marginLeft: 12, textIndent: -12 },
  },
}

const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

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
  // Line 1: the essentials. Line 2: social/profile links, kept off the primary line so it
  // doesn't wrap into an unreadable blob.
  const primaryContact = [c.email, c.phone, c.location, c.website].filter(Boolean).join('  |  ')
  const socialContact = c.links.map((l) => `${titleCase(l.label)}: ${l.value}`).join('   ')

  return (
    <Document title={`${model.name} — ${model.docWord}`} author={model.name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{model.name}</Text>
          {model.headline ? <Text style={styles.headline}>{model.headline}</Text> : null}
          {primaryContact ? <Text style={styles.contactLine}>{primaryContact}</Text> : null}
          {socialContact ? <Text style={styles.contactLine2}>{socialContact}</Text> : null}
        </View>

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
