import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OtpModal from './OtpModal'

function setup(props = {}) {
  const onVerify = props.onVerify || vi.fn().mockResolvedValue({ error: null })
  const onResend = props.onResend || vi.fn().mockResolvedValue({ error: null })
  const onClose = props.onClose || vi.fn()
  render(<OtpModal maskedTo="j•••@example.com" onVerify={onVerify} onResend={onResend} onClose={onClose} />)
  const input = screen.getByLabelText('Verification code')
  return { onVerify, onResend, onClose, input }
}

describe('OtpModal', () => {
  it('shows where the code was sent', () => {
    setup()
    expect(screen.getByText('j•••@example.com')).toBeInTheDocument()
  })

  it('strips non-digits from typed input', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '12a3b4' } })
    expect(input).toHaveValue('1234')
  })

  it('validates the code length before calling onVerify', async () => {
    const { onVerify, input } = setup()
    fireEvent.change(input, { target: { value: '123' } })
    fireEvent.submit(input.closest('form'))
    expect(await screen.findByText('Enter the 6-digit code.')).toBeInTheDocument()
    expect(onVerify).not.toHaveBeenCalled()
  })

  it('calls onVerify with the 6-digit code and shows a returned error', async () => {
    const onVerify = vi.fn().mockResolvedValue({ error: 'Incorrect code.' })
    const { input } = setup({ onVerify })
    fireEvent.change(input, { target: { value: '654321' } })
    fireEvent.submit(input.closest('form'))
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith('654321'))
    expect(await screen.findByText('Incorrect code.')).toBeInTheDocument()
  })

  it('leaves the modal to the parent on a successful verify (no error shown)', async () => {
    const onVerify = vi.fn().mockResolvedValue({ error: null })
    const { input } = setup({ onVerify })
    fireEvent.change(input, { target: { value: '111111' } })
    fireEvent.submit(input.closest('form'))
    await waitFor(() => expect(onVerify).toHaveBeenCalled())
    expect(screen.queryByText(/Incorrect/)).not.toBeInTheDocument()
  })

  it('resends a code and confirms it', async () => {
    const onResend = vi.fn().mockResolvedValue({ error: null })
    setup({ onResend })
    fireEvent.click(screen.getByRole('button', { name: 'Resend code' }))
    await waitFor(() => expect(onResend).toHaveBeenCalled())
    expect(await screen.findByText('A new code is on its way.')).toBeInTheDocument()
  })

  it('surfaces a resend error instead of the confirmation', async () => {
    const onResend = vi.fn().mockResolvedValue({ error: 'Too many requests.' })
    setup({ onResend })
    fireEvent.click(screen.getByRole('button', { name: 'Resend code' }))
    expect(await screen.findByText('Too many requests.')).toBeInTheDocument()
    expect(screen.queryByText('A new code is on its way.')).not.toBeInTheDocument()
  })

  it('calls onClose from the X button', () => {
    const { onClose } = setup()
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })
})
