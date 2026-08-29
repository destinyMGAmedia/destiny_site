import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ResumePreview from './ResumePreview'
import { buildResumeModel } from '@/lib/yellowpages/resumeModel'

// ResumePreview is a pure presentational view of a résumé model. The model factory
// (buildResumeModel) is real same-process code, so the integration cases below feed it a
// real listing and render the whole thing; the unit cases hand-build minimal models to pin
// down each conditional branch.

const fullListing = {
  name: 'Jane Developer',
  headline: 'Full-stack Engineer',
  resumeSummary: 'A decade of shipping web apps.',
  email: 'jane@example.com',
  phone: '08012345678',
  website: 'https://jane.dev',
  city: 'Lagos',
  country: 'Nigeria',
  socialLinks: { linkedin: 'in/jane' },
  skills: ['React', 'Node.js'],
  languages: ['English'],
  certifications: 'AWS Solutions Architect',
  experience: [
    { title: 'Engineer', organization: 'Acme', location: 'Remote', startDate: '2020', endDate: '', current: true, description: 'Built A\nShipped B' },
  ],
  education: [{ school: 'Unilag', degree: 'BSc', field: 'CS', startYear: '2012', endYear: '2016', description: 'First class' }],
  projects: [{ name: 'OpenThing', role: 'Lead', url: 'https://openthing.dev', description: 'An OSS library' }],
}

const emptyModel = {
  template: 'CLASSIC',
  experienceHeading: 'Work Experience',
  name: 'Nameless',
  headline: '',
  summary: '',
  certifications: '',
  contact: { email: '', phone: '', location: '', website: '', links: [] },
  skills: [],
  languages: [],
  experience: [],
  education: [],
  projects: [],
}

describe('ResumePreview — integration with buildResumeModel', () => {
  it('renders the header, contact line and every populated section', () => {
    const model = buildResumeModel(fullListing, { template: 'MODERN', locale: 'UK' })
    render(<ResumePreview model={model} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Jane Developer' })).toBeInTheDocument()
    expect(screen.getByText('Full-stack Engineer')).toBeInTheDocument()

    // primary contact line — essentials only, socials moved to their own line
    const contact = screen.getByText(/jane@example\.com/)
    expect(contact.textContent).toBe('jane@example.com  |  08012345678  |  Lagos, Nigeria  |  https://jane.dev')
    expect(contact.className).not.toContain('yp-resume-contact-2')
    // second line — social / profile links, title-cased
    const social = screen.getByText(/^Linkedin: in\/jane$/)
    expect(social.className).toContain('yp-resume-contact-2')

    expect(screen.getByRole('heading', { name: 'Summary' })).toBeInTheDocument()
    expect(screen.getByText('A decade of shipping web apps.')).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument()
    expect(screen.getByText('React, Node.js')).toBeInTheDocument()

    // UK locale -> "Professional Experience" heading
    const expSection = screen.getByRole('heading', { name: 'Professional Experience' }).closest('section')
    expect(within(expSection).getByText('Engineer — Acme')).toBeInTheDocument()
    expect(expSection.querySelector('.yp-resume-meta').textContent).toBe('2020 – Present  |  Remote')
    const bullets = within(expSection).getAllByRole('listitem').map((li) => li.textContent)
    expect(bullets).toEqual(['Built A', 'Shipped B'])

    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument()
    expect(screen.getByText('BSc, CS — Unilag')).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByText('OpenThing — Lead')).toBeInTheDocument()
    expect(screen.getByText('https://openthing.dev')).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Certifications' })).toBeInTheDocument()
    expect(screen.getByText('AWS Solutions Architect')).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Languages' })).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('applies the template class from the model', () => {
    const { container, rerender } = render(
      <ResumePreview model={buildResumeModel(fullListing, { template: 'MODERN' })} />,
    )
    expect(container.querySelector('.yp-resume-sheet')).toHaveClass('yp-resume-modern')

    rerender(<ResumePreview model={buildResumeModel(fullListing, { template: 'COMPACT' })} />)
    expect(container.querySelector('.yp-resume-sheet')).toHaveClass('yp-resume-compact')

    rerender(<ResumePreview model={buildResumeModel(fullListing, { template: 'CLASSIC' })} />)
    expect(container.querySelector('.yp-resume-sheet')).toHaveClass('yp-resume-classic')
  })
})

