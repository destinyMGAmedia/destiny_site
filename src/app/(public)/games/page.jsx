'use client'
import { useState } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import HomeBibleQuiz from '@/components/home/HomeBibleQuiz'
import BibleWordSearch from '@/components/games/BibleWordSearch'
import JourneyToHeaven from '@/components/games/JourneyToHeaven'
import PromiseLand from '@/components/games/PromiseLand'
import { Gamepad2, Trophy, HelpCircle, Map, Mountain } from 'lucide-react'

export default function GamesPage() {
  const [activeTab, setActiveTab] = useState('promise')

  const TABS = [
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
      desc: 'A spiritual 3D board game from Sin to Salvation. Face choices, win souls, and reach your eternal destination.'
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

  return (
    <div className="section-ivory min-h-screen">

      {/* Header */}
      <div
        className="relative py-24 px-6 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--purple-900), var(--purple-700))' }}
      >
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

      <div className="section-container max-w-6xl">
        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${isActive ? 'bg-purple-900 text-white shadow-xl scale-105' : 'bg-white text-gray-400 hover:bg-purple-50 hover:text-purple-600'}`}
              >
                <Icon size={18} className={isActive ? 'text-gold-400' : tab.color} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="max-w-3xl mx-auto text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <p className="text-gray-500 text-lg leading-relaxed">
              {TABS.find(t => t.id === activeTab)?.desc}
           </p>
        </div>

        <div className="card p-4 md:p-10 shadow-2xl min-h-[600px] flex items-center justify-center">
          {activeTab === 'promise' && <PromiseLand />}
          {activeTab === 'journey' && <JourneyToHeaven />}
          {activeTab === 'quiz' && (
            <div className="max-w-2xl w-full">
               <SectionHeader label="Bible Challenge" title="Knowledge Quiz" centered />
               <div className="mt-8">
                  <HomeBibleQuiz />
               </div>
            </div>
          )}
          {activeTab === 'wordsearch' && (
            <div className="w-full">
               <SectionHeader label="Search & Find" title="DMGA Word Search" centered />
               <div className="mt-12">
                  <BibleWordSearch />
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
