'use client'
import ImageUploadField from '../ImageUploadField'
import PortfolioImagesField from './PortfolioImagesField'
import RepeatableList from './RepeatableList'
import LinkedProfilePicker from './LinkedProfilePicker'
import { TextField, TextArea } from './Field'
import { MAX_PROJECTS, MAX_TEAM } from '@/lib/yellowpages/constants'

const emptyProject = () => ({ name: '', role: '', url: '', description: '', imageUrls: [] })
const emptyTeamMember = () => ({ name: '', role: '', photoUrl: '', linkedListingId: '' })

/**
 * Business / organization listing fields. Anchors (yp-*) match src/lib/yellowpages/portfolio.js
 * so the detail page "add this" prompts can deep-link here.
 */
export default function BusinessFields({ form, setField, setForm, errors = {} }) {
  return (
    <div className="space-y-6">
      <div id="yp-photo-section" className="grid sm:grid-cols-2 gap-4">
        <ImageUploadField label="Business Logo" type="logo" value={form.logoUrl} onChange={setField('logoUrl')} />
        <ImageUploadField label="Portfolio Banner (optional)" type="banner" value={form.bannerImageUrl} onChange={setField('bannerImageUrl')} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <TextField id="yp-contactPersonName" label="Contact Person" value={form.contactPersonName} onChange={setField('contactPersonName')} error={errors.contactPersonName} />
        <TextField id="yp-position" label="Position / Designation" placeholder="e.g. Founder, CEO, Manager" value={form.position} onChange={setField('position')} />
      </div>

      <TextArea
        id="yp-servicesOffered"
        label="Products / Services"
        rows={3}
        placeholder="The main products or services this business offers."
        value={form.servicesOffered}
        onChange={setField('servicesOffered')}
        error={errors.servicesOffered}
      />

      <RepeatableList
        id="yp-projects"
        title="Projects / Case Studies"
        items={form.projects || []}
        onChange={setField('projects')}
        makeEmpty={emptyProject}
        addLabel="Add project"
        max={MAX_PROJECTS}
      >
        {({ item, index, update }) => (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField id={`prj-name-${index}`} label="Project name" value={item.name} onChange={(v) => update({ name: v })} />
              <TextField id={`prj-role-${index}`} label="Role / client" value={item.role} onChange={(v) => update({ role: v })} />
            </div>
            <TextField id={`prj-url-${index}`} label="Link (optional)" placeholder="https://…" value={item.url} onChange={(v) => update({ url: v })} />
            <TextArea id={`prj-desc-${index}`} label="Description" rows={3} value={item.description} onChange={(v) => update({ description: v })} />
          </div>
        )}
      </RepeatableList>

      <RepeatableList
        id="yp-team"
        title="Team"
        hint="Add key people. You can link a team member to their existing personal listing."
        items={form.team || []}
        onChange={setField('team')}
        makeEmpty={emptyTeamMember}
        addLabel="Add team member"
        max={MAX_TEAM}
      >
        {({ item, index, update }) => (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField id={`team-name-${index}`} label="Name" value={item.name} onChange={(v) => update({ name: v })} />
              <TextField id={`team-role-${index}`} label="Role" value={item.role} onChange={(v) => update({ role: v })} />
            </div>
            <ImageUploadField label="Photo (optional)" type="photo" value={item.photoUrl} onChange={(v) => update({ photoUrl: v })} />
            <LinkedProfilePicker
              linkedListingId={item.linkedListingId}
              linkedName={item.linkedName}
              onChange={({ linkedListingId, linkedName }) => update({ linkedListingId, linkedName })}
            />
          </div>
        )}
      </RepeatableList>

      <div id="yp-portfolio-section">
        <PortfolioImagesField
          label="Portfolio / Gallery"
          images={form.portfolioImages || []}
          onChange={(updater) => setForm((f) => ({ ...f, portfolioImages: updater(f.portfolioImages || []) }))}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <TextField id="yp-yearsInOperation" label="Years in Operation" type="number" value={form.yearsInOperation} onChange={setField('yearsInOperation')} error={errors.yearsInOperation} />
        <TextField id="yp-licenseNumber" label="Registration / License Number" value={form.licenseNumber} onChange={setField('licenseNumber')} />
      </div>

      <TextField
        id="yp-certifications"
        label="Certifications / Memberships (optional)"
        placeholder="e.g. IATA, NANTA, CAC"
        value={form.certifications}
        onChange={setField('certifications')}
      />
    </div>
  )
}