describe('ResumePreview — conditional rendering', () => {
  it('renders only the name for an otherwise-empty model', () => {
    render(<ResumePreview model={emptyModel} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Nameless' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Summary' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Skills' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Work Experience' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Education' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Projects' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Certifications' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Languages' })).not.toBeInTheDocument()
  })

  it('omits the headline and contact line when there is nothing to show', () => {
    const { container } = render(<ResumePreview model={emptyModel} />)
    expect(container.querySelector('.yp-resume-headline')).toBeNull()
    expect(container.querySelector('.yp-resume-contact')).toBeNull()
  })

  it('falls back to the classic class for an unknown template', () => {
    const { container } = render(<ResumePreview model={{ ...emptyModel, template: 'WILD' }} />)
    expect(container.querySelector('.yp-resume-sheet')).toHaveClass('yp-resume-classic')
  })

  it('uses the model experienceHeading for the experience section title', () => {
    const model = {
      ...emptyModel,
      experienceHeading: 'Professional Experience',
      experience: [{ title: 'Dev', organization: 'X', location: '', dateRange: '', bullets: [] }],
    }
    render(<ResumePreview model={model} />)
    expect(screen.getByRole('heading', { name: 'Professional Experience' })).toBeInTheDocument()
    expect(screen.getByText('Dev — X')).toBeInTheDocument()
  })

  it('drops the meta line and bullet list when a role has neither', () => {
    const model = {
      ...emptyModel,
      experience: [{ title: 'Dev', organization: '', location: '', dateRange: '', bullets: [] }],
    }
    const { container } = render(<ResumePreview model={model} />)
    expect(screen.getByText('Dev')).toBeInTheDocument()
    expect(container.querySelector('.yp-resume-meta')).toBeNull()
    expect(container.querySelector('.yp-resume-bullets')).toBeNull()
  })

  it('renders education/project entries without optional meta and description', () => {
    const model = {
      ...emptyModel,
      education: [{ heading: 'BSc', org: '', meta: '', description: '' }],
      projects: [{ heading: 'Side project', url: '', description: '' }],
    }
    render(<ResumePreview model={model} />)
    const eduSection = screen.getByRole('heading', { name: 'Education' }).closest('section')
    expect(within(eduSection).getByText('BSc')).toBeInTheDocument()
    expect(within(eduSection).queryByText('—')).not.toBeInTheDocument()

    const projSection = screen.getByRole('heading', { name: 'Projects' }).closest('section')
    expect(within(projSection).getByText('Side project')).toBeInTheDocument()
    expect(within(projSection).queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows a contact line built only from the fields that are present', () => {
    const model = {
      ...emptyModel,
      contact: { email: 'a@b.com', phone: '', location: 'Abuja', website: '', links: [] },
    }
    const { container } = render(<ResumePreview model={model} />)
    expect(container.querySelector('.yp-resume-contact').textContent).toBe('a@b.com  |  Abuja')
  })
})

describe('ResumePreview — two-line contact split & social-link title-casing', () => {
  const withContact = (contact) => ({ ...emptyModel, contact })

  it('keeps essentials on line 1 and puts title-cased links on a distinct second line', () => {
    const { container } = render(
      <ResumePreview
        model={withContact({
          email: 'jane@example.com',
          phone: '0801',
          location: 'Lagos',
          website: 'https://jane.dev',
          links: [
            { label: 'linkedin', value: 'in/jane' },
            { label: 'github', value: 'gh/jane' },
          ],
        })}
      />,
    )
    const lines = container.querySelectorAll('.yp-resume-contact')
    expect(lines).toHaveLength(2)

    // line 1 — the essentials, no link text, no -2 modifier class
    expect(lines[0].textContent).toBe('jane@example.com  |  0801  |  Lagos  |  https://jane.dev')
    expect(lines[0].className).not.toContain('yp-resume-contact-2')
    expect(lines[0].textContent).not.toMatch(/in\/jane/)

    // line 2 — every social link, title-cased, joined by three spaces
    expect(lines[1]).toHaveClass('yp-resume-contact-2')
    expect(lines[1].textContent).toBe('Linkedin: in/jane   Github: gh/jane')
  })

  it('renders the social line on its own when no primary contact fields are set', () => {
    const { container } = render(
      <ResumePreview
        model={withContact({
          email: '',
          phone: '',
          location: '',
          website: '',
          links: [{ label: 'portfolio', value: 'x.dev' }],
        })}
      />,
    )
    const lines = container.querySelectorAll('.yp-resume-contact')
    expect(lines).toHaveLength(1)
    expect(lines[0]).toHaveClass('yp-resume-contact-2')
    expect(lines[0].textContent).toBe('Portfolio: x.dev')
  })

  it('renders no second contact line when the model carries no links', () => {
    const { container } = render(
      <ResumePreview
        model={withContact({ email: 'a@b.com', phone: '', location: '', website: '', links: [] })}
      />,
    )
    expect(container.querySelectorAll('.yp-resume-contact')).toHaveLength(1)
    expect(container.querySelector('.yp-resume-contact-2')).toBeNull()
  })

  it('title-cases each label independently and tolerates an empty label', () => {
    const { container } = render(
      <ResumePreview
        model={withContact({
          email: '',
          phone: '',
          location: '',
          website: '',
          links: [
            { label: 'x', value: 'a' },
            { label: '', value: 'b' },
          ],
        })}
      />,
    )
    expect(container.querySelector('.yp-resume-contact-2').textContent).toBe('X: a   : b')
  })

  it('leaves an already-capitalised label untouched', () => {
    const { container } = render(
      <ResumePreview
        model={withContact({
          email: '',
          phone: '',
          location: '',
          website: '',
          links: [{ label: 'GitHub', value: 'gh/x' }],
        })}
      />,
    )
    expect(container.querySelector('.yp-resume-contact-2').textContent).toBe('GitHub: gh/x')
  })

  it('renders neither contact line when contact is entirely empty', () => {
    const { container } = render(
      <ResumePreview
        model={withContact({ email: '', phone: '', location: '', website: '', links: [] })}
      />,
    )
    expect(container.querySelector('.yp-resume-contact')).toBeNull()
  })
})

