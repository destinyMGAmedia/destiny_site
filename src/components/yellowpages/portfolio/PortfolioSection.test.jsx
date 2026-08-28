import { render, screen } from '@testing-library/react'
import PortfolioSection from './PortfolioSection'

const child = <p>real content</p>

describe('PortfolioSection', () => {
  it('renders children when filled', () => {
    render(
      <PortfolioSection id="yp-skills" title="Skills" filled addLabel="Add skills" isOwner={false} editHref="/e">
        {child}
      </PortfolioSection>,
    )
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('real content')).toBeInTheDocument()
  })

  it('renders nothing for a visitor when the section is empty', () => {
    const { container } = render(
      <PortfolioSection id="yp-skills" title="Skills" filled={false} addLabel="Add skills" isOwner={false} editHref="/e">
        {child}
      </PortfolioSection>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the EmptySection prompt for the owner when empty', () => {
    render(
      <PortfolioSection id="yp-skills" title="Skills" filled={false} addLabel="Add your skills" isOwner editHref="/edit">
        {child}
      </PortfolioSection>,
    )
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.queryByText('real content')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Add your skills/ })).toHaveAttribute('href', '/edit')
  })

  it('applies the given id to the section element', () => {
    const { container } = render(
      <PortfolioSection id="yp-about" title="About" filled isOwner={false} editHref="/e">
        {child}
      </PortfolioSection>,
    )
    expect(container.querySelector('section#yp-about')).toBeInTheDocument()
  })
})
