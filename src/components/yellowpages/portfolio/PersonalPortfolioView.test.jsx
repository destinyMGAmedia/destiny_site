import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import PersonalPortfolioView from './PersonalPortfolioView'

// Everything this component leans on — RatingStars, PortfolioBanner, ContactCard,
// PortfolioSection, ReviewsModal, UpdatePromptModal, the image-lightbox hook, and the
// portfolio-section model in @/lib/yellowpages/portfolio — is real, same-process code, so
// the tests below exercise the whole tree end to end. useYellowPagesBase falls back to its
// context default of "/yellowpages" with no Provider, which is what these assertions expect.

const richListing = {
  listingType: 'INDIVIDUAL',
  name: 'Jane Developer',
  headline: 'Full-stack Engineer',
  category: 'TECHNOLOGY_IT',
  openToWork: true,
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  ratingCount: 3,
  avgRating: 4.5,
  resumeSummary: 'A decade of shipping web apps.',
  description: 'Fallback bio',
  skills: ['React', 'Node.js'],
  languages: ['English', 'Yoruba'],
  certifications: 'AWS Solutions Architect',
  availability: 'Full-time',
  yearsInOperation: 8,
  website: 'https://jane.dev',
  socialLinks: { linkedin: 'in/jane' },
  experience: [
    { title: 'Engineer', organization: 'Acme', location: 'Remote', startDate: 'Jan 2020', endDate: '', current: true, description: 'Led the platform team' },
  ],
  education: [
    { school: 'Unilag', degree: 'BSc', field: 'Computer Science', startYear: '2012', endYear: '2016', description: 'First class' },
  ],
  projects: [
    { name: 'OpenThing', role: 'Maintainer', url: 'https://openthing.dev', description: 'A popular OSS library' },
  ],
  portfolioImages: ['https://img.test/a.jpg', 'https://img.test/b.jpg'],
}

const sparseListing = {
  listingType: 'INDIVIDUAL',
  name: 'New Person',
  category: 'OTHER',
  ratingCount: 0,
  avgRating: 0,
}

afterEach(() => {
  window.localStorage.clear()
})

describe('PersonalPortfolioView — header', () => {
  it('renders name, headline, category label, location and the open-to-work pill', () => {
    render(<PersonalPortfolioView listing={richListing} listingId="l1" />)

    expect(screen.getByRole('heading', { level: 1, name: 'Jane Developer' })).toBeInTheDocument()
    expect(screen.getByText('Full-stack Engineer')).toBeInTheDocument()
    expect(screen.getByText('Technology & IT')).toBeInTheDocument()
    expect(screen.getByText('Open to work')).toBeInTheDocument()
    expect(screen.getByText('Lagos, Lagos, Nigeria')).toBeInTheDocument()
  })

  it('omits the open-to-work pill and location when absent', () => {
    render(<PersonalPortfolioView listing={sparseListing} listingId="l1" />)
    expect(screen.queryByText('Open to work')).not.toBeInTheDocument()
    // no city/state/country -> no MapPin location line
    expect(screen.queryByText(/,\s*Nigeria/)).not.toBeInTheDocument()
  })

  it('links Résumé/CV and Edit to the right base-relative URLs', () => {
    render(<PersonalPortfolioView listing={richListing} listingId="l1" />)
    expect(screen.getByRole('link', { name: /Résumé \/ CV/ })).toHaveAttribute(
      'href',
      '/yellowpages/listing/l1/resume',
    )
    expect(screen.getByRole('link', { name: /^Edit$/ })).toHaveAttribute(
      'href',
      '/yellowpages/manage?listingId=l1',
    )
  })

  it('shows the average rating summary when there are ratings, plain "Reviews" otherwise', () => {
    const { unmount } = render(<PersonalPortfolioView listing={richListing} listingId="l1" />)
    expect(screen.getByText('4.5 (3)')).toBeInTheDocument()
    unmount()

    render(<PersonalPortfolioView listing={sparseListing} listingId="l1" />)
    expect(screen.getByRole('button', { name: 'Reviews' })).toBeInTheDocument()
  })
})

