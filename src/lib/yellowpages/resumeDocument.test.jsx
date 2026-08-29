import { Text, View } from '@react-pdf/renderer'
import { ResumeDocument, renderResumePdf } from './resumeDocument'
import { buildResumeModel } from './resumeModel'

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

  it('renders every template', async () => {
    for (const template of ['CLASSIC', 'COMPACT', 'MODERN']) {
      const buf = await renderResumePdf(fullListing, { template })
      expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
    }
  })

  it('renders the UK ("CV") locale', async () => {
    const buf = await renderResumePdf(fullListing, { locale: 'UK' })
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  })
})

describe('ResumeDocument', () => {
  it('is a React element that renderResumePdf can consume', () => {
    const el = ResumeDocument({ model: buildResumeModel(fullListing, {}) })
    expect(el).toBeTruthy()
    expect(el.type).toBeDefined()
  })
})

// --- The contact block is built inline inside ResumeDocument, so exercise it by calling the
// real component and walking the element tree it returns (no rendering, no mocks). ---

/** Flatten every string / number leaf reachable through `props.children`. */
function collectText(node, acc = []) {
  if (node == null || node === false || node === true) return acc
  if (typeof node === 'string' || typeof node === 'number') {
    acc.push(String(node))
    return acc
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, acc)
    return acc
  }
  if (node.props && 'children' in node.props) collectText(node.props.children, acc)
  return acc
}

const docModel = (over = {}) => ({
  template: 'CLASSIC',
  docWord: 'Résumé',
  experienceHeading: 'Work Experience',
  name: 'Jane Developer',
  headline: 'Engineer',
  summary: '',
  certifications: '',
  contact: { email: '', phone: '', location: '', website: '', links: [] },
  skills: [],
  languages: [],
  experience: [],
  education: [],
  projects: [],
  ...over,
})

describe('ResumeDocument — contact split & social-link title-casing', () => {
  it('keeps essentials on line 1 and puts title-cased links on line 2', () => {
    const model = docModel({
      contact: {
        email: 'jane@example.com',
        phone: '0801',
        location: 'Lagos',
        website: 'https://jane.dev',
        links: [
          { label: 'linkedin', value: 'in/jane' },
          { label: 'github', value: 'gh/jane' },
        ],
      },
    })
    const texts = collectText(ResumeDocument({ model }))

    expect(texts).toContain('jane@example.com  |  0801  |  Lagos  |  https://jane.dev')
    expect(texts).toContain('Linkedin: in/jane   Github: gh/jane')
    // proves the labels were title-cased, not passed through verbatim
    expect(texts).not.toContain('linkedin: in/jane   github: gh/jane')

    const primary = texts.find((t) => t.includes('jane@example.com'))
    expect(primary).not.toMatch(/in\/jane|gh\/jane/)
  })

  it('renders the social line even when no primary contact fields are set', () => {
    const model = docModel({
      contact: { email: '', phone: '', location: '', website: '', links: [{ label: 'portfolio', value: 'x.dev' }] },
    })
    const texts = collectText(ResumeDocument({ model }))

    expect(texts).toContain('Portfolio: x.dev')
    // no primary contact line was emitted (nothing joined with the "  |  " separator)
    expect(texts.some((t) => t.includes('  |  '))).toBe(false)
  })

  it('emits no social line when the model has no links', () => {
    const model = docModel({
      contact: { email: 'a@b.com', phone: '', location: '', website: '', links: [] },
    })
    const texts = collectText(ResumeDocument({ model }))

    expect(texts).toContain('a@b.com')
    expect(texts.filter((t) => t.includes(': ')).length).toBe(0)
  })

  it('title-cases each label independently and tolerates an empty label', () => {
    const model = docModel({
      contact: {
        email: '',
        phone: '',
        location: '',
        website: '',
        links: [
          { label: 'x', value: 'a' },
          { label: '', value: 'b' },
        ],
      },
    })
    const texts = collectText(ResumeDocument({ model }))
    expect(texts).toContain('X: a   : b')
  })

  it('falls back to the CLASSIC style map for an unknown template without throwing', () => {
    const el = ResumeDocument({ model: docModel({ template: 'WILD', name: 'Odd' }) })
    expect(el).toBeTruthy()
    expect(collectText(el)).toContain('Odd')
  })
})

