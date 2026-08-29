import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import BusinessPortfolioView from './BusinessPortfolioView'

// Like PersonalPortfolioView, every collaborator here — RatingStars, PortfolioBanner,
// ContactCard, PortfolioSection/EmptySection, ReviewsModal, UpdatePromptModal, the
// image-lightbox hook and the section model in @/lib/yellowpages/portfolio — is real,
// same-process code, so these tests drive the whole tree end to end. With no
// YellowPagesChrome provider, useYellowPagesBase falls back to its context default of
// "/yellowpages", which is what the URL assertions below expect.

const richListing = {
  listingType: 'BUSINESS',
  name: 'BuildCo Ltd',
  contactPersonName: 'John Doe',
  position: 'CEO',
  category: 'CONSTRUCTION_REAL_ESTATE',
  categories: ['TECHNOLOGY_IT'],
  city: 'Abuja',
  state: 'FCT',
  country: 'Nigeria',
  ratingCount: 3,
  avgRating: 4.5,
  description: 'We build things that last.',
  servicesOffered: 'Design, construction, project management.',
  certifications: 'ISO 9001',
  licenseNumber: 'RC-123456',
  yearsInOperation: 8,
  website: 'https://buildco.test',
  socialLinks: { linkedin: 'company/buildco' },
  projects: [
    { name: 'Bridge Build', role: 'General Contractor', url: 'https://bridge.test', description: 'A big bridge' },
  ],
  team: [
    { name: 'Ada Eze', role: 'Lead Engineer', photoUrl: 'https://img.test/ada.jpg' },
    { name: 'Bob Kent', role: 'Designer' },
    { name: 'Chi Obi', role: 'Advisor', linkedListingId: 'l2' },
  ],
  portfolioImages: ['https://img.test/g1.jpg', 'https://img.test/g2.jpg'],
}

const sparseListing = {
  listingType: 'BUSINESS',
  name: 'Fresh Business',
  category: 'OTHER',
  ratingCount: 0,
  avgRating: 0,
}

afterEach(() => {
  window.localStorage.clear()
})