describe('PersonalPortfolioView — sections', () => {
  it('renders filled sections with their content', () => {
    render(<PersonalPortfolioView listing={richListing} listingId="l1" />)

    expect(screen.getByText('A decade of shipping web apps.')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    // experience entry: title · organization, and a "current" role shows "Present"
    expect(screen.getByText('Engineer · Acme')).toBeInTheDocument()
    expect(screen.getByText('Jan 2020 – Present · Remote')).toBeInTheDocument()
    expect(screen.getByText('Led the platform team')).toBeInTheDocument()
    // education
    expect(screen.getByText('BSc, Computer Science')).toBeInTheDocument()
    // projects
    expect(screen.getByText('OpenThing — Maintainer')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://openthing.dev' })).toHaveAttribute(
      'href',
      'https://openthing.dev',
    )
    // credentials
    expect(screen.getByText('AWS Solutions Architect')).toBeInTheDocument()
    expect(screen.getByText('8 years of experience')).toBeInTheDocument()
    // languages
    expect(screen.getByText('Yoruba')).toBeInTheDocument()
  })

  it('falls back to description when resumeSummary is missing', () => {
    render(<PersonalPortfolioView listing={{ ...richListing, resumeSummary: '' }} listingId="l1" />)
    expect(screen.getByText('Fallback bio')).toBeInTheDocument()
  })

  it('hides empty sections from a visitor (not the owner)', () => {
    render(<PersonalPortfolioView listing={sparseListing} listingId="l1" />)
    expect(screen.queryByText('Skills')).not.toBeInTheDocument()
    expect(screen.queryByText('Experience')).not.toBeInTheDocument()
    expect(screen.queryByText(/Add your skills/)).not.toBeInTheDocument()
  })

  it('shows "add ..." prompts for empty sections when the viewer is the owner', () => {
    window.localStorage.setItem('yp:edited:l1', '1')
    // dismiss the one-time completion modal so it does not cover the section prompts
    window.localStorage.setItem('yp:promptDismissed:l1', '1')

    render(<PersonalPortfolioView listing={sparseListing} listingId="l1" />)
    expect(screen.getByRole('link', { name: /Add your skills/ })).toHaveAttribute(
      'href',
      '/yellowpages/manage?listingId=l1',
    )
    expect(screen.getByRole('link', { name: /Add your work experience/ })).toBeInTheDocument()
  })

  it('renders the work-sample gallery and opens a lightbox on click', async () => {
    const user = userEvent.setup()
    render(<PersonalPortfolioView listing={richListing} listingId="l1" />)

    const samples = screen.getAllByRole('button', { name: /Preview work sample/ })
    expect(samples).toHaveLength(2)

    await user.click(samples[0])
    const dialog = screen.getByRole('dialog', { name: 'Image preview' })
    expect(within(dialog).getByText('1 / 2')).toBeInTheDocument()
  })
})

describe('PersonalPortfolioView — reviews modal', () => {
  it('keeps reviews behind a button and opens them in a modal', async () => {
    const user = userEvent.setup()
    render(<PersonalPortfolioView listing={richListing} listingId="l1" />)

    expect(screen.queryByRole('dialog', { name: 'Reviews' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /4\.5 \(3\)/ }))

    const dialog = screen.getByRole('dialog', { name: 'Reviews' })
    expect(dialog).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Close reviews' }))
    expect(screen.queryByRole('dialog', { name: 'Reviews' })).not.toBeInTheDocument()
  })
})

describe('PersonalPortfolioView — owner completion prompt', () => {
  it('nudges the owner when 3+ sections are empty and the prompt was never dismissed', () => {
    window.localStorage.setItem('yp:edited:l1', '1')
    render(<PersonalPortfolioView listing={sparseListing} listingId="l1" />)
    expect(screen.getByRole('dialog', { name: 'Complete your portfolio' })).toBeInTheDocument()
    expect(screen.getByText('Make your portfolio shine')).toBeInTheDocument()
  })

  it('does not nudge a visitor, however incomplete the portfolio is', () => {
    render(<PersonalPortfolioView listing={sparseListing} listingId="l1" />)
    expect(screen.queryByRole('dialog', { name: 'Complete your portfolio' })).not.toBeInTheDocument()
  })

  it('does not nudge the owner again once dismissed, and records the dismissal', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('yp:edited:l1', '1')
    const { unmount } = render(<PersonalPortfolioView listing={sparseListing} listingId="l1" />)

    await user.click(screen.getByRole('button', { name: 'Later' }))
    expect(screen.queryByRole('dialog', { name: 'Complete your portfolio' })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('yp:promptDismissed:l1')).toBe('1')

    unmount()
    render(<PersonalPortfolioView listing={sparseListing} listingId="l1" />)
    expect(screen.queryByRole('dialog', { name: 'Complete your portfolio' })).not.toBeInTheDocument()
  })

  it('does not nudge the owner when the portfolio is essentially complete', () => {
    window.localStorage.setItem('yp:edited:l1', '1')
    render(<PersonalPortfolioView listing={richListing} listingId="l1" />)
    expect(screen.queryByRole('dialog', { name: 'Complete your portfolio' })).not.toBeInTheDocument()
  })
})
