'use client'
import { useState } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import Link from 'next/link'
import { ChevronRight, Gamepad2, Sparkles } from 'lucide-react'

export default function GamesPreview({ featuredGame }) {
  const typeMap = {
    WORDSEARCH: 'wordsearch',
    QUIZ: 'quiz',
    JOURNEY_TO_HEAVEN: 'journey'
  }
  const defaultGame = featuredGame && typeMap[featuredGame.type] ? typeMap[featuredGame.type] : 'wordsearch'
  const [activeGame, setActiveGame] = useState(defaultGame)

  const games = {
    wordsearch: {
      title: 'DMGA Word Search',
      thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
      icon: <Sparkles size={14} className="text-gold-500" />
    },
    journey: {
      title: 'Journey to Heaven',
      thumbnail: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=800',
      isNew: true
    },
    quiz: {
      title: 'Bible Challenge',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
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
                  {game.isNew && (
                    <span className="absolute top-0 right-0 bg-gold-500 text-purple-900 text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">
                      New
                    </span>
                  )}
                  <h4 className={`font-bold text-sm ${activeGame === id ? 'text-purple-900' : 'text-gray-500'}`}>
                    {game.title}
                  </h4>
                </button>
              ))}
            </div>

            <Link href="/games" className="btn-secondary w-full justify-center gap-2 text-sm">
              <Gamepad2 size={16} /> Play All Games <ChevronRight size={14} />
            </Link>
          </div>

          {/* Right — thumbnail preview (3 cols) */}
          <div
            className="lg:col-span-3 rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white min-h-[500px] flex flex-col group overflow-hidden relative"
            style={{ background: 'var(--surface)' }}
          >
            <div className="absolute inset-0 z-0">
               <img 
                 src={games[activeGame].thumbnail} 
                 alt={games[activeGame].title}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 mix-blend-overlay"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
               <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                     <h3 className="font-bold text-xl text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                        {games[activeGame].title}
                     </h3>
                     {games[activeGame].icon}
                  </div>
                  <span className="pill bg-white/10 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                     Preview Only
                  </span>
               </div>
               
               <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md border border-white/30 text-white animate-pulse">
                     <Gamepad2 size={40} />
                  </div>
                  <h4 className="text-3xl font-bold text-white mb-4">Ready to Play?</h4>
                  <p className="text-white/70 max-w-md mb-8">
                     Visit our dedicated games page to experience {games[activeGame].title} and other faith-building interactive adventures in full screen.
                  </p>
                  <Link 
                    href={`/games?active=${activeGame}`} 
                    className="bg-gold-500 hover:bg-gold-400 text-purple-950 px-8 py-3 rounded-full font-bold transition-all shadow-xl hover:shadow-gold-500/20"
                  >
                    Launch Full Game
                  </Link>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
