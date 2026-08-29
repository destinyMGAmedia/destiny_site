import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NationContributionsTable from './NationContributionsTable'

const contributions = [
  {
    id: '1',
    donorName: 'Ada Okoye',
    donorEmail: 'ada@example.com',
    package: 'LADDER',
    tier: 'GATEKEEPER_FRIEND',
    amount: 30000,
    currency: 'NGN',
    status: 'SUCCESS',
    isPledge: false,
    isManualEntry: false,
    followUpNotes: '',
  },
  {
    id: '2',
    donorName: 'Chuka Eze',
    donorEmail: 'chuka@example.com',
    package: 'FOUNDERS_CIRCLE',
    tier: 'BRONZE',
    amount: 25000000,
    currency: 'NGN',
    status: 'PLEDGED',
    isPledge: true,
    isManualEntry: false,
    followUpNotes: '',
  },
]

describe('NationContributionsTable', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
  })

  it('renders every contribution row', () => {
    render(<NationContributionsTable contributions={contributions} />)
    expect(screen.getByText('Ada Okoye')).toBeInTheDocument()
    expect(screen.getByText('Chuka Eze')).toBeInTheDocument()
  })

  it('filters rows by status', () => {
    render(<NationContributionsTable contributions={contributions} />)
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'PLEDGED' } })
    expect(screen.queryByText('Ada Okoye')).not.toBeInTheDocument()
    expect(screen.getByText('Chuka Eze')).toBeInTheDocument()
  })

  it('filters to pledges only', () => {
    render(<NationContributionsTable contributions={contributions} />)
    fireEvent.click(screen.getByLabelText('Pledges only'))
    expect(screen.queryByText('Ada Okoye')).not.toBeInTheDocument()
    expect(screen.getByText('Chuka Eze')).toBeInTheDocument()
  })

  it('shows "no contributions" when a filter matches nothing', () => {
    render(<NationContributionsTable contributions={contributions} />)
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'FOUNDERS_CIRCLE' } })
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'SUCCESS' } })
    expect(screen.getByText('No contributions match these filters.')).toBeInTheDocument()
  })

  it('saves follow-up notes for a pledge row via PATCH', async () => {
    render(<NationContributionsTable contributions={contributions} />)
    const notesInput = screen.getByPlaceholderText('Notes…')
    fireEvent.change(notesInput, { target: { value: 'Called, following up next week' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/nation/2',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ followUpNotes: 'Called, following up next week' }),
        })
      )
    })
  })
})
