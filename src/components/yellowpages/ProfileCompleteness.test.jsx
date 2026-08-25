import { render, screen } from '@testing-library/react'
import ProfileCompleteness from './ProfileCompleteness'

describe('ProfileCompleteness', () => {
  it('shows the completeness percentage and progress bar for a partial listing', () => {
    // INDIVIDUAL (contactPerson prompt already moot) + logoUrl (photo prompt satisfied) = 2/8.
    render(<ProfileCompleteness listing={{ listingType: 'INDIVIDUAL', logoUrl: 'x' }} />)
    expect(screen.getByText('25%')).toBeInTheDocument()
  }, 10000)

  it('shows the top prompts with a jump link and a reason', () => {
    render(<ProfileCompleteness listing={{ listingType: 'INDIVIDUAL' }} maxPrompts={2} />)
    const link = screen.getByText('Add a photo or logo')
    expect(link.closest('a')).toHaveAttribute('href', '#yp-photo-section')
    expect(screen.getByText(/stand out in the feed/)).toBeInTheDocument()
  }, 10000)

  it('caps the number of prompts shown to maxPrompts', () => {
    render(<ProfileCompleteness listing={{ listingType: 'INDIVIDUAL' }} maxPrompts={2} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  }, 10000)

  it('shows a completion message instead of prompts once everything is filled in', () => {
    render(
      <ProfileCompleteness
        listing={{
          listingType: 'INDIVIDUAL',
          logoUrl: 'x',
          portfolioImages: ['x'],
          city: 'Lagos',
          assemblySlug: 'lagos',
          servicesOffered: 'x',
          website: 'https://x.com',
          certifications: 'x',
        }}
      />
    )
    expect(screen.getByText(/Your profile is complete/)).toBeInTheDocument()
    expect(screen.queryByText('%')).not.toBeInTheDocument()
  }, 10000)
})
