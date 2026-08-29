import { render, screen } from '@testing-library/react'
import LegacyProjectsCatalogue from './LegacyProjectsCatalogue'
import { LEGACY_PROJECT_TESTS, LEGACY_PROJECTS, getGroupName } from '@/lib/nation/gates'

describe('LegacyProjectsCatalogue', () => {
  it('renders the 4-test framework label and the named examples heading', () => {
    render(<LegacyProjectsCatalogue />)
    expect(screen.getByText('The 4-Test Framework')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Named Examples' })).toBeInTheDocument()
  })

  it('lists all four Legacy Project tests', () => {
    render(<LegacyProjectsCatalogue />)
    LEGACY_PROJECT_TESTS.forEach((test) => {
      expect(screen.getByText(test)).toBeInTheDocument()
    })
  })

  it('renders one project card per entry in LEGACY_PROJECTS', () => {
    render(<LegacyProjectsCatalogue />)
    LEGACY_PROJECTS.forEach((item) => {
      const groupName = getGroupName(item.layer, item.groupKey)
      expect(screen.getByText(`${item.gate} Gate · ${groupName}`)).toBeInTheDocument()
      expect(screen.getByText(item.project)).toBeInTheDocument()
      expect(screen.getByText(item.outcome)).toBeInTheDocument()
    })
  })
})
