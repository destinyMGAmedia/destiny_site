import { render, screen } from '@testing-library/react'
import ProjectsPage, { metadata } from './page'

vi.mock('@/components/nation/projects/LegacyProjectsCatalogue', () => ({
  default: () => <div data-testid="legacy-projects-catalogue" />,
}))

describe('ProjectsPage', () => {
  it('renders the LegacyProjectsCatalogue component', () => {
    render(<ProjectsPage />)
    expect(screen.getByTestId('legacy-projects-catalogue')).toBeInTheDocument()
  })

  it('exports the expected page metadata', () => {
    expect(metadata).toEqual({ title: 'Legacy Projects — Destiny Nation' })
  })
})
