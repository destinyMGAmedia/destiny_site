'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw, Trophy, ChevronRight } from 'lucide-react'

const QUESTIONS = [
  {
    q: 'How many days did God take to create the world?',
    options: ['5 days', '6 days', '7 days', '10 days'],
    answer: 1,
    ref: 'Genesis 1:31',
  },
  {
    q: 'Who was swallowed by a great fish?',
    options: ['Elijah', 'Moses', 'Jonah', 'Daniel'],
    answer: 2,
    ref: 'Jonah 1:17',
  },
  {
    q: 'How many disciples did Jesus choose?',
    options: ['7', '10', '12', '70'],
    answer: 2,
    ref: 'Matthew 10:1-4',
  },
  {
    q: 'What river was Jesus baptised in?',
    options: ['Nile', 'Euphrates', 'Jordan', 'Tigris'],
    answer: 2,
    ref: 'Matthew 3:13',
  },
  {
    q: 'Who wrote most of the Psalms?',
    options: ['Solomon', 'David', 'Moses', 'Asaph'],
    answer: 1,
    ref: 'Various Psalms',
  },
  {
    q: 'What was the name of the garden where Adam and Eve lived?',
    options: ['Eden', 'Gethsemane', 'Goshen', 'Canaan'],
    answer: 0,
    ref: 'Genesis 2:8',
  },
  {
    q: 'How many lepers did Jesus heal at once?',
    options: ['5', '7', '10', '12'],
    answer: 2,
    ref: 'Luke 17:12-14',
  },
  {
    q: 'What did Jesus turn water into?',
    options: ['Milk', 'Oil', 'Wine', 'Honey'],
    answer: 2,
    ref: 'John 2:9',
  },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function HomeBibleQuiz() {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setQuestions(shuffle(QUESTIONS).slice(0, 5))
  }, [])

  function init() {
    setQuestions(shuffle(QUESTIONS).slice(0, 5))
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }

  if (!questions.length) return null

  const q = questions[current]
  const isCorrect = selected === q.answer
  const answered = selected !== null

  function pick(i) {
    if (answered) return
    setSelected(i)
    if (i === q.answer) setScore((s) => s + 1)
  }

  function next() {
    if (current + 1 >= questions.length) {
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  const pct = Math.round((score / questions.length) * 100)

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Trophy size={48} style={{ color: 'var(--gold-500)' }} className="mb-4" />
        <h3
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
        >
          {score === questions.length ? 'Perfect Score! 🎉' : score >= 3 ? 'Well Done!' : 'Keep Studying!'}
        </h3>
        <p className="text-gray-500 mb-2">
          You got <span className="font-bold" style={{ color: 'var(--purple-800)' }}>{score}</span> out of {questions.length} correct
        </p>
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black mb-6"
          style={{
            background: pct === 100 ? 'var(--gold-500)' : pct >= 60 ? 'var(--purple-100)' : '#fee2e2',
            color: pct === 100 ? 'var(--purple-900)' : pct >= 60 ? 'var(--purple-800)' : '#991b1b',
          }}
        >
          {pct}%
        </div>
        <button onClick={init} className="btn-primary btn-sm inline-flex gap-2">
          <RefreshCw size={14} /> Play Again
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400">
          Question {current + 1} of {questions.length}
        </span>
        <span className="text-xs font-semibold" style={{ color: 'var(--gold-500)' }}>
          Score: {score}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full mb-6" style={{ background: 'var(--purple-100)' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${((current) / questions.length) * 100}%`,
            background: 'var(--gold-500)',
          }}
        />
      </div>

      {/* Question */}
      <p
        className="text-lg font-bold mb-5 leading-snug"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
      >
        {q.q}
      </p>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 mb-5">
        {q.options.map((opt, i) => {
          let bg = 'var(--surface)'
          let border = 'var(--border)'
          let color = 'var(--charcoal)'
          if (answered) {
            if (i === q.answer) { bg = '#f0fdf4'; border = '#22c55e'; color = '#15803d' }
            else if (i === selected) { bg = '#fef2f2'; border = '#ef4444'; color = '#991b1b' }
          }
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={answered}
              className="w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 flex items-center justify-between"
              style={{ background: bg, borderColor: border, color }}
            >
              <span>{opt}</span>
              {answered && i === q.answer && <CheckCircle size={18} color="#22c55e" />}
              {answered && i === selected && i !== q.answer && <XCircle size={18} color="#ef4444" />}
            </button>
          )
        })}
      </div>

      {/* Feedback + Next */}
      {answered && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 italic">📖 {q.ref}</p>
          <button
            onClick={next}
            className="btn-primary btn-sm inline-flex gap-1.5"
          >
            {current + 1 >= questions.length ? 'See Results' : 'Next'} <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
