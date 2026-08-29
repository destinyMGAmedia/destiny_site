import { render, screen, fireEvent } from '@testing-library/react'
import RepeatableList from './RepeatableList'

const renderRow = ({ item, index, update }) => (
  <div>
    <input
      aria-label={`title-${index}`}
      value={item.title || ''}
      onChange={(e) => update({ title: e.target.value })}
    />
  </div>
)

function setup(props = {}) {
  const onChange = vi.fn()
  const utils = render(
    <RepeatableList
      id="experience"
      title="Experience"
      items={props.items || []}
      onChange={onChange}
      makeEmpty={() => ({ title: '' })}
      addLabel="Add experience"
      {...props}
    >
      {renderRow}
    </RepeatableList>,
  )
  return { onChange, ...utils }
}

describe('RepeatableList', () => {
  it('renders the title and an add button', () => {
    setup()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add experience/ })).toBeInTheDocument()
  })

  it('renders one row per item via the render prop', () => {
    setup({ items: [{ title: 'A' }, { title: 'B' }] })
    expect(screen.getByLabelText('title-0')).toHaveValue('A')
    expect(screen.getByLabelText('title-1')).toHaveValue('B')
  })

  it('appends a fresh empty row on add', () => {
    const { onChange } = setup({ items: [{ title: 'A' }] })
    fireEvent.click(screen.getByRole('button', { name: /Add experience/ }))
    expect(onChange).toHaveBeenCalledWith([{ title: 'A' }, { title: '' }])
  })

  it('shallow-merges a patch into the right row on update', () => {
    const { onChange } = setup({ items: [{ title: 'A', keep: 1 }, { title: 'B' }] })
    fireEvent.change(screen.getByLabelText('title-0'), { target: { value: 'Changed' } })
    expect(onChange).toHaveBeenCalledWith([{ title: 'Changed', keep: 1 }, { title: 'B' }])
  })

  it('removes a row by index', () => {
    const { onChange } = setup({ items: [{ title: 'A' }, { title: 'B' }] })
    fireEvent.click(screen.getByLabelText('Remove Experience entry 1'))
    expect(onChange).toHaveBeenCalledWith([{ title: 'B' }])
  })

  it('shows an n/max counter and disables add at the cap', () => {
    const { onChange } = setup({ items: [{ title: 'A' }, { title: 'B' }], max: 2 })
    expect(screen.getByText('2/2')).toBeInTheDocument()
    const addBtn = screen.getByRole('button', { name: /Add experience/ })
    expect(addBtn).toBeDisabled()
    fireEvent.click(addBtn)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders the hint text when supplied', () => {
    setup({ hint: 'Add your most recent roles first' })
    expect(screen.getByText('Add your most recent roles first')).toBeInTheDocument()
  })
})
