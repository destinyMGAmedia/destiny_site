import DevotionalForm from '../DevotionalForm'

export const metadata = {
  title: 'New Devotional — DMGA Admin',
}

export default function NewDevotionalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Create New Devotional
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Prepare a new message for the Royal Feed</p>
      </div>

      <DevotionalForm mode="create" />
    </div>
  )
}
