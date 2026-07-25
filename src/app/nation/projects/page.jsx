import LegacyProjectsCatalogue from '@/components/nation/projects/LegacyProjectsCatalogue'
import PageHero from '@/components/nation/shared/PageHero'

export const metadata = { title: 'Legacy Projects — Destiny Nation' }

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        imageKey="legacyProjects"
        eyebrow="Layer 4 · Legacy Projects"
        title="Every Gate Owns a Legacy Project"
        subtitle="A gate without a project is just a title. Every project must solve a real problem, outlive the 30th anniversary, produce measurable impact, and create future leaders."
      />
      <LegacyProjectsCatalogue />
    </>
  )
}
