'use client'
import SectionHeader from '@/components/ui/SectionHeader'
import Link from 'next/link'
import { ArrowRight, Sparkles, Gamepad2 } from 'lucide-react'


export default function TreasuresPage() {

  return (
    <div className="min-h-screen" style={{ background: '#faf5ff', fontFamily: 'var(--font-kids)' }}>

      {/* Fun header */}
      <div
        className="relative py-24 px-6 text-white text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6a1b9a, #4a148c)' }}
      >
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#ffb300', transform: 'translate(-30%,-30%)' }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: '#e040fb', transform: 'translate(30%,30%)' }} />
        <div className="relative z-10">
          <p className="text-4xl mb-3">⭐</p>
          <h1 className="text-4xl md:text-6xl font-black mb-3" style={{ fontFamily: 'var(--font-kids)' }}>
            Destiny Treasures
          </h1>
          <p className="text-white/70 text-lg">Where kids grow in faith, fun, and friendship!</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Games section link for kids */}
        <div className="card p-8 md:p-12 mb-16 bg-white shadow-2xl relative overflow-hidden group" style={{ borderRadius: '3rem', border: '8px solid #f3e8ff' }}>
          <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 group-hover:rotate-12 transition-transform">🎮</div>
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <SectionHeader
              label="Destiny Games"
              title="Play & Learn"
              subtitle="Explore our fun, interactive games to grow your Bible knowledge! From 3D adventures to knowledge quizzes."
              centered
            />
            <div className="mt-10">
              <Link href="/games" className="btn-primary px-12 py-5 rounded-full text-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 inline-flex items-center gap-3">
                <Gamepad2 size={24} /> Enter Games World <Sparkles size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Coming Soon sections */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { emoji: '🎵', title: 'Worship Songs',    desc: 'Fun Bible songs for kids' },
            { emoji: '📖', title: 'Bible Stories',    desc: 'Animated stories coming soon' },
            { emoji: '🏆', title: 'Leaderboard',      desc: 'Top quiz champions' },
          ].map((item) => (
            <div key={item.title} className="card p-6" style={{ borderRadius: '20px' }}>
              <p className="text-4xl mb-3">{item.emoji}</p>
              <p className="font-black text-lg mb-1" style={{ color: 'var(--purple-800)', fontFamily: 'var(--font-kids)' }}>{item.title}</p>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/assemblies" className="btn-secondary inline-flex">
            Find Your Assembly <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
