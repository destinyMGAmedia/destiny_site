'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SectionHeader from '@/components/ui/SectionHeader'
import HomeBibleQuiz from '@/components/home/HomeBibleQuiz'
import BibleWordSearch from '@/components/games/BibleWordSearch'
import BibleCrossword from '@/components/games/BibleCrossword'
import JourneyToHeaven from '@/components/games/JourneyToHeaven'
import JourneyToHeavenFixed from '@/components/games/JourneyToHeavenFixed'
import PromiseLand from '@/components/games/PromiseLand'
import { Gamepad2, Trophy, HelpCircle, Map, Mountain, Maximize2, Minimize2, Keyboard, User, Save, RefreshCw, ChevronDown, Grid3x3 } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

const TABS = [
  { 
    id: 'crossword', 
    label: 'Crossword', 
    icon: Grid3x3, 
    color: 'text-purple-600',
    desc: 'Solve the DMGA values puzzle. Use clues from our vision and mission to fill the grid.'
  },
  { 
    id: 'promise', 
    label: 'Promise Land', 
    icon: Mountain, 
    color: 'text-orange-600',
    desc: 'An adventurous 3D journey through the wilderness. Equip the Armor of God, overcome temptations, and reach the Promise Land of Canaan.'
  },
  { 
    id: 'journey', 
    label: 'Journey to Heaven', 
    icon: Map, 
    color: 'text-purple-600',
    desc: 'A spiritual 3D maze adventure. Play solo or challenge friends in multiplayer mode.'
  },
  { 
    id: 'quiz', 
    label: 'Bible Quiz', 
    icon: HelpCircle, 
    color: 'text-blue-600',
    desc: 'Test your knowledge of the Word with 5 random questions. Can you get a perfect score?'
  },
  { 
    id: 'wordsearch', 
    label: 'Word Search', 
    icon: Trophy, 
    color: 'text-gold-600',
    desc: 'Find hidden words from our vision and mission in this fun and challenging puzzle.'
  },
]

