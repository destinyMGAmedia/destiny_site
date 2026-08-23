import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import CategoryGrid from './CategoryGrid'
import YellowPagesChrome from './shared/YellowPagesChrome'
import { CATEGORIES } from '@/lib/yellowpages/constants'

vi.mock('next/navigation', () => ({ usePathname: vi.fn(() => '/') }))

describe('CategoryGrid', () => {
  it('renders a link for every category, prefixed with the base', () => {
    render(
      <YellowPagesChrome base="/yellowpages">
        <CategoryGrid />
      </YellowPagesChrome>
    )
    for (const cat of CATEGORIES) {
      expect(screen.getByText(cat.label)).toHaveAttribute('href', `/yellowpages/category/${cat.value}`)
    }
  })
})
