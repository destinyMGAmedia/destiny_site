import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ImageUploadField from './ImageUploadField'
import { useYellowPagesUpload } from '@/lib/yellowpages/useYellowPagesUpload'

vi.mock('@/lib/yellowpages/useYellowPagesUpload', () => ({
  useYellowPagesUpload: vi.fn(),
}))

const file = new File(['x'], 'logo.png', { type: 'image/png' })

describe('ImageUploadField', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the upload prompt when there is no value', () => {
    useYellowPagesUpload.mockReturnValue({ upload: vi.fn(), uploading: false, error: null })
    render(<ImageUploadField label="Business Logo" type="logo" value="" onChange={() => {}} />)
    expect(screen.getByText('Click to upload')).toBeInTheDocument()
  })

  it('shows the uploading state', () => {
    useYellowPagesUpload.mockReturnValue({ upload: vi.fn(), uploading: true, error: null })
    render(<ImageUploadField label="Business Logo" type="logo" value="" onChange={() => {}} />)
    expect(screen.getByText('Uploading…')).toBeInTheDocument()
  })

  it('shows a preview and remove button when a value is set', () => {
    useYellowPagesUpload.mockReturnValue({ upload: vi.fn(), uploading: false, error: null })
    render(<ImageUploadField label="Business Logo" type="logo" value="https://example.com/logo.png" onChange={() => {}} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/logo.png')
    expect(screen.getByLabelText('Remove Business Logo')).toBeInTheDocument()
  })

  it('clears the value when the remove button is clicked', () => {
    useYellowPagesUpload.mockReturnValue({ upload: vi.fn(), uploading: false, error: null })
    const onChange = vi.fn()
    render(<ImageUploadField label="Business Logo" type="logo" value="https://example.com/logo.png" onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Remove Business Logo'))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('uploads the selected file and reports the resulting URL', async () => {
    const upload = vi.fn().mockResolvedValue({ secure_url: 'https://example.com/uploaded.png' })
    useYellowPagesUpload.mockReturnValue({ upload, uploading: false, error: null })
    const onChange = vi.fn()
    render(<ImageUploadField label="Business Logo" type="logo" value="" onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Business Logo'), { target: { files: [file] } })

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('https://example.com/uploaded.png'), { timeout: 4000 })
    expect(upload).toHaveBeenCalledWith(file, 'logo')
  })

  it('shows a local error message when the upload rejects', async () => {
    const upload = vi.fn().mockRejectedValue(new Error('nope'))
    useYellowPagesUpload.mockReturnValue({ upload, uploading: false, error: null })
    render(<ImageUploadField label="Business Logo" type="logo" value="" onChange={() => {}} />)

    fireEvent.change(screen.getByLabelText('Business Logo'), { target: { files: [file] } })

    await waitFor(() => expect(screen.getByText('Upload failed. Please try again.')).toBeInTheDocument(), { timeout: 4000 })
  })
})
