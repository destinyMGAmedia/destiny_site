import { render, screen } from '@testing-library/react'
import NationChrome, { useNationBase } from './NationChrome'

vi.mock('./TabNav', () => ({
  default: () => <div data-testid="tab-nav" />,
}))
vi.mock('./Footer', () => ({
  default: () => <div data-testid="footer" />,
}))

function BaseConsumer() {
  const base = useNationBase()
  return <p data-testid="base-value">{base === '' ? '(empty)' : base}</p>
}

describe('NationChrome', () => {
  it('renders TabNav, the children, and Footer', () => {
    render(
      <NationChrome base="/nation">
        <p>child content</p>
      </NationChrome>
    )
    expect(screen.getByTestId('tab-nav')).toBeInTheDocument()
    expect(screen.getByText('child content')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders TabNav before children and children before Footer', () => {
    render(
      <NationChrome base="/nation">
        <p>child content</p>
      </NationChrome>
    )
    const tabNav = screen.getByTestId('tab-nav')
    const child = screen.getByText('child content')
    const footer = screen.getByTestId('footer')

    expect(tabNav.compareDocumentPosition(child) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(child.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('provides the base prop value to consumers via useNationBase', () => {
    render(
      <NationChrome base="/nation">
        <BaseConsumer />
      </NationChrome>
    )
    expect(screen.getByTestId('base-value')).toHaveTextContent('/nation')
  })

  it('provides an empty-string base to consumers when base=""', () => {
    render(
      <NationChrome base="">
        <BaseConsumer />
      </NationChrome>
    )
    expect(screen.getByTestId('base-value')).toHaveTextContent('(empty)')
  })
})
