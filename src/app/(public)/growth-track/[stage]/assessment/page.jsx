'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Send } from 'lucide-react'

const SLUG_TO_LEVEL = {
  foundational_class: 'FOUNDATIONAL_CLASS',
  destiny_culture: 'DESTINY_CULTURE',
  ministry_class: 'MINISTRY_CLASS',
  leadership_class: 'LEADERSHIP_CLASS',
  pastoral_class: 'PASTORAL_CLASS',
  advanced_leadership_2: 'ADVANCED_LEADERSHIP_2',
  advanced_leadership_3: 'ADVANCED_LEADERSHIP_3',
}

export default function AssessmentPage() {
  const router = useRouter()
  const { stage: stageSlug } = useParams()
  const level = SLUG_TO_LEVEL[stageSlug]

  const [memberId, setMemberId] = useState(null)
  const [stageData, setStageData] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({}) // { questionId: answer }
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null) // { passed, score, total }
  const [error, setError] = useState('')
  const [alreadyPassed, setAlreadyPassed] = useState(false)
  const [passedData, setPassedData] = useState(null)

  useEffect(() => {
    if (!level) { router.replace('/growth-track'); return }
    const stored = sessionStorage.getItem('gt_memberId')
    if (!stored) { router.replace('/growth-track'); return }
    setMemberId(stored)
    loadData(stored)
  }, [stageSlug])

  const loadData = async (mId) => {
    setLoading(true)
    setError('')
    try {
      const stagesRes = await fetch(`/api/growth-track/stages?memberId=${mId}`)
      if (!stagesRes.ok) throw new Error()
      const stagesData = await stagesRes.json()

      const found = stagesData.stages.find(s => s.level === level)
      if (!found || found.isLocked) { router.replace('/growth-track'); return }

      // Guard: all lessons must be complete
      const prog = found.memberProgress
      const completedCount = Array.isArray(prog?.completedContents) ? prog.completedContents.length : 0
      if (found.contents.length > 0 && completedCount < found.contents.length) {
        router.replace(`/growth-track/${stageSlug}`)
        return
      }

      // Already passed
      if (prog?.status === 'COMPLETED') {
        setAlreadyPassed(true)
        setPassedData({ score: prog.testScore, completedAt: prog.completedAt })
        setLoading(false)
        return
      }

      setStageData(found)

      // Fetch questions
      const qRes = await fetch(`/api/growth-track/questions?stageId=${found.id}`)
      if (qRes.ok) {
        const qData = await qRes.json()
        setQuestions(qData.questions || [])
      }
    } catch {
      setError('Failed to load assessment. Please go back and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stageData) return

    // Check all MC questions answered
    const mcQuestions = questions.filter(q => q.type === 'MULTIPLE_CHOICE')
    const unanswered = mcQuestions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      setError(`Please answer all ${unanswered.length} remaining question${unanswered.length > 1 ? 's' : ''}.`)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/member-progress/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          stageId: stageData.id,
          answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }))
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setAnswers({})
    setError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ivory)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: 'var(--purple-600)' }} />
      </div>
    )
  }

  if (error && !stageData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <div className="card p-8 max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={40} />
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.push(`/growth-track/${stageSlug}`)} className="btn-primary justify-center">
            Back to Lessons
          </button>
        </div>
      </div>
    )
  }

  // Already passed — read-only results
  if (alreadyPassed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <div className="card p-10 max-w-md w-full text-center">
          <CheckCircle className="mx-auto mb-4" size={48} style={{ color: 'var(--gold-500)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Stage Completed
          </h2>
          {passedData?.score != null && (
            <p className="text-lg font-semibold text-green-600 mb-1">Score: {passedData.score}%</p>
          )}
          {passedData?.completedAt && (
            <p className="text-sm text-gray-400 mb-6">Completed {new Date(passedData.completedAt).toLocaleDateString()}</p>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Your coordinator will be notified to activate your next training level when ready.
          </p>
          <button onClick={() => router.push('/growth-track')} className="btn-primary w-full justify-center">
            Back to Growth Track
          </button>
        </div>
      </div>
    )
  }

  // Result screen after submission
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <div className="card p-10 max-w-md w-full text-center">
          {result.passed ? (
            <>
              <CheckCircle className="mx-auto mb-4" size={56} style={{ color: 'var(--gold-500)' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
                Congratulations!
              </h2>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--purple-600)' }}>{result.score}%</p>
              <p className="text-sm text-gray-500 mb-6">
                {result.total > 0
                  ? `You answered ${Math.round((result.score / 100) * result.total)} of ${result.total} questions correctly.`
                  : 'Your answers have been submitted for review.'}
                <br />Your coordinator will activate your next training level when ready.
              </p>
              <button onClick={() => router.push('/growth-track')} className="btn-primary w-full justify-center">
                Back to Growth Track
              </button>
            </>
          ) : (
            <>
              <XCircle className="mx-auto mb-4 text-red-400" size={56} />
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
                Keep Going!
              </h2>
              <p className="text-3xl font-bold mb-1 text-red-500">{result.score}%</p>
              <p className="text-sm text-gray-500 mb-6">
                The pass mark is 70%. Review the lessons and try again — you can do it!
              </p>
              <div className="space-y-3">
                <button onClick={handleRetry} className="btn-primary w-full justify-center">
                  Retry Assessment
                </button>
                <button onClick={() => router.push(`/growth-track/${stageSlug}`)} className="btn-outline w-full justify-center">
                  Review Lessons
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Assessment form
  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--ivory)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push(`/growth-track/${stageSlug}`)}
            className="p-2 rounded-lg hover:bg-white transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
              {stageData?.title} — Assessment
            </h1>
            <p className="text-sm text-gray-500">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            <p>No assessment questions have been added yet.</p>
            <button onClick={() => router.push('/growth-track')} className="btn-primary mt-6 justify-center">
              Back to Growth Track
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, i) => (
              <div key={q.id} className="card p-6">
                <p className="font-semibold text-gray-900 mb-4">
                  <span className="text-purple-600 mr-2">{i + 1}.</span>{q.question}
                </p>

                {q.type === 'MULTIPLE_CHOICE' && Array.isArray(q.options) && (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const optValue = typeof opt === 'object' ? opt.value || opt.text : opt
                      const optLabel = typeof opt === 'object' ? opt.label || opt.text || opt.value : opt
                      const selected = answers[q.id] === optValue
                      return (
                        <label key={oi}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                            selected ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                          }`}>
                          <input type="radio" name={q.id} value={optValue}
                            checked={selected}
                            onChange={() => handleAnswer(q.id, optValue)}
                            className="accent-purple-600" />
                          <span className="text-sm text-gray-700">{optLabel}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {q.type === 'TEXT_SUMMARY' && (
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Write your answer here..."
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswer(q.id, e.target.value)}
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? 'Submitting...' : <><Send size={16} className="mr-2" /> Submit Assessment</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