describe('BusinessPortfolioView — header', () => {
  it('renders name, contact person + position, category labels, years and location', () => {
    render(<BusinessPortfolioView listing={richListing} listingId="l1" />)

    expect(screen.getByRole('heading', { level: 1, name: 'BuildCo Ltd' })).toBeInTheDocument()
    expect(
      screen.getByText(
        (_, el) => el?.tagName === 'P' && el.textContent === 'John Doe, CEO',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Construction & Real Estate')).toBeInTheDocument()
    expect(screen.getByText('Technology & IT')).toBeInTheDocument()
    expect(screen.getByText('8 yrs in operation')).toBeInTheDocument()
    expect(screen.getByText('Abuja, FCT, Nigeria')).toBeInTheDocument()
  })

  it('hides the contact-person line when it matches the business name, and omits location when absent', () => {
    render(
      <BusinessPortfolioView
        listing={{ ...sparseListing, contactPersonName: 'Fresh Business' }}
        listingId="l1"
      />,
    )
    expect(screen.queryByText('Fresh Business, ')).not.toBeInTheDocument()
    expect(screen.queryByText(/,\s*Nigeria/)).not.toBeInTheDocument()
    expect(screen.queryByText(/yrs in operation/)).not.toBeInTheDocument()
  })

  it('links the header Edit button to the base-relative manage URL', () => {
    render(<BusinessPortfolioView listing={richListing} listingId="l1" />)
    expect(screen.getByRole('link', { name: /^Edit$/ })).toHaveAttribute(
      'href',
      '/yellowpages/manage?listingId=l1',
    )
  })

  it('shows the rating summary when there are reviews, plain "Reviews" otherwise', () => {
    const { unmount } = render(<BusinessPortfolioView listing={richListing} listingId="l1" />)
    expect(screen.getByRole('button', { name: /4\.5 \(3\)/ })).toBeInTheDocument()
    unmount()

    render(<BusinessPortfolioView listing={sparseListing} listingId="l1" />)
    expect(screen.getByRole('button', { name: 'Reviews' })).toBeInTheDocument()
  })
})

describe('BusinessPortfolioView — sections', () => {
  it('renders every filled business section with its content', () => {
    render(<BusinessPortfolioView listing={richListing} listingId="l1" />)

    // About / Products & Services
    expect(screen.getByText('We build things that last.')).toBeInTheDocument()
    expect(screen.getByText('Design, construction, project management.')).toBeInTheDocument()

    // Projects
    expect(screen.getByText('Bridge Build — General Contractor')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://bridge.test' })).toHaveAttribute(
      'href',
      'https://bridge.test',
    )
    expect(screen.getByText('A big bridge')).toBeInTheDocument()

    // Team — a photo (preview button), initials fallback, and a linked profile
    expect(
      screen.getByRole('button', { name: 'Preview photo of Ada Eze' }),
    ).toBeInTheDocument()
    expect(screen.getByText('BK')).toBeInTheDocument()
    expect(screen.getByText('Bob Kent')).toBeInTheDocument()
    const linkedMember = screen.getByRole('link', { name: /Chi Obi/ })
    expect(linkedMember).toHaveAttribute('href', '/yellowpages/listing/l2')
    expect(within(linkedMember).getByText('View profile')).toBeInTheDocument()

    // Credentials
    expect(screen.getByText('Certifications: ISO 9001')).toBeInTheDocument()
    expect(screen.getByText('Registration / License: RC-123456')).toBeInTheDocument()
    expect(screen.getByText('8 years in operation')).toBeInTheDocument()

    // Contact card (always present)
    expect(screen.getByRole('link', { name: /Website/ })).toHaveAttribute(
      'href',
      'https://buildco.test',
    )
  })

  it('hides empty optional sections from a visitor', () => {
    render(<BusinessPortfolioView listing={sparseListing} listingId="l1" />)
    expect(screen.queryByRole('heading', { name: 'Products & Services' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Team' })).not.toBeInTheDocument()
    expect(screen.queryByText('List your products and services')).not.toBeInTheDocument()
    // the contact section still renders
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument()
  })

  it('shows "add ..." prompts for empty sections when the viewer is the owner', () => {
    window.localStorage.setItem('yp:edited:l1', '1')
    // dismiss the one-time completion modal so it does not duplicate the section prompts
    window.localStorage.setItem('yp:promptDismissed:l1', '1')

    render(<BusinessPortfolioView listing={sparseListing} listingId="l1" />)

    const servicesCta = screen.getByRole('link', { name: /List your products and services/ })
    expect(servicesCta).toHaveAttribute('href', '/yellowpages/manage?listingId=l1')
    expect(screen.getByRole('link', { name: /Add your team members/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Upload work samples or photos/ })).toBeInTheDocument()
  })
})

describe('BusinessPortfolioView — gallery lightbox', () => {
  it('renders the gallery and opens a lightbox at the clicked image', async () => {
    const user = userEvent.setup()
    render(<BusinessPortfolioView listing={richListing} listingId="l1" />)

    const tiles = screen.getAllByRole('button', { name: /Preview gallery image/ })
    expect(tiles).toHaveLength(2)

    await user.click(tiles[0])
    const dialog = screen.getByRole('dialog', { name: 'Image preview' })
    expect(within(dialog).getByText('1 / 2')).toBeInTheDocument()
  })

  it('opens the lightbox from a team member photo', async () => {
    const user = userEvent.setup()
    render(<BusinessPortfolioView listing={richListing} listingId="l1" />)

    await user.click(screen.getByRole('button', { name: 'Preview photo of Ada Eze' }))
    expect(screen.getByRole('dialog', { name: 'Image preview' })).toBeInTheDocument()
  })
})

describe('BusinessPortfolioView — reviews modal', () => {
  it('keeps reviews behind a button and toggles the modal open/closed', async () => {
    const user = userEvent.setup()
    render(<BusinessPortfolioView listing={richListing} listingId="l1" />)

    expect(screen.queryByRole('dialog', { name: 'Reviews' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /4\.5 \(3\)/ }))

    const dialog = screen.getByRole('dialog', { name: 'Reviews' })
    expect(dialog).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Close reviews' }))
    expect(screen.queryByRole('dialog', { name: 'Reviews' })).not.toBeInTheDocument()
  })
})

describe('BusinessPortfolioView — owner completion prompt', () => {
  it('nudges the owner when 3+ sections are empty and it was never dismissed', () => {
    window.localStorage.setItem('yp:edited:l1', '1')
    render(<BusinessPortfolioView listing={sparseListing} listingId="l1" />)

    expect(
      screen.getByRole('dialog', { name: 'Complete your portfolio' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Make your portfolio shine')).toBeInTheDocument()
  })

  it('does not nudge a visitor, however incomplete the portfolio is', () => {
    render(<BusinessPortfolioView listing={sparseListing} listingId="l1" />)
    expect(
      screen.queryByRole('dialog', { name: 'Complete your portfolio' }),
    ).not.toBeInTheDocument()
  })

  it('does not nudge again once dismissed, and records the dismissal', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('yp:edited:l1', '1')
    const { unmount } = render(<BusinessPortfolioView listing={sparseListing} listingId="l1" />)

    await user.click(screen.getByRole('button', { name: 'Later' }))
    expect(
      screen.queryByRole('dialog', { name: 'Complete your portfolio' }),
    ).not.toBeInTheDocument()
    expect(window.localStorage.getItem('yp:promptDismissed:l1')).toBe('1')

    unmount()
    render(<BusinessPortfolioView listing={sparseListing} listingId="l1" />)
    expect(
      screen.queryByRole('dialog', { name: 'Complete your portfolio' }),
    ).not.toBeInTheDocument()
  })

  it('does not nudge the owner when the portfolio is essentially complete', () => {
    window.localStorage.setItem('yp:edited:l1', '1')
    render(<BusinessPortfolioView listing={richListing} listingId="l1" />)
    expect(
      screen.queryByRole('dialog', { name: 'Complete your portfolio' }),
    ).not.toBeInTheDocument()
  })
})
