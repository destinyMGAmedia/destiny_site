'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle, BookOpen, Play, ChevronRight, Search, AlertCircle, Award } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

const LEVEL_SLUGS = {
  FOUNDATIONAL_CLASS: 'foundational_class',
  DESTINY_CULTURE: 'destiny_culture',
  MINISTRY_CLASS: 'ministry_class',
  LEADERSHIP_CLASS: 'leadership_class',
  PASTORAL_CLASS: 'pastoral_class',
  ADVANCED_LEADERSHIP_2: 'advanced_leadership_2',
  ADVANCED_LEADERSHIP_3: 'advanced_leadership_3',
}

export default function GrowthTrackPage() {
  const router = useRouter()
  const [step, setStep] = useState('IDENTIFY') // IDENTIFY | TRACK
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState('')
  const [memberId, setMemberId] = useState(null)
  const [memberName, setMemberName] = useState('')
  const [stages, setStages] = useState([])
  const [growthLevel, setGrowthLevel] = useState('NEW_COMER')
  const [loading, setLoading] = useState(false)

  // Restore memberId from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('gt_memberId')
    const storedName = sessionStorage.getItem('gt_memberName')
    if (stored) {
      setMemberId(stored)
      setMemberName(storedName || '')
      setStep('TRACK')
      fetchStages(stored)
    }
  }, [])

  const fetchStages = async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/growth-track/stages?memberId=${id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStages(data.stages || [])
      setGrowthLevel(data.memberGrowthLevel || 'NEW_COMER')
    } catch {
      setCheckError('Failed to load your training data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleIdentify = async (e) => {
    e.preventDefault()
    if (!phone && !email) {
      setCheckError('Please enter your phone number or email address.')
      return
    }
    setChecking(true)
    setCheckError('')
    try {
      const res = await fetch('/api/member/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone || undefined, email: email || undefined })
      })
      const data = await res.json()

      if (!data.exists || data.type !== 'MEMBER') {
        setCheckError(
          data.exists
            ? 'You\'re registered as a visitor. Complete member registration first to access the growth track.'
            : 'No member record found. Please register via your assembly page first.'
        )
        return
      }

      sessionStorage.setItem('gt_memberId', data.data.id)
      sessionStorage.setItem('gt_memberName', data.data.name)
      setMemberId(data.data.id)
      setMemberName(data.data.name)
      setStep('TRACK')
      fetchStages(data.data.id)
    } catch {
      setCheckError('Could not verify your details. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  const handleSignOut = () => {
    sessionStorage.removeItem('gt_memberId')
    sessionStorage.removeItem('gt_memberName')
    setMemberId(null)
    setMemberName('')
    setStages([])
    setStep('IDENTIFY')
    setPhone('')
    setEmail('')
    setCheckError('')
  }

  if (step === 'IDENTIFY') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
        <BackButton className="fixed top-8 left-8 z-50" variant="outline" />
        <div className="card p-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--purple-100)' }}>
              <BookOpen size={30} style={{ color: 'var(--purple-700)' }} />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
              Growth Track
            </h1>
            <p className="text-gray-500 text-sm">Enter your contact details to access your training portal.</p>
          </div>
          <form onSubmit={handleIdentify} className="space-y-4">
            <div>
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" placeholder="e.g. 08012345678"
                value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="e.g. john@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {checkError && (
              <div className="flex items-start gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> {checkError}
              </div>
            )}
            <button type="submit" disabled={checking} className="btn-primary w-full justify-center">
              {checking ? 'Verifying...' : 'Access My Growth Track'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Not registered yet? <a href="/headquarters/join" className="text-purple-600 hover:underline">Register here</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--ivory)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
              Growth Track
            </h1>
            {memberName && <p className="text-gray-500 text-sm mt-1">Welcome, {memberName}</p>}
          </div>
          <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            Sign out
          </button>
        </div>

        {/* NEW_COMER state */}
        {growthLevel === 'NEW_COMER' && (
          <div className="card p-6 mb-6 border-l-4" style={{ borderLeftColor: 'var(--gold-500)' }}>
            <p className="font-semibold text-gray-800 mb-1">Training Not Yet Assigned</p>
            <p className="text-sm text-gray-500">
              Your coordinator will assign your first training level when ready. Check back soon.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: 'var(--purple-600)' }} />
          </div>
        ) : (
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <StageCard
                key={stage.id}
                stage={stage}
                index={index}
                onNavigate={() => router.push(`/growth-track/${LEVEL_SLUGS[stage.level]}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StageCard({ stage, index, onNavigate }) {
  const { isLocked, isActive, isCompleted, isPendingStart, contents, memberProgress, questionsCount } = stage
  const completedCount = Array.isArray(memberProgress?.completedContents) ? memberProgress.completedContents.length : 0
  const totalCount = contents.length

  let borderStyle = {}
  let bgStyle = {}

  if (isCompleted) {
    borderStyle = { borderColor: '#16a34a' }
    bgStyle = {}
  } else if (isPendingStart) {
    borderStyle = { borderColor: 'var(--gold-500)' }
    bgStyle = {}
  } else if (isActive) {
    borderStyle = { borderColor: 'var(--purple-500)' }
    bgStyle = {}
  }

  return (
    <div
      className={`card p-6 transition-all ${isLocked ? 'opacity-50' : ''}`}
      style={!isLocked ? { borderWidth: 2, ...borderStyle } : {}}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Level number */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
            isCompleted ? 'bg-green-100 text-green-700' :
            isActive ? 'text-white' : 'bg-gray-100 text-gray-500'
          }`} style={isActive && !isCompleted ? { background: 'var(--purple-600)' } : {}}>
            {isCompleted ? <CheckCircle size={20} /> : isLocked ? <Lock size={16} /> : index + 1}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900">{stage.title}</h3>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  <Award size={11} /> Completed
                </span>
              )}
            </div>
            {stage.description && (
              <p className="text-sm text-gray-500 mt-1">{stage.description}</p>
            )}

            {isCompleted && memberProgress?.testScore != null && (
              <p className="text-xs text-green-600 mt-1">
                Score: {memberProgress.testScore}% &bull; {new Date(memberProgress.completedAt).toLocaleDateString()}
              </p>
            )}

            {isActive && !isCompleted && !isPendingStart && totalCount > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{completedCount} / {totalCount} lessons</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{
                    background: 'var(--purple-600)',
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`
                  }} />
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-2">
              {totalCount} lesson{totalCount !== 1 ? 's' : ''} &bull; {questionsCount} assessment question{questionsCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {!isLocked && (
          <div className="flex-shrink-0">
            {isPendingStart ? (
              <button onClick={onNavigate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                style={{ background: 'var(--gold-500)' }}>
                <Play size={14} /> Begin Training
              </button>
            ) : isActive && !isCompleted ? (
              <button onClick={onNavigate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                style={{ background: 'var(--purple-600)' }}>
                Continue <ChevronRight size={14} />
              </button>
            ) : isCompleted ? (
              <button onClick={onNavigate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-green-700 bg-green-50 border border-green-200 transition-all">
                Review <ChevronRight size={14} />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
