import { render, screen } from '@testing-library/react'
import YellowPagesBaseOnly from './YellowPagesBaseOnly'
import { useYellowPagesBase } from './context'

function BaseProbe() {
  return <span data-testid="base">{useYellowPagesBase()}</span>
}

describe('YellowPagesBaseOnly', () => {
  it('renders its children', () => {
    render(
      <YellowPagesBaseOnly base="/yellowpages">
        <p>cover page content</p>
      </YellowPagesBaseOnly>
    )
    expect(screen.getByText('cover page content')).toBeInTheDocument()
  })

  it('provides the base value via useYellowPagesBase', () => {
    render(
      <YellowPagesBaseOnly base="/yellowpages">
        <BaseProbe />
      </YellowPagesBaseOnly>
    )
    expect(screen.getByTestId('base')).toHaveTextContent('/yellowpages')
  })

  it('propagates an empty base string (yellowpages subdomain) unchanged', () => {
    render(
      <YellowPagesBaseOnly base="">
        <BaseProbe />
      </YellowPagesBaseOnly>
    )
    expect(screen.getByTestId('base')).toHaveTextContent('')
  })

  it('applies the yp-theme class to the wrapping div', () => {
    const { container } = render(
      <YellowPagesBaseOnly base="/yellowpages">
        <p>content</p>
      </YellowPagesBaseOnly>
    )
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('yp-theme')
    expect(wrapper).toHaveClass('flex')
    expect(wrapper).toHaveClass('flex-col')
  })

  it('renders no navigation bar', () => {
    render(
      <YellowPagesBaseOnly base="/yellowpages">
        <p>content</p>
      </YellowPagesBaseOnly>
    )
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByText('The Yellow Pages')).not.toBeInTheDocument()
  })

  it('renders no footer', () => {
    render(
      <YellowPagesBaseOnly base="/yellowpages">
        <p>content</p>
      </YellowPagesBaseOnly>
    )
    expect(screen.queryByText(new RegExp(`© ${new Date().getFullYear()}`))).not.toBeInTheDocument()
  })
})
