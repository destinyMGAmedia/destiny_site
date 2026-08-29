import { render, screen } from '@testing-library/react'
import BrowsePage from './page'

vi.mock('@/components/yellowpages/ListingsBrowser', () => ({
  default: ({ lockedCategory }) => <div data-testid="browser" data-locked-category={lockedCategory || ''} />,
}))

describe('BrowsePage', () => {
  it('renders ListingsBrowser with no locked category', () => {
    render(<BrowsePage />)
    expect(screen.getByTestId('browser')).toHaveAttribute('data-locked-category', '')
  })
})
