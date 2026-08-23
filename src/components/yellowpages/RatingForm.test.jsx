import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RatingForm from './RatingForm'

function fillValid() {
  fireEvent.click(screen.getByRole('radio', { name: '4 stars' }))
  fireEvent.change(screen.getByLabelText('Your Name *'), { target: { value: 'Jane Doe' } })
  fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '08012345678' } })
}

describe('RatingForm', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('shows validation errors without hitting the network', () => {
    render(<RatingForm listingId="l1" />)
    fireEvent.click(screen.getByText('Submit Review'))

    expect(screen.getByText('Please choose a star rating.')).toBeInTheDocument()
    expect(screen.getByText('Your name is required.')).toBeInTheDocument()
    expect(screen.getByText('Please provide your phone number or email.')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits and shows a thank-you message on success', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ rating: { id: 'r1' } }) })
    const onSubmitted = vi.fn()
    render(<RatingForm listingId="l1" onSubmitted={onSubmitted} />)

    fillValid()
    fireEvent.click(screen.getByText('Submit Review'))

    await waitFor(() => expect(screen.getByText('Thanks for your review!')).toBeInTheDocument(), { timeout: 3000 })
    expect(onSubmitted).toHaveBeenCalledWith({ id: 'r1' })

    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body).toMatchObject({ stars: 4, reviewerName: 'Jane Doe', phone: '08012345678' })
  }, 10000)

  it('shows the duplicate-review error returned by the API', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'You have already rated this listing.' }) })
    render(<RatingForm listingId="l1" />)

    fillValid()
    fireEvent.click(screen.getByText('Submit Review'))

    expect(await screen.findByText('You have already rated this listing.', {}, { timeout: 3000 })).toBeInTheDocument()
  }, 10000)

  it('surfaces server-side field errors returned from the API', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ errors: { reviewerName: 'Name looks invalid.' } }) })
    render(<RatingForm listingId="l1" />)

    fillValid()
    fireEvent.click(screen.getByText('Submit Review'))

    expect(await screen.findByText('Name looks invalid.', {}, { timeout: 3000 })).toBeInTheDocument()
  }, 10000)

  it('shows a generic error when the request fails outright', async () => {
    global.fetch.mockRejectedValue(new Error('network down'))
    render(<RatingForm listingId="l1" />)

    fillValid()
    fireEvent.click(screen.getByText('Submit Review'))

    expect(await screen.findByText('Something went wrong. Please try again.', {}, { timeout: 3000 })).toBeInTheDocument()
  }, 10000)

  it('sends the trimmed payload with stars, name, phone, email, and comment', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ rating: { id: 'r1' } }) })
    render(<RatingForm listingId="l42" />)

    fireEvent.click(screen.getByRole('radio', { name: '5 stars' }))
    fireEvent.change(screen.getByLabelText('Your Name *'), { target: { value: '  Jane Doe  ' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '  jane@example.com  ' } })
    fireEvent.change(screen.getByLabelText('Comment (optional)'), { target: { value: '  Great service  ' } })
    fireEvent.click(screen.getByText('Submit Review'))

    await waitFor(() => expect(screen.getByText('Thanks for your review!')).toBeInTheDocument(), { timeout: 3000 })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/yellowpages/listings/l42/ratings',
      expect.objectContaining({ method: 'POST' })
    )
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body).toEqual({ stars: 5, reviewerName: 'Jane Doe', phone: undefined, email: 'jane@example.com', comment: 'Great service' })
  }, 10000)
})
