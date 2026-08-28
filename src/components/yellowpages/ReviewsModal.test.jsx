import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReviewsModal from './ReviewsModal'

// ReviewsModal is a pure presentational shell around three real child components
// (BackLink, RatingStars, RatingForm). Those are same-process collaborators, so they
// are rendered for real here. The only boundary that cannot be reached in jsdom is the
// ratings POST that RatingForm fires on submit — that (and only that) is stubbed on
// global.fetch, the same way the rest of the yellowpages suite does it.

const rating = (over = {}) => ({
  id: 'r1',
  stars: 4,
  reviewerName: 'Ada',
  comment: 'Very professional and quick.',
  ...over,
})

function renderModal(props = {}) {
  const onClose = props.onClose || vi.fn()
  const onSubmitted = props.onSubmitted || vi.fn()
  const listing = {
    ratings: [],
    ratingCount: 0,
    avgRating: 0,
    ...props.listing,
  }
  const utils = render(
    <ReviewsModal listing={listing} listingId={props.listingId || 'l1'} onClose={onClose} onSubmitted={onSubmitted} />,
  )
  return { ...utils, onClose, onSubmitted }
}

describe('ReviewsModal', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('review list rendering', () => {
    it('shows the empty state and hides the rating summary when there are no reviews', () => {
      renderModal({ listing: { ratings: [], ratingCount: 0, avgRating: 0 } })

      expect(screen.getByText('No reviews yet — be the first to leave one.')).toBeInTheDocument()
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
      // ratingCount is 0 -> the "x.x (n)" summary next to the heading is not rendered
      expect(screen.queryByText('(0)', { exact: false })).not.toBeInTheDocument()
    })

    it('renders each review with its reviewer name and comment', () => {
      renderModal({
        listing: {
          ratings: [
            rating({ id: 'a', reviewerName: 'Ada', comment: 'Great work.' }),
            rating({ id: 'b', reviewerName: 'Grace', comment: 'On time.' }),
          ],
          ratingCount: 2,
          avgRating: 4.5,
        },
      })

      const items = screen.getAllByRole('listitem')
      expect(items).toHaveLength(2)
      expect(screen.getByText('Ada')).toBeInTheDocument()
      expect(screen.getByText('Great work.')).toBeInTheDocument()
      expect(screen.getByText('Grace')).toBeInTheDocument()
      expect(screen.getByText('On time.')).toBeInTheDocument()
      expect(screen.queryByText('No reviews yet — be the first to leave one.')).not.toBeInTheDocument()
    })

    it('omits the comment paragraph for a review with no comment', () => {
      renderModal({
        listing: {
          ratings: [rating({ id: 'a', reviewerName: 'Ada', comment: '' })],
          ratingCount: 1,
          avgRating: 4,
        },
      })

      expect(screen.getByText('Ada')).toBeInTheDocument()
      // the only text nodes under the list item are the reviewer name + stars label
      const item = screen.getByRole('listitem')
      expect(item.querySelectorAll('p')).toHaveLength(0)
    })

    it('shows the average rating (one decimal) and count when ratingCount > 0', () => {
      renderModal({
        listing: {
          ratings: [rating(), rating({ id: 'r2' }), rating({ id: 'r3' })],
          ratingCount: 3,
          avgRating: 4.6667,
        },
      })

      expect(screen.getByText('4.7')).toBeInTheDocument()
      expect(screen.getByText('(3)', { exact: false })).toBeInTheDocument()
    })

    it('treats a listing with no ratings array as empty (no crash)', () => {
      renderModal({ listing: { ratingCount: 0, avgRating: 0 } })
      expect(screen.getByText('No reviews yet — be the first to leave one.')).toBeInTheDocument()
    })
  })

  describe('dismissal wiring', () => {
    it('calls onClose when the backdrop is clicked', () => {
      const { onClose } = renderModal()
      fireEvent.click(screen.getByRole('dialog'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when a click lands inside the modal body (stopPropagation)', () => {
      const { onClose } = renderModal()
      fireEvent.click(screen.getByRole('heading', { name: 'Reviews' }))
      expect(onClose).not.toHaveBeenCalled()
    })

    it('calls onClose from the BackLink affordance', () => {
      const { onClose } = renderModal()
      fireEvent.click(screen.getByRole('button', { name: /back to portfolio/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('renders the BackLink as a button (modal mode), never an anchor', () => {
      renderModal()
      const back = screen.getByRole('button', { name: /back to portfolio/i })
      expect(back.tagName).toBe('BUTTON')
      expect(screen.queryByRole('link', { name: /back to portfolio/i })).not.toBeInTheDocument()
    })

    it('calls onClose from the X button', () => {
      const { onClose } = renderModal()
      fireEvent.click(screen.getByRole('button', { name: 'Close reviews' }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('exposes an accessible dialog role and label', () => {
      renderModal()
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-label', 'Reviews')
    })
  })

  describe('leave-a-review form (real RatingForm integration)', () => {
    it('renders the embedded RatingForm', () => {
      renderModal()
      expect(screen.getByRole('heading', { name: 'Leave a review' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit Review' })).toBeInTheDocument()
    })

    it('surfaces RatingForm client-side validation without hitting the network', () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      renderModal()

      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }))

      expect(screen.getByText('Please choose a star rating.')).toBeInTheDocument()
      expect(screen.getByText('Your name is required.')).toBeInTheDocument()
      expect(screen.getByText('Please provide your phone number or email.')).toBeInTheDocument()
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('posts to the listing ratings endpoint and calls onSubmitted with the new rating', async () => {
      const created = { id: 'r99', stars: 5, reviewerName: 'Sam', comment: 'Excellent.' }
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ rating: created }),
      })
      const { onSubmitted } = renderModal({ listingId: 'listing-42' })

      fireEvent.click(screen.getByRole('radio', { name: '5 stars' }))
      fireEvent.change(screen.getByLabelText('Your Name *'), { target: { value: 'Sam' } })
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'sam@example.com' } })
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }))

      await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(created))

      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('/api/yellowpages/listings/listing-42/ratings')
      expect(init.method).toBe('POST')
      const sent = JSON.parse(init.body)
      expect(sent).toMatchObject({ stars: 5, reviewerName: 'Sam', email: 'sam@example.com' })
      expect(await screen.findByText('Thanks for your review!')).toBeInTheDocument()
    })

    it('shows the server error and does not call onSubmitted when the POST fails', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'You have already reviewed this listing.' }),
      })
      const { onSubmitted } = renderModal()

      fireEvent.click(screen.getByRole('radio', { name: '4 stars' }))
      fireEvent.change(screen.getByLabelText('Your Name *'), { target: { value: 'Pat' } })
      fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '+2348012345678' } })
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }))

      expect(await screen.findByText('You have already reviewed this listing.')).toBeInTheDocument()
      expect(onSubmitted).not.toHaveBeenCalled()
    })
  })
})
