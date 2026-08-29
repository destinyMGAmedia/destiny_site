import { render, screen, fireEvent } from '@testing-library/react'
import GateDetail from './GateDetail'
import { GATEKEEPER_ROLES, getLegacyProjectForGate } from '@/lib/nation/gates'

describe('GateDetail', () => {
  it('renders the gate name and group name', () => {
    render(
      <GateDetail
        gate="Governance & Public Policy"
        groupName="Governance & Public Leadership"
        project={null}
        layer="INFLUENCE"
        onClose={() => {}}
      />
    )
    expect(screen.getByText('Governance & Public Policy')).toBeInTheDocument()
    expect(screen.getByText('Governance & Public Leadership')).toBeInTheDocument()
  })

  it('renders every GATEKEEPER_ROLES role and description', () => {
    render(
      <GateDetail
        gate="Prayer"
        groupName="Spiritual Formation"
        project={null}
        layer="INTERNAL"
        onClose={() => {}}
      />
    )
    GATEKEEPER_ROLES.forEach((r) => {
      expect(screen.getByText(r.role)).toBeInTheDocument()
      expect(screen.getByText(r.description)).toBeInTheDocument()
    })
  })

  it('renders the Legacy Project section for a gate that has one', () => {
    const project = getLegacyProjectForGate('INFLUENCE', 'Governance & Public Policy')
    render(
      <GateDetail
        gate="Governance & Public Policy"
        groupName="Governance & Public Leadership"
        project={project}
        layer="INFLUENCE"
        onClose={() => {}}
      />
    )
    expect(screen.getByText('Legacy Project')).toBeInTheDocument()
    expect(screen.getByText('Faith & Public Leadership Forum')).toBeInTheDocument()
    expect(screen.getByText('Prepare believers for public service')).toBeInTheDocument()
  })

  it('omits the Legacy Project section for a gate without one', () => {
    render(
      <GateDetail
        gate="Prayer"
        groupName="Spiritual Formation"
        project={null}
        layer="INTERNAL"
        onClose={() => {}}
      />
    )
    expect(screen.queryByText('Legacy Project')).not.toBeInTheDocument()
  })

  it('renders the "Get Involved" link for INFLUENCE layer gates, pointing at the partner page', () => {
    render(
      <GateDetail
        gate="Healthcare & Medicine"
        groupName="Human Development"
        project={null}
        layer="INFLUENCE"
        onClose={() => {}}
      />
    )
    const link = screen.getByText('Get Involved with this Gate')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/nation/partner')
  })

  it('does not render the "Get Involved" link for INTERNAL layer gates', () => {
    render(
      <GateDetail
        gate="Youth"
        groupName="Family"
        project={null}
        layer="INTERNAL"
        onClose={() => {}}
      />
    )
    expect(screen.queryByText('Get Involved with this Gate')).not.toBeInTheDocument()
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(
      <GateDetail
        gate="Youth"
        groupName="Family"
        project={null}
        layer="INTERNAL"
        onClose={onClose}
      />
    )
    fireEvent.click(container.firstChild)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the close button is clicked, but not when the inner panel is clicked', () => {
    const onClose = vi.fn()
    render(
      <GateDetail
        gate="Youth"
        groupName="Family"
        project={null}
        layer="INTERNAL"
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getByText('Youth'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