describe('renderResumePdf — listings carrying social links', () => {
  it('renders a valid, non-trivial PDF when socialLinks are present', async () => {
    const buf = await renderResumePdf({
      ...fullListing,
      socialLinks: { linkedin: 'in/jane', github: 'gh/jane', twitter: '' },
    })
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
    expect(buf.length).toBeGreaterThan(1000)
  })

  it('renders every template with a social-links block present', async () => {
    for (const template of ['CLASSIC', 'COMPACT', 'MODERN']) {
      const buf = await renderResumePdf(
        { ...fullListing, socialLinks: { linkedin: 'in/jane' } },
        { template },
      )
      expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
    }
  })

  it('renders a valid PDF when only social links (no primary contact) are supplied', async () => {
    const buf = await renderResumePdf({
      name: 'Links Only',
      description: 'A short bio.',
      socialLinks: { portfolio: 'links.dev' },
    })
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  })
})

// --- Header restructure (this diff): name / headline / both contact lines are now wrapped
// in a single <View style={styles.header}>, and the social links moved to their own <Text>
// styled with `contactLine2`. These walk the REAL element tree the component returns (no
// rendering, no mocks) to pin that wiring down. ---

function walkNodes(node, visit) {
  if (node == null || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const child of node) walkNodes(child, visit)
    return
  }
  visit(node)
  if (node.props && node.props.children != null) walkNodes(node.props.children, visit)
}

function findAllNodes(root, pred) {
  const found = []
  walkNodes(root, (n) => {
    if (pred(n)) found.push(n)
  })
  return found
}

const headerContact = {
  email: 'jane@example.com',
  phone: '0801',
  location: 'Lagos',
  website: 'https://jane.dev',
  links: [
    { label: 'linkedin', value: 'in/jane' },
    { label: 'github', value: 'gh/jane' },
  ],
}

// The header is the one <View> that directly contains the name <Text>.
const headerViewOf = (el) =>
  findAllNodes(
    el,
    (n) =>
      n.type === View &&
      findAllNodes(n, (m) => m.type === Text && m.props.children === 'Jane Developer').length > 0,
  )[0]

const headerTexts = (header) =>
  findAllNodes(header, (n) => n.type === Text).map((n) => String(n.props.children))

describe('ResumeDocument — header View wrapper & two contact-line styles', () => {
  it('wraps name, headline and both contact lines in one styled header View, in order', () => {
    const header = headerViewOf(ResumeDocument({ model: docModel({ contact: headerContact }) }))

    expect(header).toBeTruthy()
    expect(header.props.style).toMatchObject({ borderBottomWidth: 2, borderBottomColor: '#333' })
    expect(headerTexts(header)).toEqual([
      'Jane Developer',
      'Engineer',
      'jane@example.com  |  0801  |  Lagos  |  https://jane.dev',
      'Linkedin: in/jane   Github: gh/jane',
    ])
  })

  it('styles the primary line with contactLine and the social line with the distinct contactLine2', () => {
    const header = headerViewOf(ResumeDocument({ model: docModel({ contact: headerContact }) }))
    const texts = findAllNodes(header, (n) => n.type === Text)
    const primary = texts.find((n) => String(n.props.children).includes('jane@example.com'))
    const social = texts.find((n) => String(n.props.children).includes('Linkedin'))

    expect(primary.props.style).toMatchObject({ color: '#444' })
    expect(social.props.style).toMatchObject({ color: '#666', marginTop: 3 })
    expect(social.props.style).not.toBe(primary.props.style)
  })

  it('drops the border and uses the lighter contactLine2 colour for the MODERN template', () => {
    const header = headerViewOf(
      ResumeDocument({ model: docModel({ template: 'MODERN', contact: headerContact }) }),
    )
    const social = findAllNodes(header, (n) => n.type === Text).find((n) =>
      String(n.props.children).includes('Linkedin'),
    )

    expect(header.props.style).toMatchObject({ marginBottom: 6 })
    expect(header.props.style.borderBottomWidth).toBeUndefined()
    expect(social.props.style).toMatchObject({ color: '#777' })
  })

  it('emits the header View with no social line when the model carries no links', () => {
    const header = headerViewOf(
      ResumeDocument({
        model: docModel({
          contact: { email: 'a@b.com', phone: '', location: '', website: '', links: [] },
        }),
      }),
    )
    expect(headerTexts(header)).toEqual(['Jane Developer', 'Engineer', 'a@b.com'])
  })

  it('emits only the social line inside the header when no primary contact fields are set', () => {
    const header = headerViewOf(
      ResumeDocument({
        model: docModel({
          contact: { email: '', phone: '', location: '', website: '', links: [{ label: 'portfolio', value: 'x.dev' }] },
        }),
      }),
    )
    expect(headerTexts(header)).toEqual(['Jane Developer', 'Engineer', 'Portfolio: x.dev'])
  })

  it('falls back to the CLASSIC header style for an unknown template', () => {
    const header = headerViewOf(
      ResumeDocument({ model: docModel({ template: 'WILD', contact: headerContact }) }),
    )
    expect(header.props.style).toMatchObject({ borderBottomWidth: 2, borderBottomColor: '#333' })
  })
})
