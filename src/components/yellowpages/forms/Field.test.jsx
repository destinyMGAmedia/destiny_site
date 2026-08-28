import { render, screen, fireEvent } from '@testing-library/react'
import { FieldError, TextField, TextArea } from './Field'

describe('FieldError', () => {
  it('renders nothing without a message', () => {
    const { container } = render(<FieldError message="" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the message when provided', () => {
    render(<FieldError message="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })
})

describe('TextField', () => {
  it('renders a labelled input wired to the id', () => {
    render(<TextField id="name" label="Name" value="Jane" onChange={() => {}} />)
    const input = screen.getByLabelText('Name')
    expect(input).toHaveValue('Jane')
    expect(input).toHaveAttribute('id', 'name')
  })

  it('coerces a nullish value to an empty string (controlled input)', () => {
    render(<TextField id="name" label="Name" value={null} onChange={() => {}} />)
    expect(screen.getByLabelText('Name')).toHaveValue('')
  })

  it('emits the raw string value on change', () => {
    const onChange = vi.fn()
    render(<TextField id="name" label="Name" value="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } })
    expect(onChange).toHaveBeenCalledWith('Ada')
  })

  it('shows the error message and the hint', () => {
    render(<TextField id="name" label="Name" value="" onChange={() => {}} error="Bad" hint="Your legal name" />)
    expect(screen.getByText('Bad')).toBeInTheDocument()
    expect(screen.getByText('Your legal name')).toBeInTheDocument()
  })

  it('honours the type prop', () => {
    render(<TextField id="years" label="Years" type="number" value="3" onChange={() => {}} />)
    expect(screen.getByLabelText('Years')).toHaveAttribute('type', 'number')
  })

  it('renders no label element when label is omitted', () => {
    const { container } = render(<TextField id="x" value="" onChange={() => {}} />)
    expect(container.querySelector('label')).toBeNull()
  })
})

describe('TextArea', () => {
  it('renders a labelled textarea and forwards rows / maxLength', () => {
    render(<TextArea id="bio" label="Bio" value="hi" onChange={() => {}} rows={5} maxLength={100} />)
    const ta = screen.getByLabelText('Bio')
    expect(ta.tagName).toBe('TEXTAREA')
    expect(ta).toHaveValue('hi')
    expect(ta).toHaveAttribute('rows', '5')
    expect(ta).toHaveAttribute('maxlength', '100')
  })

  it('emits value on change and coerces nullish value', () => {
    const onChange = vi.fn()
    render(<TextArea id="bio" label="Bio" value={undefined} onChange={onChange} />)
    expect(screen.getByLabelText('Bio')).toHaveValue('')
    fireEvent.change(screen.getByLabelText('Bio'), { target: { value: 'text' } })
    expect(onChange).toHaveBeenCalledWith('text')
  })

  it('shows an error message', () => {
    render(<TextArea id="bio" label="Bio" value="" onChange={() => {}} error="Too short" />)
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })
})
