'use client'
import React, { useState, useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text, RoundedBox, Stars, Float, Center, Loader } from '@react-three/drei'
import * as THREE from 'three'

// Constants for the game
const BOARD_SIZE = 10
const CELL_SIZE = 1.2
const GAP = 0.1

const Board = ({ currentPos, events }) => {
  const cells = useMemo(() => {
    const arr = []
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
      const row = Math.floor(i / BOARD_SIZE)
      const col = row % 2 === 0 ? (i % BOARD_SIZE) : (BOARD_SIZE - 1 - (i % BOARD_SIZE))
      
      const x = (col - (BOARD_SIZE - 1) / 2) * (CELL_SIZE + GAP)
      const z = (row - (BOARD_SIZE - 1) / 2) * (CELL_SIZE + GAP)
      
      arr.push({ id: i + 1, x, z, row, col })
    }
    return arr
  }, [])

  return (
    <group>
      {cells.map((cell) => {
        const isCurrent = cell.id === currentPos
        const event = events.find(e => e.square === cell.id)
        
        let color = 'white'
        if (cell.id === 1) color = '#7f1d1d' // Sin (Dark Red)
        if (cell.id === 100) color = '#fbbf24' // Heaven (Gold)
        if (event) {
            if (event.type === 'ladder') color = '#34d399' // Progress (Green)
            if (event.type === 'snake') color = '#f87171' // Backslide (Red)
        }

        return (
          <group key={cell.id} position={[cell.x, 0, cell.z]}>
            <RoundedBox args={[CELL_SIZE, 0.2, CELL_SIZE]} radius={0.1} smoothness={4}>
              <meshStandardMaterial 
                color={color} 
                emissive={isCurrent ? color : 'black'} 
                emissiveIntensity={isCurrent ? 2.0 : 0} 
              />
            </RoundedBox>
            <Text
              position={[0, 0.15, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.3}
              color={cell.id === 1 || cell.id === 100 ? 'white' : 'black'}
            >
              {cell.id === 1 ? 'SIN' : cell.id === 100 ? 'HEAVEN' : cell.id}
            </Text>
            {event && (
              <Text
                position={[0, 0.25, 0.3]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.15}
                color="black"
              >
                {event.label}
              </Text>
            )}
          </group>
        )
      })}
    </group>
  )
}

const Player = ({ position }) => {
  const mesh = useRef()
  const targetPos = useMemo(() => {
    const row = Math.floor((position - 1) / BOARD_SIZE)
    const col = row % 2 === 0 ? ((position - 1) % BOARD_SIZE) : (BOARD_SIZE - 1 - ((position - 1) % BOARD_SIZE))
    const x = (col - (BOARD_SIZE - 1) / 2) * (CELL_SIZE + GAP)
    const z = (row - (BOARD_SIZE - 1) / 2) * (CELL_SIZE + GAP)
    return new THREE.Vector3(x, 0.5, z)
  }, [position])

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.position.lerp(targetPos, 0.1)
    }
  })

  return (
    <group ref={mesh}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.3, 0.6, 4, 16]} />
          <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>
    </group>
  )
}

const EVENTS = [
  { square: 5, type: 'ladder', target: 25, label: 'Repentance', desc: 'You turned away from sin! Move forward.' },
  { square: 15, type: 'ladder', target: 45, label: 'Soul Winning', desc: 'You won a soul! Gain a crown and advance.' },
  { square: 30, type: 'snake', target: 10, label: 'Wrong Choice', desc: 'Be careful! You backslid a bit.' },
  { square: 50, type: 'ladder', target: 80, label: 'Ministry Support', desc: 'God is your defense. Leap forward!' },
  { square: 65, type: 'snake', target: 40, label: 'Negligence', desc: 'Prayer life weakened. Fall back.' },
  { square: 85, type: 'ladder', target: 98, label: 'Giving to Poor', desc: 'Big rooms in heaven! Almost there!' },
  { square: 95, type: 'snake', target: 75, label: 'Pride', desc: 'Pride comes before a fall.' },
]

