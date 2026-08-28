import { render, screen, fireEvent } from '@testing-library/react'
import PortfolioBanner from './PortfolioBanner'

// PortfolioBanner is pure presentation over the `listing` shape plus an optional
// `onPreview` callback — no I/O, so everything here exercises the real component.

const individual = {
  listingType: 'INDIVIDUAL',
  name: 'Jane Doe',
  bannerImageUrl: 'https://cdn/banner.jpg',
  photoUrl: 'https://cdn/face.jpg',
  logoUrl: 'https://cdn/logo.jpg',
}

const business = {
  listingType: 'BUSINESS',
  name: 'Acme Corp',
  bannerImageUrl: 'https://cdn/bbanner.jpg',
  photoUrl: 'https://cdn/bface.jpg',
  logoUrl: 'https://cdn/blogo.jpg',
}

describe('PortfolioBanner — cover / avatar source selection', () => {
  it('uses the banner image for the cover and the photo for a round avatar (individual)', () => {
    const { container } = render(<PortfolioBanner listing={individual} />)
    expect(container.querySelector('.yp-banner-img')).toHaveAttribute('src', 'https://cdn/banner.jpg')
    const avatar = screen.getByAltText('Jane Doe')
    expect(avatar).toHaveAttribute('src', 'https://cdn/face.jpg')
    expect(avatar.className).toContain('rounded-full')
  })

  it('falls back to the photo for the cover when an individual has no banner', () => {
    const { container } = render(
      <PortfolioBanner listing={{ ...individual, bannerImageUrl: null }} />
    )
    expect(container.querySelector('.yp-banner-img')).toHaveAttribute('src', 'https://cdn/face.jpg')
  })

  it('uses the logo for a rounded-square avatar and never the photo (business)', () => {
    render(<PortfolioBanner listing={business} />)
    const avatar = screen.getByAltText('Acme Corp')
    expect(avatar).toHaveAttribute('src', 'https://cdn/blogo.jpg')
    expect(avatar.className).toContain('rounded-2xl')
  })

  it('renders no cover image for a business without a banner', () => {
    const { container } = render(
      <PortfolioBanner listing={{ ...business, bannerImageUrl: null }} />
    )
    expect(container.querySelector('.yp-banner-img')).toBeNull()
    expect(screen.queryByLabelText('Preview banner image')).not.toBeInTheDocument()
  })
})

describe('PortfolioBanner — fallback avatar', () => {
  it('shows first+last uppercase initials for an individual with no photo', () => {
    render(<PortfolioBanner listing={{ listingType: 'INDIVIDUAL', name: '  jane   mary   doe  ' }} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows a single initial for a one-word name', () => {
    render(<PortfolioBanner listing={{ listingType: 'INDIVIDUAL', name: 'Cher' }} />)
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('shows "?" for an individual with an empty name and no photo', () => {
    render(<PortfolioBanner listing={{ listingType: 'INDIVIDUAL', name: '' }} />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('shows a briefcase icon (not initials) for a business with no logo', () => {
    const { container } = render(
      <PortfolioBanner listing={{ listingType: 'BUSINESS', name: 'Acme Corp' }} />
    )
    expect(screen.queryByText('AC')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeTruthy()
  })
})

describe('PortfolioBanner — onPreview wiring', () => {
  it('wires the cover and avatar buttons to onPreview with their own urls (individual)', () => {
    const onPreview = vi.fn()
    render(<PortfolioBanner listing={individual} onPreview={onPreview} />)

    const coverBtn = screen.getByLabelText('Preview banner image')
    const avatarBtn = screen.getByLabelText('Preview profile image')
    expect(coverBtn).not.toBeDisabled()
    expect(coverBtn.className).toContain('yp-zoomable')
    expect(avatarBtn.className).toContain('yp-zoomable')

    fireEvent.click(coverBtn)
    expect(onPreview).toHaveBeenLastCalledWith('https://cdn/banner.jpg')
    fireEvent.click(avatarBtn)
    expect(onPreview).toHaveBeenLastCalledWith('https://cdn/face.jpg')
  })

  it('labels the avatar preview button "logo" for a business', () => {
    const onPreview = vi.fn()
    render(<PortfolioBanner listing={business} onPreview={onPreview} />)
    fireEvent.click(screen.getByLabelText('Preview logo image'))
    expect(onPreview).toHaveBeenLastCalledWith('https://cdn/blogo.jpg')
  })

  it('disables the preview buttons and drops the zoom affordance without onPreview', () => {
    render(<PortfolioBanner listing={individual} />)
    const coverBtn = screen.getByLabelText('Preview banner image')
    const avatarBtn = screen.getByLabelText('Preview profile image')
    expect(coverBtn).toBeDisabled()
    expect(avatarBtn).toBeDisabled()
    expect(coverBtn.className).not.toContain('yp-zoomable')
    expect(avatarBtn.className).not.toContain('yp-zoomable')
  })

  it('does not attach a click handler when onPreview is given but the url is missing', () => {
    // Individual with a banner but no photo → avatar is the initials fallback (no button).
    const onPreview = vi.fn()
    render(
      <PortfolioBanner listing={{ listingType: 'INDIVIDUAL', name: 'No Photo', bannerImageUrl: 'https://cdn/b.jpg' }} onPreview={onPreview} />
    )
    expect(screen.getByText('NP')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Preview banner image'))
    expect(onPreview).toHaveBeenCalledWith('https://cdn/b.jpg')
  })
})
