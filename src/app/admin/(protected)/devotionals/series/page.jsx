import SeriesForm from './SeriesForm'

export const metadata = {
  title: 'Schedule Devotional Series — DMGA Admin',
}

export default function SeriesDevotionalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Schedule Devotional Series
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Bulk upload devotionals for a set period of time</p>
      </div>

      <SeriesForm />
    </div>
  )
}
