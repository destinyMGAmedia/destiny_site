import { render, screen } from '@testing-library/react'
import ProjectCard from './ProjectCard'
import { LEGACY_PROJECT_TESTS, LEGACY_PROJECTS, getGroupName } from '@/lib/nation/gates'

describe('ProjectCard', () => {
  it('renders the gate, group, project name, and outcome for an INTERNAL-layer item', () => {
    const item = LEGACY_PROJECTS.find((p) => p.layer === 'INTERNAL')
    render(<ProjectCard item={item} />)

    const groupName = getGroupName(item.layer, item.groupKey)
    expect(screen.getByText(`${item.gate} Gate · ${groupName}`)).toBeInTheDocument()
    expect(screen.getByText(item.project)).toBeInTheDocument()
    expect(screen.getByText(item.outcome)).toBeInTheDocument()
  })

  it('renders the gate, group, project name, and outcome for an INFLUENCE-layer item', () => {
    const item = LEGACY_PROJECTS.find((p) => p.layer === 'INFLUENCE')
    render(<ProjectCard item={item} />)

    const groupName = getGroupName(item.layer, item.groupKey)
    expect(screen.getByText(`${item.gate} Gate · ${groupName}`)).toBeInTheDocument()
    expect(screen.getByText(item.project)).toBeInTheDocument()
    expect(screen.getByText(item.outcome)).toBeInTheDocument()
  })

  it('lists all four Legacy Project tests as passed, for any item', () => {
    render(<ProjectCard item={LEGACY_PROJECTS[0]} />)
    LEGACY_PROJECT_TESTS.forEach((test) => {
      expect(screen.getByText(`✓ ${test}`)).toBeInTheDocument()
    })
  })
})
