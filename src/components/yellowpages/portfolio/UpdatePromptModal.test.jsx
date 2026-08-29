import { render, screen, fireEvent } from '@testing-library/react'
import UpdatePromptModal from './UpdatePromptModal'

const missing = [
  { key: 'skills', addLabel: 'Add your skills', anchor: 'yp-skills' },
  { key: 'about', addLabel: 'Add a professional summary', anchor: 'yp-resumeSummary' },
]

describe('UpdatePromptModal', () => {
  it('renders nothing when there is nothing missing', () => {
    const { container } = render(<UpdatePromptModal missing={[]} editHref="/edit" onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists each missing section as a deep link into the edit form', () => {
    render(<UpdatePromptModal missing={missing} editHref="/yellowpages/manage?listingId=l1" onClose={() => {}} />)
    expect(screen.getByRole('link', { name: /Add your skills/ })).toHaveAttribute(
      'href',
      '/yellowpages/manage?listingId=l1#yp-skills',
    )
    expect(screen.getByRole('link', { name: /Add a professional summary/ })).toHaveAttribute(
      'href',
      '/yellowpages/manage?listingId=l1#yp-resumeSummary',
    )
  })

  it('has an "Edit my portfolio" primary action', () => {
    render(<UpdatePromptModal missing={missing} editHref="/edit" onClose={() => {}} />)
    expect(screen.getByRole('link', { name: 'Edit my portfolio' })).toHaveAttribute('href', '/edit')
  })

  it('calls onClose from the X button, the "Later" button, and the backdrop', () => {
    const onClose = vi.fn()
    render(<UpdatePromptModal missing={missing} editHref="/edit" onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close'))
    fireEvent.click(screen.getByRole('button', { name: 'Later' }))
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('does not close when the modal body itself is clicked', () => {
    const onClose = vi.fn()
    render(<UpdatePromptModal missing={missing} editHref="/edit" onClose={onClose} />)
    fireEvent.click(screen.getByText(/Make your portfolio shine/))
    expect(onClose).not.toHaveBeenCalled()
  })
})
