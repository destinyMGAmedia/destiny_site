'use client'
import { useState } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
<<<<<<< HEAD
import Link from 'next/link'
import { ChevronRight, Gamepad2, Sparkles, Grid3x3, Trophy, HelpCircle } from 'lucide-react'
import BibleCrossword from '@/components/games/BibleCrossword'
import BibleWordSearch from '@/components/games/BibleWordSearch'
import HomeBibleQuiz from '@/components/home/HomeBibleQuiz'

export default function GamesPreview({ featuredGame }) {
  const typeMap = {
    CROSSWORD: 'crossword',
=======
import HomeBibleQuiz from '@/components/home/HomeBibleQuiz'
import BibleWordSearch from '@/components/games/BibleWordSearch'
import JourneyToHeaven from '@/components/games/JourneyToHeaven'
import Link from 'next/link'
import { ChevronRight, Gamepad2, Sparkles } from 'lucide-react'

export default function GamesPreview({ featuredGame }) {
  const typeMap = {
>>>>>>> origin/main
    WORDSEARCH: 'wordsearch',
    QUIZ: 'quiz',
    JOURNEY_TO_HEAVEN: 'journey'
  }
<<<<<<< HEAD
  const defaultGame = featuredGame && typeMap[featuredGame.type] ? typeMap[featuredGame.type] : 'crossword'
  const [activeGame, setActiveGame] = useState(defaultGame)

  const games = {
    crossword: {
      title: 'DMGA Crossword',
      icon: <Grid3x3 size={16} />,
      component: <BibleCrossword />,
      desc: 'Solve the DMGA values puzzle based on our vision and mission.'
    },
    wordsearch: {
      title: 'DMGA Word Search',
      icon: <Trophy size={16} />,
      component: <BibleWordSearch />,
      desc: 'Find hidden words from our core values in the grid.'
    },
    quiz: {
      title: 'Bible Challenge',
      icon: <HelpCircle size={16} />,
      component: <HomeBibleQuiz />,
      desc: 'Test your knowledge of the Word with 5 random questions.'
=======
  const defaultGame = featuredGame && typeMap[featuredGame.type] ? typeMap[featuredGame.type] : 'wordsearch'
  const [activeGame, setActiveGame] = useState(defaultGame)

  const games = {
    wordsearch: {
      title: 'DMGA Word Search',
      component: <BibleWordSearch />,
      icon: <Sparkles size={14} className="text-gold-500" />
    },
    journey: {
      title: 'Journey to Heaven',
      component: <JourneyToHeaven />,
      isNew: true
    },
    quiz: {
      title: 'Bible Challenge',
      component: <HomeBibleQuiz />
>>>>>>> origin/main
    }
  }

  return (
    <section className="section-lavender py-24">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">

          {/* Left — heading & descriptions (1 col) */}
          <div className="lg:pt-4 space-y-8 lg:col-span-1">
            <SectionHeader
              label="Destiny Games"
              title="Interactive Games"
              subtitle="Fun and faith-building games for the whole family."
            />
            
            <div className="space-y-3">
              {Object.entries(games).map(([id, game]) => (
                <button
                  key={id}
                  onClick={() => setActiveGame(id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden group ${activeGame === id ? 'bg-white border-purple-600 shadow-md' : 'bg-white/50 border-transparent hover:border-purple-200'}`}
                >
<<<<<<< HEAD
                  <div className="flex items-center gap-3">
                    <div className={`${activeGame === id ? 'text-purple-600' : 'text-gray-400'}`}>
                      {game.icon}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${activeGame === id ? 'text-purple-900' : 'text-gray-500'}`}>
                        {game.title}
                      </h4>
                      {activeGame === id && <p className="text-[10px] text-gray-400 mt-1 leading-tight">{game.desc}</p>}
                    </div>
                  </div>
=======
                  {game.isNew && (
                    <span className="absolute top-0 right-0 bg-gold-500 text-purple-900 text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">
                      New
                    </span>
                  )}
                  <h4 className={`font-bold text-sm ${activeGame === id ? 'text-purple-900' : 'text-gray-500'}`}>
                    {game.title}
                  </h4>
>>>>>>> origin/main
                </button>
              ))}
            </div>

            <Link href="/games" className="btn-secondary w-full justify-center gap-2 text-sm">
<<<<<<< HEAD
              <Gamepad2 size={16} /> Play All Games <ChevronRight size={14} />
            </Link>
          </div>

          {/* Right — actual game board (3 cols) */}
          <div
            className="lg:col-span-3 rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white min-h-[500px] flex flex-col group overflow-hidden relative bg-white/40 backdrop-blur-sm"
          >
            <div className="relative z-10 flex flex-col h-full">
               <div className="mb-8 flex items-center justify-between border-b border-purple-100 pb-4">
                  <div className="flex items-center gap-3">
                     <h3 className="font-bold text-xl text-purple-900" style={{ fontFamily: 'var(--font-serif)' }}>
                        {games[activeGame].title}
                     </h3>
                     <span className="pill bg-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-wider">
                        Live Preview
                     </span>
                  </div>
                  <Link 
                    href={`/games?active=${activeGame}`}
                    className="text-purple-600 hover:text-purple-900 text-xs font-bold flex items-center gap-1"
                  >
                    Play Full Screen <ChevronRight size={14} />
                  </Link>
               </div>
               
               <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-full max-w-2xl transform scale-90 md:scale-100 origin-center transition-transform">
                    {games[activeGame].component}
                  </div>
               </div>
=======
              <Gamepad2 size={16} /> View All Games <ChevronRight size={14} />
            </Link>
          </div>

          {/* Right — playable game board (3 cols) */}
          <div
            className="lg:col-span-3 rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white min-h-[500px] flex flex-col"
            style={{ background: 'var(--surface)' }}
          >
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
               <div className="flex items-center gap-3">
                  <h3 className="font-bold text-xl text-purple-900" style={{ fontFamily: 'var(--font-serif)' }}>
                     {games[activeGame].title}
                  </h3>
                  {games[activeGame].icon}
               </div>
               <span className="pill bg-gold-500 text-purple-900 text-[10px] font-black uppercase tracking-wider">
                  Live Preview
               </span>
            </div>
            <div className="flex-1">
              {games[activeGame].component}
>>>>>>> origin/main
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
