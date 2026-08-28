import { render, screen, fireEvent } from '@testing-library/react'
import TagInput from './TagInput'

function setup(props = {}) {
  const onChange = vi.fn()
  const utils = render(<TagInput id="skills" label="Skills" values={props.values || []} onChange={onChange} {...props} />)
  const input = screen.getByRole('textbox') || utils.container.querySelector('input')
  return { onChange, input: utils.container.querySelector('input'), ...utils }
}

describe('TagInput', () => {
  it('renders existing values as chips', () => {
    setup({ values: ['React', 'Node'] })
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node')).toBeInTheDocument()
  })

  it('commits a tag on Enter', () => {
    const { onChange, input } = setup({ values: [] })
    fireEvent.change(input, { target: { value: 'Go' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['Go'])
  })

  it('commits a tag on comma and strips the trailing comma', () => {
    const { onChange, input } = setup({ values: [] })
    fireEvent.change(input, { target: { value: 'Rust,' } })
    fireEvent.keyDown(input, { key: ',' })
    expect(onChange).toHaveBeenCalledWith(['Rust'])
  })

  it('ignores blank input', () => {
    const { onChange, input } = setup({ values: [] })
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('rejects a case-insensitive duplicate', () => {
    const { onChange, input } = setup({ values: ['Go'] })
    fireEvent.change(input, { target: { value: 'go' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('enforces the max count', () => {
    const { onChange, input } = setup({ values: ['a', 'b'], max: 2 })
    fireEvent.change(input, { target: { value: 'c' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows a count when max is set', () => {
    setup({ values: ['a'], max: 5 })
    expect(screen.getByText('(1/5)')).toBeInTheDocument()
  })

  it('removes the last chip on Backspace with an empty draft', () => {
    const { onChange, input } = setup({ values: ['a', 'b'] })
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('does not remove on Backspace when the draft is non-empty', () => {
    const { onChange, input } = setup({ values: ['a'] })
    fireEvent.change(input, { target: { value: 'x' } })
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('removes a specific chip via its remove button', () => {
    const { onChange } = setup({ values: ['React', 'Node'] })
    fireEvent.click(screen.getByLabelText('Remove React'))
    expect(onChange).toHaveBeenCalledWith(['Node'])
  })

  it('commits the pending draft on blur', () => {
    const { onChange, input } = setup({ values: [] })
    fireEvent.change(input, { target: { value: 'Blurred' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(['Blurred'])
  })

  it('renders an error message when provided', () => {
    setup({ values: [], error: 'Add at least one skill' })
    expect(screen.getByText('Add at least one skill')).toBeInTheDocument()
  })
})
