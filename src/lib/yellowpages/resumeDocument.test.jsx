import { ResumeDocument, renderResumePdf } from './resumeDocument'

// renderResumePdf runs the REAL @react-pdf/renderer in-process (no network, no external
// service) and returns a PDF Buffer, so we exercise it end to end.

const fullListing = {
  name: 'Jane Developer',
  headline: 'Full-stack Engineer',
  resumeSummary: 'Ten years shipping web apps.',
  description: 'fallback bio',
  email: 'jane@example.com',
  phone: '08012345678',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  website: 'https://jane.dev',
  skills: ['React', 'Node.js', '  ', 42],
  languages: ['English', 'Yoruba'],
  experience: [
    { title: 'Engineer', organization: 'Acme', location: 'Remote', startDate: '2020', endDate: '2024', current: false, description: 'Built things' },
    { title: 'Intern', organization: 'Beta', startDate: '2019', current: true },
  ],
  education: [{ school: 'Uni', degree: 'BSc', field: 'CS', startYear: '2012', endYear: '2016', description: 'First class' }],
  projects: [{ name: 'Thing', role: 'Lead', url: 'https://thing.dev', description: 'A thing' }],
  certifications: 'AWS Solutions Architect',
}

const pdfMagic = (buf) => String.fromCharCode(...new Uint8Array(buf.buffer ? buf : Uint8Array.from(buf)).slice(0, 5))

describe('renderResumePdf', () => {
  it('produces a non-trivial PDF buffer for a fully populated listing', async () => {
    const buf = await renderResumePdf(fullListing)
    expect(Buffer.isBuffer(buf)).toBe(true)
    expect(buf.length).toBeGreaterThan(1000)
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  })

  it('still renders a valid PDF from an empty listing (falls back to "Résumé")', async () => {
    const buf = await renderResumePdf({})
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
    expect(buf.length).toBeGreaterThan(400)
  })

  it('renders when optional sections are missing but summary comes from description', async () => {
    const buf = await renderResumePdf({ name: 'No Sections', description: 'Just a bio, nothing else.' })
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  })

  it('does not throw on non-array skills / experience', async () => {
    const buf = await renderResumePdf({ name: 'Odd', skills: 'not-an-array', experience: null, education: undefined })
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  })
})

describe('ResumeDocument', () => {
  it('is a React element that renderResumePdf can consume', async () => {
    const el = ResumeDocument({ listing: fullListing })
    expect(el).toBeTruthy()
    expect(el.type).toBeDefined()
  })
})
