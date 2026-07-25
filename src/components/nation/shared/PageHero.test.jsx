import { render, screen } from '@testing-library/react'
import PageHero from './PageHero'
import { NATION_IMAGES, imgUrl } from '@/lib/nation/images'

describe('PageHero', () => {
  it('renders the eyebrow, title and subtitle', () => {
    render(
      <PageHero
        imageKey="internalGates"
        eyebrow="Internal Gates"
        title="Building the Nation From Within"
        subtitle="A subtitle describing the internal gates."
      />
    )
    expect(screen.getByText('Internal Gates')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Building the Nation From Within' })).toBeInTheDocument()
    expect(screen.getByText('A subtitle describing the internal gates.')).toBeInTheDocument()
  })

  it('renders the background image with the alt text for the given imageKey', () => {
    render(
      <PageHero imageKey="influenceGates" eyebrow="Influence" title="Title" subtitle="Subtitle" />
    )
    const image = screen.getByAltText(NATION_IMAGES.influenceGates.alt)
    expect(image).toBeInTheDocument()
    expect(image.src).toContain(encodeURIComponent(imgUrl('influenceGates', { w: 2000 })))
  })

  it('renders the photo credit link pointing at the image credit URL', () => {
    render(
      <PageHero imageKey="legacyProjects" eyebrow="Legacy" title="Title" subtitle="Subtitle" />
    )
    const credit = screen.getByRole('link', { name: `Photo by ${NATION_IMAGES.legacyProjects.credit} / Unsplash` })
    expect(credit).toHaveAttribute('href', NATION_IMAGES.legacyProjects.creditUrl)
  })

  it('renders correctly for each defined image key', () => {
    Object.keys(NATION_IMAGES).forEach((key) => {
      const { unmount } = render(
        <PageHero imageKey={key} eyebrow="Eyebrow" title="Title" subtitle="Subtitle" />
      )
      expect(screen.getByAltText(NATION_IMAGES[key].alt)).toBeInTheDocument()
      unmount()
    })
  })

  it('throws when given an imageKey that does not exist in NATION_IMAGES', () => {
    expect(() =>
      render(<PageHero imageKey="doesNotExist" eyebrow="Eyebrow" title="Title" subtitle="Subtitle" />)
    ).toThrow()
  })
})
