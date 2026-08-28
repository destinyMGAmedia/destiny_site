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

  it('does not call onVerify until the full 6-digit code is entered', () => {
    const { onVerify, input } = setup()
    fireEvent.change(input, { target: { value: '123' } })
    fireEvent.change(input, { target: { value: '12345' } })
    expect(onVerify).not.toHaveBeenCalled()
  })

  it('auto-verifies the moment the 6th digit is entered (no button press)', async () => {
    const onVerify = vi.fn().mockResolvedValue({ error: null })
    const { input } = setup({ onVerify })
    fireEvent.change(input, { target: { value: '654321' } })
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith('654321'))
  })

  it('shows a returned error and a "Try again" button, and re-verifies after an edit', async () => {
    const onVerify = vi.fn()
      .mockResolvedValueOnce({ error: 'Incorrect code.' })
      .mockResolvedValueOnce({ error: null })
    const { input } = setup({ onVerify })

    fireEvent.change(input, { target: { value: '000000' } })
    expect(await screen.findByText('Incorrect code.')).toBeInTheDocument()

    // same code again does NOT auto-fire (no loop); editing to a new full code does
    fireEvent.change(input, { target: { value: '00000' } })
    fireEvent.change(input, { target: { value: '123456' } })
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith('123456'))
  })

  it('the "Try again" button re-submits the same code', async () => {
    const onVerify = vi.fn()
      .mockResolvedValueOnce({ error: 'Incorrect code.' })
      .mockResolvedValueOnce({ error: 'Incorrect code.' })
    const { input } = setup({ onVerify })
    fireEvent.change(input, { target: { value: '000000' } })
    await screen.findByText('Incorrect code.')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(onVerify).toHaveBeenCalledTimes(2))
  })

  it('leaves the modal to the parent on a successful verify (no error shown)', async () => {
    const onVerify = vi.fn().mockResolvedValue({ error: null })
    const { input } = setup({ onVerify })
    fireEvent.change(input, { target: { value: '111111' } })
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
