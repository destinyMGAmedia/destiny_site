import { render, screen } from '@testing-library/react'
import { useParams, notFound } from 'next/navigation'
import CategoryPage from './page'

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  notFound: vi.fn(),
}))
vi.mock('@/components/yellowpages/ListingsBrowser', () => ({
  default: ({ lockedCategory }) => <div data-testid="browser" data-locked-category={lockedCategory} />,
}))

describe('CategoryPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the category label as the heading and locks ListingsBrowser to it', () => {
    useParams.mockReturnValue({ category: 'TECHNOLOGY_IT' })
    render(<CategoryPage />)
    expect(screen.getByText('Technology & IT')).toBeInTheDocument()
    expect(screen.getByTestId('browser')).toHaveAttribute('data-locked-category', 'TECHNOLOGY_IT')
    expect(notFound).not.toHaveBeenCalled()
  })

  it('calls notFound() for an unknown category', () => {
    useParams.mockReturnValue({ category: 'NOT_REAL' })
    render(<CategoryPage />)
    expect(notFound).toHaveBeenCalled()
  })
})
