import { render, screen, fireEvent } from '@testing-library/react'
import { ImageLightbox, useImageLightbox } from './ImageLightbox'

// ── Test harness for the hook ──────────────────────────────────────────────────
function Harness({ images }) {
  const lb = useImageLightbox()
  return (
    <div>
      <button onClick={() => lb.open(images, 0)}>open</button>
      <button onClick={() => lb.open(images[1])}>open-single</button>
      <button onClick={() => lb.open(images, 99)}>open-overshoot</button>
      <button onClick={() => lb.open(images, -3)}>open-undershoot</button>
      <button onClick={lb.close}>close</button>
      <span data-testid="isOpen">{String(lb.isOpen)}</span>
      {lb.node}
    </div>
  )
}

const IMAGES = ['https://cdn/a.jpg', 'https://cdn/b.jpg', 'https://cdn/c.jpg']

// ── B. INTEGRATION — hook wired to the real ImageLightbox component ────────────
describe('useImageLightbox (hook + real component)', () => {
  it('is closed until open() is called', () => {
    render(<Harness images={IMAGES} />)
    expect(screen.queryByRole('dialog', { name: 'Image preview' })).not.toBeInTheDocument()
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')
  })

  it('opens on the given image and reports isOpen', () => {
    render(<Harness images={IMAGES} />)
    fireEvent.click(screen.getByText('open'))
    const dialog = screen.getByRole('dialog', { name: 'Image preview' })
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://cdn/a.jpg')
    expect(screen.getByTestId('isOpen')).toHaveTextContent('true')
  })

  it('closes on the backdrop and on the close button', () => {
    render(<Harness images={IMAGES} />)
    fireEvent.click(screen.getByText('open'))
    fireEvent.click(screen.getByLabelText('Close preview'))
    expect(screen.queryByRole('dialog', { name: 'Image preview' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('open'))
    fireEvent.click(screen.getByRole('dialog', { name: 'Image preview' }))
    expect(screen.queryByRole('dialog', { name: 'Image preview' })).not.toBeInTheDocument()
  })

  it('close() dismisses an open lightbox', () => {
    render(<Harness images={IMAGES} />)
    fireEvent.click(screen.getByText('open'))
    fireEvent.click(screen.getByText('close'))
    expect(screen.queryByRole('dialog', { name: 'Image preview' })).not.toBeInTheDocument()
  })

  it('steps through images with the next / prev controls, wrapping both ways', () => {
    render(<Harness images={IMAGES} />)
    fireEvent.click(screen.getByText('open'))
    fireEvent.click(screen.getByLabelText('Next image'))
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', 'https://cdn/b.jpg')

    fireEvent.click(screen.getByLabelText('Previous image'))
    fireEvent.click(screen.getByLabelText('Previous image'))
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', 'https://cdn/c.jpg')
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('keyboard arrows drive navigation through the hook', () => {
    render(<Harness images={IMAGES} />)
    fireEvent.click(screen.getByText('open'))
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', 'https://cdn/b.jpg')
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', 'https://cdn/c.jpg')
  })

  it('accepts a single url string and shows no nav controls or counter', () => {
    render(<Harness images={IMAGES} />)
    fireEvent.click(screen.getByText('open-single'))
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', 'https://cdn/b.jpg')
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument()
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument()
  })

  it('clamps the start index into range (overshoot → last)', () => {
    render(<Harness images={IMAGES} />)
    fireEvent.click(screen.getByText('open-overshoot'))
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', 'https://cdn/c.jpg')
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('clamps the start index into range (negative → first)', () => {
    render(<Harness images={IMAGES} />)
    fireEvent.click(screen.getByText('open-undershoot'))
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', 'https://cdn/a.jpg')
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('drops non-string / empty entries before opening', () => {
    render(<Harness images={['x.jpg', '', null, undefined, 5, 'y.jpg']} />)
    fireEvent.click(screen.getByText('open'))
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', 'x.jpg')
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('ignores an empty image list entirely', () => {
    render(<Harness images={[]} />)
    fireEvent.click(screen.getByText('open'))
    expect(screen.queryByRole('dialog', { name: 'Image preview' })).not.toBeInTheDocument()
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')
  })

  it('ignores an all-falsy image list', () => {
    render(<Harness images={['', null, undefined, false, 0]} />)
    fireEvent.click(screen.getByText('open'))
    expect(screen.queryByRole('dialog', { name: 'Image preview' })).not.toBeInTheDocument()
  })
})

// ── A. UNIT — the ImageLightbox component in isolation ────────────────────────
describe('ImageLightbox (component)', () => {
  const setup = (props = {}) => {
    const onIndex = vi.fn()
    const onClose = vi.fn()
    const utils = render(
      <ImageLightbox images={IMAGES} index={0} onIndex={onIndex} onClose={onClose} {...props} />
    )
    return { onIndex, onClose, ...utils }
  }

  it('renders the current image and an "n / total" counter', () => {
    setup({ index: 1 })
    expect(screen.getByRole('dialog', { name: 'Image preview' }).querySelector('img'))
      .toHaveAttribute('src', IMAGES[1])
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('locks body scroll while mounted and restores the previous value on unmount', () => {
    document.body.style.overflow = 'scroll'
    const { unmount } = setup()
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('scroll')
    document.body.style.overflow = ''
  })

  it('calls onClose on Escape', () => {
    const { onClose } = setup()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the backdrop is clicked', () => {
    const { onClose } = setup()
    fireEvent.click(screen.getByRole('dialog', { name: 'Image preview' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose from the close button', () => {
    const { onClose } = setup()
    fireEvent.click(screen.getByLabelText('Close preview'))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not close when the image itself is clicked (stopPropagation)', () => {
    const { onClose } = setup()
    fireEvent.click(screen.getByRole('dialog').querySelector('img'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('advances / rewinds with the arrow keys, wrapping around', () => {
    const { onIndex } = setup({ index: 0 })
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onIndex).toHaveBeenLastCalledWith(1)
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(onIndex).toHaveBeenLastCalledWith(2) // (0 - 1 + 3) % 3
  })

  it('advances / rewinds with the on-screen nav buttons without closing', () => {
    const { onIndex, onClose } = setup({ index: 2 })
    fireEvent.click(screen.getByLabelText('Next image'))
    expect(onIndex).toHaveBeenLastCalledWith(0) // wraps 2 -> 0
    fireEvent.click(screen.getByLabelText('Previous image'))
    expect(onIndex).toHaveBeenLastCalledWith(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('hides nav controls and the counter for a single image', () => {
    render(<ImageLightbox images={['only.jpg']} index={0} onIndex={vi.fn()} onClose={vi.fn()} />)
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument()
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument()
  })

  it('ignores arrow keys when there is only one image', () => {
    const onIndex = vi.fn()
    render(<ImageLightbox images={['only.jpg']} index={0} onIndex={onIndex} onClose={vi.fn()} />)
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(onIndex).not.toHaveBeenCalled()
  })

  it('ignores unrelated keys', () => {
    const { onIndex, onClose } = setup()
    fireEvent.keyDown(document, { key: 'a' })
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: ' ' })
    expect(onIndex).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('detaches its key listener on unmount', () => {
    const { onClose, unmount } = setup()
    unmount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