describe('ResumePreview — integration: multiple social links via buildResumeModel', () => {
  it('renders every non-empty socialLinks entry on the second line, title-cased', () => {
    const model = buildResumeModel(
      { name: 'Multi', email: 'm@x.com', socialLinks: { linkedin: 'in/m', github: 'gh/m', twitter: '' } },
      {},
    )
    const { container } = render(<ResumePreview model={model} />)

    const second = container.querySelector('.yp-resume-contact-2')
    expect(second.textContent).toBe('Linkedin: in/m   Github: gh/m')
    // buildResumeModel drops the blank twitter value before it reaches the view
    expect(second.textContent).not.toMatch(/Twitter/i)

    const lines = container.querySelectorAll('.yp-resume-contact')
    expect(lines[0].textContent).toBe('m@x.com')
    expect(lines[0].className).not.toContain('yp-resume-contact-2')
  })
})

describe('ResumePreview — contact line order, separators & raw link passthrough', () => {
  const withContact = (contact) => ({ ...emptyModel, contact })

  it('emits the primary line before the social line, each with the right class', () => {
    const { container } = render(
      <ResumePreview
        model={withContact({
          email: 'a@b.com',
          phone: '',
          location: '',
          website: '',
          links: [{ label: 'linkedin', value: 'in/a' }],
        })}
      />,
    )
    const ps = [...container.querySelectorAll('.yp-resume-contact')]
    expect(ps.map((p) => p.textContent)).toEqual(['a@b.com', 'Linkedin: in/a'])
    expect(ps[0].className).toBe('yp-resume-contact')
    expect(ps[1].className).toBe('yp-resume-contact yp-resume-contact-2')
  })

  it('joins primary fields with " | " and three social links with exactly three spaces', () => {
    const { container } = render(
      <ResumePreview
        model={withContact({
          email: 'a@b.com',
          phone: '0801',
          location: 'Lagos',
          website: '',
          links: [
            { label: 'linkedin', value: 'in/a' },
            { label: 'github', value: 'gh/a' },
            { label: 'portfolio', value: 'p.dev' },
          ],
        })}
      />,
    )
    const [primary, social] = container.querySelectorAll('.yp-resume-contact')
    expect(primary.textContent).toBe('a@b.com  |  0801  |  Lagos')
    expect(social.textContent).toBe('Linkedin: in/a   Github: gh/a   Portfolio: p.dev')
  })

  it('renders social links verbatim from the model — the view does not filter empty values', () => {
    const { container } = render(
      <ResumePreview
        model={withContact({
          email: '',
          phone: '',
          location: '',
          website: '',
          links: [{ label: 'linkedin', value: '' }],
        })}
      />,
    )
    // buildResumeModel is what drops blank values; the presentational view trusts its input
    expect(container.querySelector('.yp-resume-contact-2').textContent).toBe('Linkedin: ')
  })

  it('capitalises only the first character of a multi-word label', () => {
    const { container } = render(
      <ResumePreview
        model={withContact({
          email: '',
          phone: '',
          location: '',
          website: '',
          links: [{ label: 'personal site', value: 'me.dev' }],
        })}
      />,
    )
    expect(container.querySelector('.yp-resume-contact-2').textContent).toBe('Personal site: me.dev')
  })

  it('keeps the website on the primary line and never on the social line (via buildResumeModel)', () => {
    const model = buildResumeModel(
      { name: 'W', email: 'w@x.com', website: 'https://w.dev', socialLinks: { github: 'gh/w' } },
      {},
    )
    const { container } = render(<ResumePreview model={model} />)
    const [primary, social] = container.querySelectorAll('.yp-resume-contact')
    expect(primary.textContent).toBe('w@x.com  |  https://w.dev')
    expect(social.textContent).toBe('Github: gh/w')
  })
})
