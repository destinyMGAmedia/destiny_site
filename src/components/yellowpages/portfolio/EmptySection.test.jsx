import { render, screen } from '@testing-library/react'
import EmptySection from './EmptySection'

describe('EmptySection', () => {
  it('shows a muted line to non-owners with no CTA', () => {
    render(<EmptySection addLabel="Add your skills" isOwner={false} editHref="/edit" />)
    expect(screen.getByText('Not added yet.')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows an "Add …" link to the edit flow for the owner', () => {
    render(<EmptySection addLabel="Add your skills" isOwner editHref="/yellowpages/manage?listingId=l1" />)
    const link = screen.getByRole('link', { name: /Add your skills/ })
    expect(link).toHaveAttribute('href', '/yellowpages/manage?listingId=l1')
  })
})