export default function GamesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('crossword')
  const gameContainerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)
  
  // Player Progress State
  const [username, setUsername] = useState('')
  const [allProgress, setAllProgress] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)
  const [loadStatus, setLoadStatus] = useState('')
  const saveTimeoutRef = useRef(null)
  
  // Multiplayer mode state
  const [isMultiplayerMode, setIsMultiplayerMode] = useState(false)

  useEffect(() => {
    const active = searchParams.get('active')
    if (active && TABS.some(t => t.id === active)) {
      setActiveTab(active)
    }
  }, [searchParams])

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Prevent scrolling for navigation keys when on games page
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't prevent if typing in an input
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable
      if (isInput) return

      // Prevent default scrolling for Arrow keys and Space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      // Toggle fullscreen with 'f' key
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault()
        toggleFullscreen()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleSync = async (e) => {
    if (e) e.preventDefault()
    if (!username.trim()) return

    setIsLoadingProgress(true)
    setLoadStatus('loading')
    try {
      const res = await fetch(`/api/games/progress?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      
      if (data.gameData && Object.keys(data.gameData).length > 0) {
        // Exists: Restore it
        setAllProgress(data.gameData)
        setLoadStatus('success_restore')
        setTimeout(() => setLoadStatus(''), 3000)
      } else {
        // Doesn't exist or empty: Save current local state to this new username
        const resSave = await fetch('/api/games/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, gameData: allProgress })
        })
        if (resSave.ok) {
           setLoadStatus('success_save')
           setTimeout(() => setLoadStatus(''), 3000)
        } else {
           setLoadStatus('error')
        }
      }
    } catch (error) {
      console.error('Error syncing progress:', error)
      setLoadStatus('error')
    } finally {
      setIsLoadingProgress(false)
    }
  }

  const saveProgress = async (gameId, state) => {
    if (!username.trim()) return

    // Debounce saves to prevent overwhelming the database
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        const newProgress = { ...allProgress, [gameId]: state }
        setAllProgress(newProgress)
        await fetch('/api/games/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, gameData: newProgress })
        })
      } catch (error) {
        console.error('Error saving progress:', error)
      } finally {
        setIsSaving(false)
      }
    }, 1000)
  }

  return (
    <div className="section-ivory min-h-screen">

      {/* Header */}
      <div
        className="relative py-24 px-6 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--purple-900), var(--purple-700))' }}
      >
        <BackButton className="absolute top-8 left-8 z-20" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--gold-500)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
            <Gamepad2 size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Destiny Games
          </h1>
          <p className="text-white/60 text-lg">Interactive Christian games to build your faith and knowledge.</p>
        </div>
      </div>

      <div className="w-full px-0">
        {/* Game Selection Dropdown and Player State */}
        <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
           {/* Dropdown */}
           <div className="relative w-full md:w-auto min-w-[300px]">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-900/40 mb-2 px-4">Select Your Adventure</div>
              <div className="relative">
                 <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full appearance-none bg-white text-purple-900 px-6 py-4 rounded-2xl font-bold shadow-sm border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 pr-12 cursor-pointer transition-all hover:shadow-md"
                 >
                    {TABS.map((tab) => (
                       <option key={tab.id} value={tab.id}>{tab.label}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-purple-900/40 pointer-events-none" size={20} />
              </div>
           </div>

           {/* Player Username / Sync Player */}
           <form onSubmit={handleSync} className="flex-1 w-full max-w-md flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                 <label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-900/40 mb-2 px-4 block">
                    Sync Progress (Username)
                 </label>
                 <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-900/30" size={18} />
                    <input
                       id="username"
                       type="text"
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}
                       placeholder="Enter your username..."
                       className="w-full bg-white text-purple-900 pl-14 pr-6 py-4 rounded-2xl font-bold shadow-sm border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                 </div>
              </div>
              <button
                 type="submit"
                 disabled={isLoadingProgress || !username.trim()}
                 className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 h-[58px] ${isLoadingProgress ? 'bg-gray-100 text-gray-400' : 'bg-purple-900 text-white hover:bg-purple-800 shadow-lg active:scale-95'}`}
              >
                 {isLoadingProgress ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                 {loadStatus === 'success_restore' ? 'Restored!' : loadStatus === 'success_save' ? 'Created!' : 'Sync'}
              </button>
           </form>
        </div>

        <div className="max-w-3xl mx-auto text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 px-6">
           <p className="text-gray-500 text-lg leading-relaxed italic">
              &quot;{TABS.find(t => t.id === activeTab)?.desc}&quot;
           </p>
           {loadStatus === 'success_save' && (
              <p className="mt-4 text-xs font-bold text-green-600 animate-pulse">
                 New player profile created for &quot;{username}&quot;. Your journey begins!
              </p>
           )}
           {loadStatus === 'success_restore' && (
              <p className="mt-4 text-xs font-bold text-purple-600 animate-pulse">
                 Welcome back, &quot;{username}&quot;! Your spiritual progress has been restored.
              </p>
           )}
           {loadStatus === 'error' && (
              <p className="mt-4 text-xs font-bold text-red-600">
                 Failed to connect to the celestial database. Please try again.
              </p>
           )}
        </div>

        <div 
          ref={gameContainerRef}
          className={`w-full bg-black relative flex flex-col overflow-hidden ${isFullscreen ? 'h-screen w-screen' : 'min-h-[600px] lg:h-[800px]'}`}
        >
          <div className="flex-1 relative flex flex-col min-h-0">
            {/* Game Utility Buttons */}
            <div className="absolute top-6 right-6 z-40 flex gap-2">
              <button 
                onClick={() => setShowControls(!showControls)}
                className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all shadow-xl"
                title="Game Controls"
              >
                <Keyboard size={20} />
              </button>
              <button 
                onClick={toggleFullscreen}
                className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all shadow-xl"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>

            {/* Controls Overlay (Transparent, no background) */}
            {showControls && (
               <div className="absolute top-24 right-6 z-40 w-64 p-6 text-white animate-in fade-in slide-in-from-right-4 pointer-events-none">
                  <div className="flex items-center justify-between mb-6 pointer-events-auto">
                     <div className="flex items-center gap-2">
                        <Keyboard size={14} className="text-gold-400" />
                        <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gold-400 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">Game Controls</h4>
                     </div>
                     <button onClick={() => setShowControls(false)} className="text-white/40 hover:text-white text-lg">&times;</button>
                  </div>
                  
                  <div className="space-y-6 [text-shadow:_0_1px_4px_rgb(0_0_0_/_80%)]">
                     {/* Navigation */}
                     <div>
                        <div className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-3">Navigation</div>
                        <div className="space-y-2 text-xs">
                           <div className="flex justify-between items-center">
                              <span className="text-white/70">Move Forward</span>
                              <span className="font-mono font-bold">W / ↑</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-white/70">Move Backward</span>
                              <span className="font-mono font-bold">S / ↓</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-white/70">Left / Right</span>
                              <span className="font-mono font-bold">A/D / ←/→</span>
                           </div>
                        </div>
                     </div>

                     {/* Actions */}
                     <div>
                        <div className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-3">Actions</div>
                        <div className="space-y-2 text-xs">
                           <div className="flex justify-between items-center">
                              <span className="text-white/70">Jump / Action</span>
                              <span className="font-mono font-bold">SPACE</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-white/70">Fullscreen</span>
                              <span className="font-mono font-bold">F / Icon</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-white/70">Toggle Help</span>
                              <span className="font-mono font-bold">Icon</span>
                           </div>
                        </div>
                     </div>
                     
                     {/* Game Specific info */}
                     {activeTab === 'journey' && (
                       <p className="text-[10px] text-white/50 italic leading-relaxed pt-4 border-t border-white/10">
                          Click &quot;ROLL DICE&quot; to advance. Ladders elevate, trials backslide.
                       </p>
                     )}
                     {activeTab === 'wordsearch' && (
                       <p className="text-[10px] text-white/50 italic leading-relaxed pt-4 border-t border-white/10">
                          Drag over letters to find words horizontally or vertically.
                       </p>
                     )}
                  </div>
               </div>
            )}

            <div className="flex-1 w-full relative">
               {activeTab === 'crossword' && (
                 <div className="w-full py-20 px-6 flex items-center justify-center min-h-[600px]">
                    <div className="w-full max-w-4xl mx-auto">
                       <SectionHeader label="Values Puzzle" title="DMGA Crossword" centered />
                       <div className="mt-12">
                          <BibleCrossword 
                            initialState={allProgress.crossword}
                            onSave={(state) => saveProgress('crossword', state)}
                          />
                       </div>
                    </div>
                 </div>
               )}
               {activeTab === 'promise' && (
                 <PromiseLand 
                   initialState={allProgress.promise} 
                   onSave={(state) => saveProgress('promise', state)} 
                 />
               )}
               {activeTab === 'journey' && (
                 <JourneyToHeavenFixed 
                   initialState={allProgress.journey} 
                   onSave={(state) => saveProgress('journey', state)} 
                   username={username.trim() || 'Player1'}
                 />
               )}
               {activeTab === 'quiz' && (
                  <div className="max-w-2xl w-full mx-auto py-20 px-6 flex items-center justify-center min-h-[600px]">
                     <div className="w-full">
                        <SectionHeader label="Bible Challenge" title="Knowledge Quiz" centered />
                        <div className="mt-8">
                           <HomeBibleQuiz 
                             initialState={allProgress.quiz}
                             onSave={(state) => saveProgress('quiz', state)}
                           />
                        </div>
                     </div>
                  </div>
               )}
               {activeTab === 'wordsearch' && (
                  <div className="w-full py-20 px-6 flex items-center justify-center min-h-[600px]">
                     <div className="w-full max-w-5xl mx-auto">
                        <SectionHeader label="Search & Find" title="DMGA Word Search" centered />
                        <div className="mt-12">
                           <BibleWordSearch 
                             initialState={allProgress.wordsearch}
                             onSave={(state) => saveProgress('wordsearch', state)}
                           />
                        </div>
                     </div>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
