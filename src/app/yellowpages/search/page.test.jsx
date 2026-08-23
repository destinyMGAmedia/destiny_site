import { render, screen } from '@testing-library/react'
import SearchPage from './page'

vi.mock('@/components/yellowpages/ListingsBrowser', () => ({
  default: ({ lockedCategory }) => <div data-testid="browser" data-locked-category={lockedCategory || ''} />,
}))

describe('SearchPage', () => {
  it('renders the heading and ListingsBrowser with no locked category', () => {
    render(<SearchPage />)
    expect(screen.getByText('Browse the Directory')).toBeInTheDocument()
    expect(screen.getByTestId('browser')).toHaveAttribute('data-locked-category', '')
  })
})
