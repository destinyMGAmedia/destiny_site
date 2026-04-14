'use client'

import { useState, useEffect } from 'react'
import { Plus, Video, FileText, HelpCircle, Trash2, Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

export default function GrowthTrackManager() {
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeStageId, setActiveStageId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [newContent, setNewContent] = useState({ title: '', type: 'VIDEO', url: '', body: '', order: 0 })
  const [newQuestion, setNewQuestion] = useState({ question: '', type: 'MULTIPLE_CHOICE', options: [''], correctAnswer: '' })

  useEffect(() => {
    fetchStages()
  }, [])

  async function fetchStages() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/growth')
      const data = await res.json()
      setStages(data)
      if (data.length > 0) setActiveStageId(data[0].id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddContent(stageId) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD_CONTENT', stageId, ...newContent })
      })
      if (res.ok) {
        fetchStages()
        setNewContent({ title: '', type: 'VIDEO', url: '', body: '', order: 0 })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddQuestion(stageId) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD_QUESTION', stageId, ...newQuestion })
      })
      if (res.ok) {
        fetchStages()
        setNewQuestion({ question: '', type: 'MULTIPLE_CHOICE', options: [''], correctAnswer: '' })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteItem(type, id) {
    if (!confirm('Are you sure?')) return
    const res = await fetch('/api/admin/growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: type === 'content' ? 'DELETE_CONTENT' : 'DELETE_QUESTION', id })
    })
    if (res.ok) fetchStages()
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={40} /></div>

  const activeStage = stages.find(s => s.id === activeStageId)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar - Stages */}
      <div className="space-y-2">
        <h3 className="font-bold text-gray-500 uppercase text-xs mb-4 tracking-widest">Growth Stages</h3>
        {stages.map(stage => (
          <button
            key={stage.id}
            onClick={() => setActiveStageId(stage.id)}
            className={`w-full text-left p-4 rounded-xl transition-all ${
              activeStageId === stage.id 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
              : 'bg-white hover:bg-purple-50 text-gray-700'
            }`}
          >
            <p className="font-bold">{stage.title}</p>
            <p className={`text-xs ${activeStageId === stage.id ? 'text-white/70' : 'text-gray-400'}`}>
              {stage.level.replace('_', ' ')}
            </p>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3 space-y-8">
        {activeStage && (
          <>
            <div className="card p-8">
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>{activeStage.title}</h2>
              <p className="text-gray-500 mb-8">{activeStage.description}</p>

              {/* Contents Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <Video size={20} className="text-purple-600" /> Lesson Content
                  </h3>
                </div>

                <div className="grid gap-4">
                  {activeStage.contents.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {item.type === 'VIDEO' ? <Video size={18} /> : <FileText size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{item.url || 'Text content'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteItem('content', item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Add Content Form */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 mt-4">
                    <h4 className="font-bold text-sm mb-4">Add New Lesson</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        className="form-input" 
                        placeholder="Lesson Title" 
                        value={newContent.title}
                        onChange={e => setNewContent({...newContent, title: e.target.value})}
                      />
                      <select 
                        className="form-select"
                        value={newContent.type}
                        onChange={e => setNewContent({...newContent, type: e.target.value})}
                      >
                        <option value="VIDEO">Video</option>
                        <option value="TEXT">Text / Article</option>
                        <option value="PDF">PDF Download</option>
                      </select>
                      <input 
                        className="form-input md:col-span-2" 
                        placeholder="URL (YouTube, PDF link, etc.)" 
                        value={newContent.url}
                        onChange={e => setNewContent({...newContent, url: e.target.value})}
                      />
                      {newContent.type === 'TEXT' && (
                        <textarea 
                          className="form-input md:col-span-2" 
                          placeholder="Lesson Body Text" 
                          rows={4}
                          value={newContent.body}
                          onChange={e => setNewContent({...newContent, body: e.target.value})}
                        />
                      )}
                    </div>
                    <button 
                      onClick={() => handleAddContent(activeStage.id)}
                      disabled={submitting || !newContent.title}
                      className="btn-primary btn-sm mt-4 w-full justify-center"
                    >
                      <Plus size={14} /> Add Content
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-6 mt-12 pt-12 border-t border-gray-100">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <HelpCircle size={20} className="text-purple-600" /> Assessment Questions
                </h3>

                <div className="grid gap-4">
                  {activeStage.questions.map((q, idx) => (
                    <div key={q.id} className="p-6 bg-gray-50 rounded-xl relative group">
                      <p className="font-bold text-gray-900 mb-2">Q{idx+1}: {q.question}</p>
                      <div className="text-sm text-gray-500 space-y-1">
                        {q.options && Array.isArray(q.options) && q.options.map((opt, i) => (
                           <p key={i} className={opt === q.correctAnswer ? 'text-green-600 font-bold' : ''}>
                             {String.fromCharCode(65 + i)}. {opt}
                           </p>
                        ))}
                      </div>
                      <button 
                        onClick={() => handleDeleteItem('question', q.id)}
                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Add Question Form */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 mt-4">
                    <h4 className="font-bold text-sm mb-4">Add Assessment Question</h4>
                    <div className="space-y-4">
                      <input 
                        className="form-input" 
                        placeholder="Question text" 
                        value={newQuestion.question}
                        onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                      />
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Options (Choice A is correct by default for simplicity in this demo, or mark one)</label>
                        {newQuestion.options.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <input 
                              className="form-input" 
                              placeholder={`Option ${String.fromCharCode(65+i)}`} 
                              value={opt}
                              onChange={e => {
                                const newOpts = [...newQuestion.options]
                                newOpts[i] = e.target.value
                                setNewQuestion({...newQuestion, options: newOpts})
                              }}
                            />
                            {i > 0 && (
                              <button onClick={() => {
                                const newOpts = newQuestion.options.filter((_, idx) => idx !== i)
                                setNewQuestion({...newQuestion, options: newOpts})
                              }} className="text-red-400 hover:text-red-600 px-2">
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          onClick={() => setNewQuestion({...newQuestion, options: [...newQuestion.options, '']})}
                          className="text-xs text-purple-600 font-bold hover:underline"
                        >
                          + Add Option
                        </button>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-400 uppercase">Correct Answer</label>
                         <select 
                            className="form-select"
                            value={newQuestion.correctAnswer}
                            onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                         >
                            <option value="">Select Correct Option</option>
                            {newQuestion.options.map((opt, i) => (
                                opt && <option key={i} value={opt}>{opt}</option>
                            ))}
                         </select>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddQuestion(activeStage.id)}
                      disabled={submitting || !newQuestion.question || !newQuestion.correctAnswer}
                      className="btn-primary btn-sm mt-6 w-full justify-center"
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function X({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    )
}
