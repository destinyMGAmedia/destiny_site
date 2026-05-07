'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle, Circle, FileText, Video, FileDown, ChevronRight, AlertCircle, ArrowLeft, BookOpen } from 'lucide-react'

const SLUG_TO_LEVEL = {
  foundational_class: 'FOUNDATIONAL_CLASS',
  destiny_culture: 'DESTINY_CULTURE',
  ministry_class: 'MINISTRY_CLASS',
  leadership_class: 'LEADERSHIP_CLASS',
  pastoral_class: 'PASTORAL_CLASS',
  advanced_leadership_2: 'ADVANCED_LEADERSHIP_2',
  advanced_leadership_3: 'ADVANCED_LEADERSHIP_3',
}

function extractYouTubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export default function StagePage() {
  const router = useRouter()
  const { stage: stageSlug } = useParams()
  const level = SLUG_TO_LEVEL[stageSlug]

  const [memberId, setMemberId] = useState(null)
  const [stageData, setStageData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [completedIds, setCompletedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState(null)
  const [error, setError] = useState('')
  const enrolled = useRef(false)

  useEffect(() => {
    if (!level) { router.replace('/growth-track'); return }

    const stored = sessionStorage.getItem('gt_memberId')
    if (!stored) { router.replace('/growth-track'); return }
    setMemberId(stored)
    loadStage(stored)
  }, [stageSlug])

  const loadStage = async (mId) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/growth-track/stages?memberId=${mId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()

      const found = data.stages.find(s => s.level === level)
      if (!found) { router.replace('/growth-track'); return }
      if (found.isLocked) { router.replace('/growth-track'); return }

      setStageData(found)
      const prog = found.memberProgress
      const ids = Array.isArray(prog?.completedContents) ? prog.completedContents : []
      setProgress(prog)
      setCompletedIds(ids)

      // Auto-enroll on first visit
      if (!prog && !enrolled.current) {
        enrolled.current = true
        await fetch('/api/member-progress/lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: mId, stageId: found.id, action: 'enroll' })
        })
      }
    } catch {
      setError('Failed to load training content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = async (contentId) => {
    if (completedIds.includes(contentId) || markingId) return
    setMarkingId(contentId)
    try {
      const res = await fetch('/api/member-progress/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, stageId: stageData.id, contentId })
      })
      if (res.ok) {
        setCompletedIds(prev => [...prev, contentId])
      }
    } catch {
      // silently fail; user can retry
    } finally {
      setMarkingId(null)
    }
  }

  const allComplete = stageData && completedIds.length >= stageData.contents.length && stageData.contents.length > 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ivory)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: 'var(--purple-600)' }} />
      </div>
    )
  }

  if (error || !stageData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <div className="card p-8 max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={40} />
          <p className="text-gray-600">{error || 'Stage not found.'}</p>
          <button onClick={() => router.push('/growth-track')} className="btn-primary mt-6 justify-center">
            Back to Growth Track
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--ivory)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/growth-track')}
            className="p-2 rounded-lg hover:bg-white transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
              {stageData.title}
            </h1>
            {stageData.description && <p className="text-sm text-gray-500 mt-0.5">{stageData.description}</p>}
          </div>
        </div>

        {/* Progress bar */}
        {stageData.contents.length > 0 && (
          <div className="card p-4 mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Lesson Progress</span>
              <span>{completedIds.length} / {stageData.contents.length} complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{
                background: 'var(--purple-600)',
                width: `${(completedIds.length / stageData.contents.length) * 100}%`
              }} />
            </div>
          </div>
        )}

        {/* Lessons */}
        {stageData.contents.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 mb-6">
            <BookOpen className="mx-auto mb-3 text-gray-300" size={40} />
            <p>No lesson content has been added yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {stageData.contents.map((content, i) => {
              const done = completedIds.includes(content.id)
              const isMarking = markingId === content.id
              return (
                <div key={content.id} className={`card p-6 transition-all ${done ? 'border-green-300 bg-green-50' : ''}`}
                  style={done ? { borderWidth: 1 } : {}}>
                  {/* Content header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100' : 'bg-purple-50'}`}>
                        {content.type === 'VIDEO' && <Video size={16} className={done ? 'text-green-600' : 'text-purple-600'} />}
                        {content.type === 'TEXT' && <FileText size={16} className={done ? 'text-green-600' : 'text-purple-600'} />}
                        {content.type === 'PDF' && <FileDown size={16} className={done ? 'text-green-600' : 'text-purple-600'} />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Lesson {i + 1}: {content.title}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{content.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => !done && handleMarkComplete(content.id)}
                      disabled={done || isMarking}
                      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                        done ? 'bg-green-100 text-green-700 cursor-default' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {done ? <CheckCircle size={14} /> : <Circle size={14} />}
                      {isMarking ? 'Saving...' : done ? 'Done' : 'Mark Complete'}
                    </button>
                  </div>

                  {/* Content body */}
                  {content.type === 'VIDEO' && content.url && (
                    <div className="rounded-xl overflow-hidden aspect-video">
                      {extractYouTubeId(content.url) ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYouTubeId(content.url)}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video src={content.url} controls className="w-full h-full" />
                      )}
                    </div>
                  )}

                  {content.type === 'TEXT' && content.body && (
                    <div className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: content.body }} />
                  )}

                  {content.type === 'PDF' && content.url && (
                    <div>
                      <a href={content.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium mb-3">
                        <FileDown size={16} /> Download PDF
                      </a>
                      <embed src={content.url} type="application/pdf" className="w-full rounded-lg" style={{ height: '400px' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Assessment CTA */}
        {allComplete && (
          <div className="card p-6 border-2 text-center" style={{ borderColor: 'var(--gold-500)' }}>
            <CheckCircle className="mx-auto mb-3" size={36} style={{ color: 'var(--gold-500)' }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--purple-900)' }}>All Lessons Complete!</h3>
            <p className="text-sm text-gray-500 mb-4">You've finished all lessons for this level. Take the assessment to complete this stage.</p>
            <button
              onClick={() => router.push(`/growth-track/${stageSlug}/assessment`)}
              className="btn-primary justify-center inline-flex items-center gap-2"
            >
              Take Assessment <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Already completed notice */}
        {progress?.status === 'COMPLETED' && (
          <div className="card p-6 border-2 border-green-300 bg-green-50 text-center">
            <CheckCircle className="mx-auto mb-3 text-green-600" size={36} />
            <h3 className="font-bold text-lg mb-1 text-green-800">Stage Completed</h3>
            {progress.testScore != null && (
              <p className="text-sm text-green-700">Your score: {progress.testScore}%</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
