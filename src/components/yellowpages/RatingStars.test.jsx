import { render, screen, fireEvent } from '@testing-library/react'
import RatingStars from './RatingStars'

describe('RatingStars', () => {
  it('renders as a read-only image role by default', () => {
    render(<RatingStars value={3} />)
    expect(screen.getByRole('img', { name: '3 out of 5 stars' })).toBeInTheDocument()
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })

  it('renders 5 interactive radio buttons when interactive', () => {
    render(<RatingStars value={0} interactive onChange={() => {}} />)
    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })

  it('calls onChange with the clicked star value', () => {
    const onChange = vi.fn()
    render(<RatingStars value={0} interactive onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('marks the matching star as checked', () => {
    render(<RatingStars value={2} interactive onChange={() => {}} />)
    expect(screen.getByRole('radio', { name: '2 stars' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: '1 star' })).toHaveAttribute('aria-checked', 'false')
  })
})
