import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Nav from './Nav'
import YellowPagesChrome from './YellowPagesChrome'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

function renderWithBase(base, { pathname = '/yellowpages/register', query = '', assemblies = [] } = {}) {
  const replace = vi.fn()
  usePathname.mockReturnValue(pathname)
  useRouter.mockReturnValue({ replace })
  useSearchParams.mockReturnValue(new URLSearchParams(query))
  global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(assemblies) }))

  render(
    <YellowPagesChrome base={base}>
      <div />
    </YellowPagesChrome>
  )
  return { replace }
}

describe('Nav', () => {
  it('links the brand mark to the browse feed, prefixed with the base', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/browse' })
    expect(screen.getAllByText('The Yellow Pages')[0].closest('a')).toHaveAttribute('href', '/yellowpages/browse')
  })

  it('renders icon-only tabs with no visible text labels', () => {
    renderWithBase('/yellowpages')
    const nav = within(screen.getByRole('banner'))
    expect(nav.queryByText('Home')).not.toBeInTheDocument()
    expect(nav.queryByText('List Your Skill or Business')).not.toBeInTheDocument()
  })

  it('exposes each tab via an accessible label', () => {
    renderWithBase('/yellowpages')
    expect(screen.getByLabelText('Home feed')).toHaveAttribute('href', '/yellowpages/browse')
    expect(screen.getByLabelText('List your skill or business')).toHaveAttribute('href', '/yellowpages/register')
    expect(screen.getByLabelText('Manage my listing')).toHaveAttribute('href', '/yellowpages/manage')
  })

  it('does not render a "Main Site" link', () => {
    renderWithBase('/yellowpages')
    const nav = within(screen.getByRole('banner'))
    expect(nav.queryByText('Main Site')).not.toBeInTheDocument()
    expect(nav.queryByText('www.destinymissionglobal.org')).not.toBeInTheDocument()
  })

  it('does not render a mobile hamburger menu', () => {
    renderWithBase('/yellowpages')
    expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument()
  })

  it('does not show the search/assembly filter on non-browse pages', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/register' })
    expect(screen.queryByLabelText('Search')).not.toBeInTheDocument()
  })

  it('shows the search/assembly filter on the browse page', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/browse' })
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('Assembly')).toBeInTheDocument()
  })

  it('shows the search filter on a category page too', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/category/TECHNOLOGY_IT' })
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })

  it('debounces search input and updates the URL, preserving other params', async () => {
    const { replace } = renderWithBase('/yellowpages', { pathname: '/yellowpages/browse', query: 'category=TECHNOLOGY_IT' })

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'plumber' } })

    await waitFor(() => expect(replace).toHaveBeenCalled(), { timeout: 2000 })
    const url = replace.mock.calls[0][0]
    expect(url).toContain('q=plumber')
    expect(url).toContain('category=TECHNOLOGY_IT')
  })

  it('updates the URL immediately (no debounce) when the assembly select changes', async () => {
    const { replace } = renderWithBase('/yellowpages', {
      pathname: '/yellowpages/browse',
      assemblies: [{ slug: 'lagos', name: 'Lagos' }],
    })

    await waitFor(() => expect(screen.getByRole('option', { name: 'Lagos' })).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Assembly'), { target: { value: 'lagos' } })

    expect(replace).toHaveBeenCalledWith(expect.stringContaining('assemblySlug=lagos'), { scroll: false })
  })
})
