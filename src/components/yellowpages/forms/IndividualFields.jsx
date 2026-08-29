'use client'
import ImageUploadField from '../ImageUploadField'
import PortfolioImagesField from './PortfolioImagesField'
import TagInput from './TagInput'
import RepeatableList from './RepeatableList'
import { TextField, TextArea } from './Field'
import { MAX_SKILLS, MAX_LANGUAGES, MAX_EXPERIENCE, MAX_EDUCATION, MAX_PROJECTS } from '@/lib/yellowpages/constants'

const emptyExperience = () => ({ title: '', organization: '', location: '', startDate: '', endDate: '', current: false, description: '' })
const emptyEducation = () => ({ school: '', degree: '', field: '', startYear: '', endYear: '', description: '' })
const emptyProject = () => ({ name: '', role: '', url: '', description: '', imageUrls: [] })

/**
 * Individual / professional listing fields — the portfolio + e-résumé side. Anchors (yp-*) match
 * src/lib/yellowpages/portfolio.js so the detail page "add this" prompts can deep-link here.
 */
export default function IndividualFields({ form, setField, setForm, errors = {} }) {
  return (
    <div className="space-y-6">
      <div id="yp-photo-section" className="grid sm:grid-cols-2 gap-4">
        <ImageUploadField label="Profile Photo" type="photo" value={form.photoUrl} onChange={setField('photoUrl')} />
        <ImageUploadField label="Portfolio Banner (optional)" type="banner" value={form.bannerImageUrl} onChange={setField('bannerImageUrl')} />
      </div>

      <TextField
        id="yp-headline"
        label="Professional Headline"
        placeholder="e.g. Full-stack Developer building fintech products"
        hint="One line — your role and focus. Shows under your name on your portfolio and résumé."
        value={form.headline}
        onChange={setField('headline')}
        error={errors.headline}
      />

      <TagInput
        id="yp-skills"
        label="Skills"
        values={form.skills || []}
        onChange={setField('skills')}
        max={MAX_SKILLS}
        error={errors.skills}
        placeholder="Add a skill and press Enter"
      />

      <RepeatableList
        id="yp-experience"
        title="Work Experience"
        items={form.experience || []}
        onChange={setField('experience')}
        makeEmpty={emptyExperience}
        addLabel="Add experience"
        max={MAX_EXPERIENCE}
      >
        {({ item, index, update }) => (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField id={`exp-title-${index}`} label="Title" value={item.title} onChange={(v) => update({ title: v })} />
              <TextField id={`exp-org-${index}`} label="Organization" value={item.organization} onChange={(v) => update({ organization: v })} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <TextField id={`exp-loc-${index}`} label="Location" value={item.location} onChange={(v) => update({ location: v })} />
              <TextField id={`exp-start-${index}`} label="Start" placeholder="Jan 2021" value={item.startDate} onChange={(v) => update({ startDate: v })} />
              <TextField id={`exp-end-${index}`} label="End" placeholder="Present" value={item.endDate} onChange={(v) => update({ endDate: v })} />
            </div>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
              <input type="checkbox" checked={Boolean(item.current)} onChange={(e) => update({ current: e.target.checked })} />
              I currently work here
            </label>
            <TextArea id={`exp-desc-${index}`} label="What you did" rows={3} value={item.description} onChange={(v) => update({ description: v })} />
          </div>
        )}
      </RepeatableList>

      <RepeatableList
        id="yp-education"
        title="Education"
        items={form.education || []}
        onChange={setField('education')}
        makeEmpty={emptyEducation}
        addLabel="Add education"
        max={MAX_EDUCATION}
      >
        {({ item, index, update }) => (
          <div className="space-y-3">
            <TextField id={`edu-school-${index}`} label="School" value={item.school} onChange={(v) => update({ school: v })} />
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField id={`edu-degree-${index}`} label="Degree" value={item.degree} onChange={(v) => update({ degree: v })} />
              <TextField id={`edu-field-${index}`} label="Field of study" value={item.field} onChange={(v) => update({ field: v })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField id={`edu-start-${index}`} label="Start year" value={item.startYear} onChange={(v) => update({ startYear: v })} />
              <TextField id={`edu-end-${index}`} label="End year" value={item.endYear} onChange={(v) => update({ endYear: v })} />
            </div>
            <TextArea id={`edu-desc-${index}`} label="Notes (optional)" rows={2} value={item.description} onChange={(v) => update({ description: v })} />
          </div>
        )}
      </RepeatableList>

      <RepeatableList
        id="yp-projects"
        title="Projects"
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
              <TextField id={`prj-role-${index}`} label="Your role" value={item.role} onChange={(v) => update({ role: v })} />
            </div>
            <TextField id={`prj-url-${index}`} label="Link (optional)" placeholder="https://…" value={item.url} onChange={(v) => update({ url: v })} />
            <TextArea id={`prj-desc-${index}`} label="Description" rows={3} value={item.description} onChange={(v) => update({ description: v })} />
          </div>
        )}
      </RepeatableList>

      <div id="yp-portfolio-section">
        <PortfolioImagesField
          label="Work Samples"
          images={form.portfolioImages || []}
          onChange={(updater) => setForm((f) => ({ ...f, portfolioImages: updater(f.portfolioImages || []) }))}
        />
      </div>

      <TagInput
        id="yp-languages"
        label="Languages"
        values={form.languages || []}
        onChange={setField('languages')}
        max={MAX_LANGUAGES}
        error={errors.languages}
        placeholder="e.g. English, French"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <TextField
          id="yp-availability"
          label="Availability (optional)"
          placeholder="e.g. Freelance / contract"
          value={form.availability}
          onChange={setField('availability')}
        />
        <label className="flex items-center gap-2 text-sm mt-7" style={{ color: 'var(--yp-ink-soft)' }}>
          <input type="checkbox" checked={Boolean(form.openToWork)} onChange={(e) => setField('openToWork')(e.target.checked)} />
          Show an “Open to work” badge
        </label>
      </div>

      <TextField
        id="yp-certifications"
        label="Certifications / Licenses (optional)"
        placeholder="e.g. AWS Solutions Architect, PMP"
        value={form.certifications}
        onChange={setField('certifications')}
      />
    </div>
  )
}