export default function JourneyToHeaven() {
  const [pos, setPos] = useState(1)
  const [rolling, setRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState(0)
  const [message, setMessage] = useState('Welcome to your Journey to Heaven! Roll the dice to begin.')
  const [stats, setStats] = useState({ crowns: 0, coins: 0, defense: 0 })

  const rollDice = () => {
    if (rolling || pos >= 100) return
    setRolling(true)
    const roll = Math.floor(Math.random() * 6) + 1
    setLastRoll(roll)
    
    setTimeout(() => {
      let newPos = pos + roll
      if (newPos > 100) newPos = 100
      
      setPos(newPos)
      setRolling(false)
      
      // Check for events
      const event = EVENTS.find(e => e.square === newPos)
      if (event) {
        setTimeout(() => {
          setMessage(event.desc)
          setPos(event.target)
          
          // Update stats based on event
          if (event.label === 'Soul Winning') setStats(s => ({ ...s, crowns: s.crowns + 1 }))
          if (event.label === 'Giving to Poor') setStats(s => ({ ...s, coins: s.coins + 10 }))
          if (event.label === 'Ministry Support') setStats(s => ({ ...s, defense: s.defense + 5 }))
        }, 1000)
      } else {
        setMessage(`You rolled a ${roll}. Keep moving towards Heaven!`)
      }
    }, 600)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full min-h-[600px]">
      {/* Board Side */}
      <div className="flex-1 bg-gray-900 rounded-3xl overflow-hidden relative min-h-[400px]">
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 12, 12]} fov={50} />
            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} minDistance={5} maxDistance={25} />
            
            <ambientLight intensity={2.5} />
            <directionalLight position={[10, 20, 10]} intensity={4} castShadow />
            <pointLight position={[-10, 10, -10]} intensity={2.5} color="#8b5cf6" />
            
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <Board currentPos={pos} events={EVENTS} />
            <Player position={pos} />
          </Suspense>
        </Canvas>
        <Loader />

        {pos >= 100 && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-900/80 backdrop-blur-sm z-30">
            <div className="text-center text-white p-8">
              <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Welcome Home!</h2>
              <p className="text-gold-400 text-xl mb-6">You have reached Heaven!</p>
              <div className="flex justify-center gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.crowns}</div>
                  <div className="text-xs uppercase">Crowns</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.coins}</div>
                  <div className="text-xs uppercase">Soul Coins</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.defense}</div>
                  <div className="text-xs uppercase">Defense</div>
                </div>
              </div>
              <button onClick={() => {setPos(1); setStats({crowns:0, coins:0, defense:0}); setMessage('Welcome to your Journey to Heaven!')}} className="btn-primary">
                Restart Journey
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Description Side */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="card p-6 border-purple-100 bg-purple-50/30">
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Journey to Heaven
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            A spiritual journey from Sin to Salvation. Face choices, win souls, and reach your eternal destination.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase">Current Position</span>
              <span className="text-lg font-bold text-purple-600">{pos === 1 ? 'Sin' : pos === 100 ? 'Heaven' : `Square ${pos}`}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 italic leading-relaxed">
                &quot;{message}&quot;
              </p>
            </div>
          </div>

          <button
            onClick={rollDice}
            disabled={rolling || pos >= 100}
            className="w-full mt-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg shadow-lg transform active:scale-95 transition-all disabled:opacity-50"
          >
            {rolling ? 'Rolling...' : 'Roll Dice'}
          </button>
        </div>

        <div className="card p-6">
          <h4 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">Your Rewards</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-gold-50 rounded-xl border border-gold-100">
              <span className="text-sm font-medium">Crowns</span>
              <span className="font-bold text-gold-600">👑 {stats.crowns}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-sm font-medium">Soul Coins</span>
              <span className="font-bold text-blue-600">🪙 {stats.coins}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
              <span className="text-sm font-medium">Defense</span>
              <span className="font-bold text-green-600">🛡️ {stats.defense}</span>
            </div>
          </div>
        </div>

        <div className="card p-4 text-[10px] text-gray-400 leading-relaxed uppercase tracking-tighter">
          * Backsliding occurs on wrong choices. Soul winning brings crowns. Support the ministry to build defense. Reach Heaven to win!
        </div>
      </div>
    </div>
  )
}
