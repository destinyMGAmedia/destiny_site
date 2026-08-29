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

    const contact = screen.getByText(/jane@example\.com/)
    expect(contact.textContent).toBe(
      'jane@example.com  |  08012345678  |  Lagos, Nigeria  |  https://jane.dev  |  linkedin: in/jane',
    )

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
