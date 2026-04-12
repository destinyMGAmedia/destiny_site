'use client'
import { useState, useEffect, use } from 'react'
import DevotionalForm from '../../DevotionalForm'

export default function EditDevotionalPage({ params }) {
  const { id } = use(params)
  const [devotional, setDevotional] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/devotionals/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setDevotional(null)
        } else {
          setDevotional(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Devotional...</div>
  if (!devotional) return <div className="p-10 text-center text-red-500 font-bold">Devotional not found</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Edit Devotional
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Update the scheduled message for {new Date(devotional.scheduledDate).toLocaleDateString()}</p>
      </div>

      <DevotionalForm initialData={devotional} mode="edit" />
    </div>
  )
}
