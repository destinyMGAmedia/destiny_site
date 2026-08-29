import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CvImportField from './CvImportField'

const file = (name, type, kb = 10) => new File([new Uint8Array(kb * 1024)], name, { type })

function setup() {
  const onParsed = vi.fn()
  render(<CvImportField onParsed={onParsed} />)
  const input = screen.getByLabelText('Upload your CV')
  return { onParsed, input }
}

describe('CvImportField', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects an unsupported file type without calling the API', async () => {
    const { input } = setup()
    global.fetch = vi.fn()
    fireEvent.change(input, { target: { files: [file('cv.doc', 'application/msword')] } })
    expect(await screen.findByText(/aren.t supported/)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('rejects a file over 4 MB', async () => {
    const { input } = setup()
    fireEvent.change(input, { target: { files: [file('cv.pdf', 'application/pdf', 4 * 1024 + 1)] } })
    expect(await screen.findByText(/keep it under 4 MB/i)).toBeInTheDocument()
  })

  it('uploads the chosen file and hands the parsed fields to onParsed', async () => {
    const parsed = { name: 'Jane', skills: ['React'] }
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ parsed }) }))
    const { onParsed, input } = setup()

    fireEvent.change(input, { target: { files: [file('cv.pdf', 'application/pdf')] } })
    fireEvent.click(await screen.findByText('Extract details'))

    await waitFor(() => expect(onParsed).toHaveBeenCalledWith(parsed))
    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/yellowpages/resume/import')
    expect(opts.method).toBe('POST')
    expect(opts.body).toBeInstanceOf(FormData)
  })

  it('surfaces a server error message and does not call onParsed', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'That file has no selectable text.' }) }))
    const { onParsed, input } = setup()
    fireEvent.change(input, { target: { files: [file('cv.pdf', 'application/pdf')] } })
    fireEvent.click(await screen.findByText('Extract details'))
    expect(await screen.findByText('That file has no selectable text.')).toBeInTheDocument()
    expect(onParsed).not.toHaveBeenCalled()
  })
})
