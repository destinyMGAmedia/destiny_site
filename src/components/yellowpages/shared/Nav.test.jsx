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

  it('keeps the search filter row shrinkable so a long assembly name cannot force the header to overflow', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/browse' })
    const filterRow = screen.getByLabelText('Search').closest('.flex-1.flex.items-center')
    expect(filterRow).toHaveClass('min-w-0')
    expect(screen.getByLabelText('Search').parentElement).toHaveClass('min-w-0')
  })

  it('tightens the header row gap on mobile (gap-2) and restores it at sm (sm:gap-4) so the filter row fits', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/browse' })
    const headerRow = screen.getByRole('banner').querySelector('div')
    expect(headerRow).toHaveClass('gap-2')
    expect(headerRow).toHaveClass('sm:gap-4')
    // The pre-fix value was a flat `gap-4` with no responsive step.
    expect(headerRow.className.split(/\s+/)).not.toContain('gap-4')
    expect(headerRow).toHaveClass('flex', 'items-center', 'justify-between', 'h-16')
  })

  it('applies the same responsive header gap on pages without the filter row', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/register' })
    const headerRow = screen.getByRole('banner').querySelector('div')
    expect(headerRow).toHaveClass('gap-2')
    expect(headerRow).toHaveClass('sm:gap-4')
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

  it('clears the assemblySlug param when the select is reset to "All Assemblies"', async () => {
    const { replace } = renderWithBase('/yellowpages', {
      pathname: '/yellowpages/browse',
      query: 'assemblySlug=lagos',
      assemblies: [{ slug: 'lagos', name: 'Lagos' }],
    })

    await waitFor(() => expect(screen.getByLabelText('Assembly')).toHaveValue('lagos'))
    fireEvent.change(screen.getByLabelText('Assembly'), { target: { value: '' } })

    const url = replace.mock.calls[replace.mock.calls.length - 1][0]
    expect(url).not.toContain('assemblySlug')
  })

  it('clears the q param instead of setting an empty string when search is emptied', async () => {
    const { replace } = renderWithBase('/yellowpages', {
      pathname: '/yellowpages/browse',
      query: 'q=plumber',
    })

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: '' } })

    await waitFor(() => expect(replace).toHaveBeenCalled(), { timeout: 2000 })
    const url = replace.mock.calls[0][0]
    expect(url).not.toContain('q=')
  })

  it('does not call replace when the debounce fires but the query has not actually changed', async () => {
    const { replace } = renderWithBase('/yellowpages', {
      pathname: '/yellowpages/browse',
      query: 'q=plumber',
    })

    // Input already reflects the URL's q param; no edit was made, so after the debounce
    // window elapses there should be nothing new to push.
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(replace).not.toHaveBeenCalled()
  })

  it('trims whitespace-only search input down to a deleted q param', async () => {
    const { replace } = renderWithBase('/yellowpages', { pathname: '/yellowpages/browse' })

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: '   ' } })

    await waitFor(() => expect(replace).toHaveBeenCalled(), { timeout: 2000 })
    const url = replace.mock.calls[0][0]
    expect(url).not.toContain('q=')
  })

  it('seeds the search input from the initial q URL param', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/browse', query: 'q=plumber' })
    expect(screen.getByLabelText('Search')).toHaveValue('plumber')
  })

  it('seeds the assembly select from the initial assemblySlug URL param', async () => {
    renderWithBase('/yellowpages', {
      pathname: '/yellowpages/browse',
      query: 'assemblySlug=lagos',
      assemblies: [{ slug: 'lagos', name: 'Lagos' }],
    })
    await waitFor(() => expect(screen.getByLabelText('Assembly')).toHaveValue('lagos'))
  })

  it('fetches assemblies once on the browse page and populates the select', async () => {
    renderWithBase('/yellowpages', {
      pathname: '/yellowpages/browse',
      assemblies: [{ slug: 'lagos', name: 'Lagos' }, { slug: 'abuja', name: 'Abuja' }],
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/assemblies')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Lagos' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Abuja' })).toBeInTheDocument()
    })
  })

  it('does not fetch assemblies at all on a page without filters', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/register' })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('falls back to an empty assembly list when the assemblies request rejects', async () => {
    usePathname.mockReturnValue('/yellowpages/browse')
    useRouter.mockReturnValue({ replace: vi.fn() })
    useSearchParams.mockReturnValue(new URLSearchParams(''))
    global.fetch = vi.fn(() => Promise.reject(new Error('network down')))

    render(
      <YellowPagesChrome base="/yellowpages">
        <div />
      </YellowPagesChrome>
    )

    // Select should render with just the default option and not blow up the component tree.
    await waitFor(() => {
      const select = screen.getByLabelText('Assembly')
      expect(within(select).getAllByRole('option')).toHaveLength(1)
    })
  })

  it('falls back to an empty assembly list when the API returns a non-array payload', async () => {
    usePathname.mockReturnValue('/yellowpages/browse')
    useRouter.mockReturnValue({ replace: vi.fn() })
    useSearchParams.mockReturnValue(new URLSearchParams(''))
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ error: 'oops' }) }))

    render(
      <YellowPagesChrome base="/yellowpages">
        <div />
      </YellowPagesChrome>
    )

    await waitFor(() => {
      const select = screen.getByLabelText('Assembly')
      expect(within(select).getAllByRole('option')).toHaveLength(1)
    })
  })

  it('highlights the active tab and leaves inactive tabs transparent', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/manage' })
    expect(screen.getByLabelText('Manage my listing')).toHaveStyle({ background: 'var(--yp-yellow-100)' })
    expect(screen.getByLabelText('Home feed')).toHaveStyle({ background: 'transparent' })
  })

  it('treats a nested path under a tab as active for that tab', () => {
    renderWithBase('/yellowpages', { pathname: '/yellowpages/manage/edit/42' })
    expect(screen.getByLabelText('Manage my listing')).toHaveStyle({ background: 'var(--yp-yellow-100)' })
  })

  it('prefixes every tab href with an empty base unchanged (subdomain mode)', () => {
    renderWithBase('', { pathname: '/browse' })
    expect(screen.getByLabelText('Home feed')).toHaveAttribute('href', '/browse')
    expect(screen.getByLabelText('List your skill or business')).toHaveAttribute('href', '/register')
    expect(screen.getByLabelText('Manage my listing')).toHaveAttribute('href', '/manage')
  })

  it('resyncs local q and assemblySlug state when the URL search params change externally', async () => {
    usePathname.mockReturnValue('/yellowpages/browse')
    useRouter.mockReturnValue({ replace: vi.fn() })
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }))

    let params = new URLSearchParams('q=plumber&assemblySlug=lagos')
    useSearchParams.mockImplementation(() => params)

    const { rerender } = render(
      <YellowPagesChrome base="/yellowpages">
        <div />
      </YellowPagesChrome>
    )

    expect(screen.getByLabelText('Search')).toHaveValue('plumber')

    // Simulate an external navigation (e.g. a category chip) that resets the query string.
    params = new URLSearchParams('')
    rerender(
      <YellowPagesChrome base="/yellowpages">
        <div />
      </YellowPagesChrome>
    )

    await waitFor(() => expect(screen.getByLabelText('Search')).toHaveValue(''))
  })
})
