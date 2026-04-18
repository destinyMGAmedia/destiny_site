'use client'
<<<<<<< HEAD
import React, { useState, useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Text, 
  Stars, 
  Float, 
  useGLTF, 
  useAnimations, 
  Environment,
  Html,
  ContactShadows,
  RoundedBox
} from '@react-three/drei'
import * as THREE from 'three'

// --- Constants ---
const MAZE_SIZE = 11 // Must be odd
const CELL_SIZE = 4
const WALL_HEIGHT = 3

// --- Utils ---
const generateMaze = (size) => {
  const maze = Array(size).fill().map(() => Array(size).fill(1)) // 1 is wall, 0 is path
  
  const walk = (x, y) => {
    maze[y][x] = 0
    const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5)
    
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy
      if (nx > 0 && nx < size && ny > 0 && ny < size && maze[ny][nx] === 1) {
        maze[y + dy / 2][x + dx / 2] = 0
        walk(nx, ny)
      }
    }
  }
  
  walk(1, 1)
  maze[1][1] = 0 // Start
  maze[size - 2][size - 2] = 0 // End
  return maze
}

// --- Components ---

const JoshuaModel = ({ color, moving, scale = 1 }) => {
  const { scene, animations } = useGLTF('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb')
  const group = useRef()
  const { actions } = useAnimations(animations, group)

  const clone = useMemo(() => scene.clone(), [scene])

  useEffect(() => {
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.name.includes('body') || child.name.includes('Head')) {
           // We can't easily change color of textures but we can tint if material supports it
           // For simplicity, let's just use the default for now or add a tint mesh
        }
      }
    })
  }, [clone])

  useEffect(() => {
    if (actions) {
      const name = moving ? 'Run' : 'Idle'
      const action = actions[name]
      if (action) {
        Object.values(actions).forEach(a => a?.fadeOut(0.2))
        action.reset().fadeIn(0.2).play()
      }
    }
  }, [actions, moving])

  return (
    <group ref={group} scale={scale} position={[0, -0.9, 0]}>
      <primitive object={clone} />
      {/* Visual Indicator for Player Color */}
      <mesh position={[0, 2.5, 0]}>
         <sphereGeometry args={[0.2]} />
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

const Maze = ({ maze }) => {
  return (
    <group>
      {maze.map((row, y) => row.map((cell, x) => {
        if (cell === 1) {
          return (
            <mesh key={`${x}-${y}`} position={[(x - MAZE_SIZE/2) * CELL_SIZE, WALL_HEIGHT/2, (y - MAZE_SIZE/2) * CELL_SIZE]} castShadow receiveShadow>
              <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
          )
        }
        return (
          <mesh key={`${x}-${y}`} position={[(x - MAZE_SIZE/2) * CELL_SIZE, -0.05, (y - MAZE_SIZE/2) * CELL_SIZE]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[CELL_SIZE, CELL_SIZE]} />
            <meshStandardMaterial color={x === 1 && y === 1 ? "#ef4444" : x === MAZE_SIZE-2 && y === MAZE_SIZE-2 ? "#fbbf24" : "#1e293b"} />
          </mesh>
        )
      }))}
      
      {/* Outer Floor */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
         <planeGeometry args={[MAZE_SIZE * CELL_SIZE * 2, MAZE_SIZE * CELL_SIZE * 2]} />
         <meshStandardMaterial color="#0f172a" />
      </mesh>
=======
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
>>>>>>> origin/main
    </group>
  )
}

<<<<<<< HEAD
const Collectible = ({ position, type, onCollect }) => {
  const [active, setActive] = useState(true)
  const color = type === 'star' ? 'gold' : type === 'defense' ? 'purple' : 'cyan'
  
  if (!active) return null
  
  return (
    <Float speed={4} rotationIntensity={2} floatIntensity={1} position={position}>
      <mesh 
        onPointerOver={() => {
          setActive(false)
          onCollect(type)
        }}
      >
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </Float>
  )
}

// --- Main Game Component ---

export default function JourneyToHeaven({ initialState, onSave }) {
  const [difficulty, setDifficulty] = useState('Medium')
  const [mode, setMode] = useState('AI') // AI or PvP
  const [gameStatus, setGameStatus] = useState('menu') // menu, playing, won
  const [turn, setTurn] = useState(0) // 0 for Player 1, 1 for Player 2/AI
  const [isMoving, setIsMoving] = useState(false)
  
  const [player1, setPlayer1] = useState(initialState?.player1 || {
    pos: { x: 1, y: 1 },
    stats: { stars: 0, coins: 0, defense: 0 }
  })
  const [player2, setPlayer2] = useState(initialState?.player2 || {
    pos: { x: 1, y: 1 },
    stats: { stars: 0, coins: 0, defense: 0 }
  })
  
  const maze = useMemo(() => generateMaze(MAZE_SIZE), [])
  const [collectibles, setCollectibles] = useState([])

  useEffect(() => {
    // Generate random collectibles
    const newCollectibles = []
    const types = ['star', 'coin', 'defense']
    for (let i = 0; i < 15; i++) {
      let rx, ry
      do {
        rx = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1
        ry = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1
      } while (maze[ry][rx] === 1 || (rx === 1 && ry === 1) || (rx === MAZE_SIZE-2 && ry === MAZE_SIZE-2))
      
      newCollectibles.push({
        id: i,
        pos: [(rx - MAZE_SIZE/2) * CELL_SIZE, 0.5, (ry - MAZE_SIZE/2) * CELL_SIZE],
        gridPos: { x: rx, y: ry },
        type: types[i % 3]
      })
    }
    setCollectibles(newCollectibles)
  }, [maze])

  useEffect(() => {
    if (onSave && gameStatus === 'playing') {
      onSave({ player1, player2, difficulty, mode })
    }
  }, [player1, player2, difficulty, mode, gameStatus, onSave])

  const handleMove = (dx, dy) => {
    if (isMoving || gameStatus !== 'playing') return
    
    const currentPlayer = turn === 0 ? player1 : player2
    const nx = currentPlayer.pos.x + dx
    const ny = currentPlayer.pos.y + dy
    
    if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && maze[ny][nx] === 0) {
      setIsMoving(true)
      const newPos = { x: nx, y: ny }
      
      if (turn === 0) {
        setPlayer1(p => ({ ...p, pos: newPos }))
      } else {
        setPlayer2(p => ({ ...p, pos: newPos }))
      }
      
      // Check for win
      if (nx === MAZE_SIZE - 2 && ny === MAZE_SIZE - 2) {
        setTimeout(() => setGameStatus('won'), 500)
      }
      
      // Check for collectibles
      const collIdx = collectibles.findIndex(c => c.gridPos.x === nx && c.gridPos.y === ny)
      if (collIdx !== -1) {
        const type = collectibles[collIdx].type
        const statKey = type === 'star' ? 'stars' : type === 'coin' ? 'coins' : 'defense'
        if (turn === 0) {
          setPlayer1(p => ({ ...p, stats: { ...p.stats, [statKey]: p.stats[statKey] + (type === 'star' ? 1 : 5) } }))
        } else {
          setPlayer2(p => ({ ...p, stats: { ...p.stats, [statKey]: p.stats[statKey] + (type === 'star' ? 1 : 5) } }))
        }
        setCollectibles(prev => prev.filter((_, i) => i !== collIdx))
      }

      setTimeout(() => {
        setIsMoving(false)
        setTurn(t => (t + 1) % 2)
      }, 300)
    }
  }

  // AI Logic
  useEffect(() => {
    if (mode === 'AI' && turn === 1 && gameStatus === 'playing' && !isMoving) {
      const timer = setTimeout(() => {
        // Simple AI: Try to move towards goal, avoid walls
        const target = { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 }
        const current = player2.pos
        
        let dx = 0, dy = 0
        if (Math.random() > (difficulty === 'Hard' ? 0.05 : difficulty === 'Medium' ? 0.3 : 0.6)) {
           // Move towards target (greedy approach)
           const possible = [[0, 1], [0, -1], [1, 0], [-1, 0]].filter(([px, py]) => {
             const nx = current.x + px, ny = current.y + py
             return nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && maze[ny][nx] === 0
           })
           
           if (possible.length > 0) {
             // Sort by distance to target
             possible.sort(([ax, ay], [bx, by]) => {
               const distA = Math.abs((current.x + ax) - target.x) + Math.abs((current.y + ay) - target.y)
               const distB = Math.abs((current.x + bx) - target.x) + Math.abs((current.y + by) - target.y)
               return distA - distB
             })
             
             const [pdx, pdy] = possible[0]
             dx = pdx
             dy = pdy
           }
        }
        
        handleMove(dx, dy)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [turn, mode, gameStatus, isMoving, difficulty])

  // Keyboard controls for Player 1
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (turn !== 0 || isMoving || gameStatus !== 'playing') return
      if (e.key === 'ArrowUp' || e.key === 'w') handleMove(0, -1)
      if (e.key === 'ArrowDown' || e.key === 's') handleMove(0, 1)
      if (e.key === 'ArrowLeft' || e.key === 'a') handleMove(-1, 0)
      if (e.key === 'ArrowRight' || e.key === 'd') handleMove(1, 0)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [turn, isMoving, gameStatus])

  const startGame = () => {
    setGameStatus('playing')
    setTurn(0)
    setPlayer1({ pos: { x: 1, y: 1 }, stats: { stars: 0, coins: 0, defense: 0 } })
    setPlayer2({ pos: { x: 1, y: 1 }, stats: { stars: 0, coins: 0, defense: 0 } })
  }

  return (
    <div className="w-full h-full relative bg-slate-950 flex flex-col">
      {/* Menu Overlay */}
      {gameStatus === 'menu' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-8">
           <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="space-y-2">
                 <h2 className="text-5xl font-black text-white" style={{ fontFamily: 'var(--font-serif)' }}>Journey to Heaven</h2>
                 <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">3D Maze Edition</p>
              </div>
              
              <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Opponent</label>
                    <div className="flex gap-2">
                       {['AI', 'PvP'].map(m => (
                          <button 
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${mode === m ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                          >
                             {m === 'AI' ? 'VS COMPUTER' : 'VS PLAYER'}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Difficulty</label>
                    <div className="flex gap-2">
                       {['Easy', 'Medium', 'Hard'].map(d => (
                          <button 
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${difficulty === d ? 'bg-gold-500 text-slate-900 shadow-lg shadow-gold-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                          >
                             {d.toUpperCase()}
                          </button>
                       ))}
                    </div>
                 </div>

                 <button 
                   onClick={startGame}
                   className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-gold-400 transition-all active:scale-95"
                 >
                    Enter the Maze
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Win Overlay */}
      {gameStatus === 'won' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-purple-950/90 backdrop-blur-xl p-8">
           <div className="max-w-md w-full text-center space-y-8">
              <div className="space-y-2">
                 <div className="w-24 h-24 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_50px_rgba(251,191,36,0.5)]">👑</div>
                 <h2 className="text-5xl font-black text-white" style={{ fontFamily: 'var(--font-serif)' }}>Heaven Reached!</h2>
                 <p className="text-gold-400 font-bold uppercase tracking-widest">Well done, good and faithful servant</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="text-[10px] font-bold text-slate-500 mb-2">PLAYER 1</div>
                    <div className="text-3xl font-black text-white">{player1.stats.stars} ⭐</div>
                 </div>
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="text-[10px] font-bold text-slate-500 mb-2">{mode === 'AI' ? 'COMPUTER' : 'PLAYER 2'}</div>
                    <div className="text-3xl font-black text-white">{player2.stats.stars} ⭐</div>
                 </div>
              </div>

              <button 
                onClick={() => setGameStatus('menu')}
                className="w-full py-5 bg-gold-500 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-white transition-all"
              >
                 Return to Menu
              </button>
           </div>
        </div>
      )}

      {/* Game Header / HUD */}
      <div className="absolute top-0 inset-x-0 z-40 p-6 flex items-start justify-between pointer-events-none">
         <div className={`p-6 rounded-3xl backdrop-blur-md border transition-all ${turn === 0 ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-105' : 'bg-white/5 border-white/10 opacity-60'}`}>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-xl">👤</div>
               <div>
                  <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">Player 1</div>
                  <div className="text-white font-black">STRIVER</div>
               </div>
            </div>
            <div className="flex gap-4">
               <div className="text-center">
                  <div className="text-xl font-black text-gold-400">{player1.stats.stars}</div>
                  <div className="text-[8px] font-bold text-white/40 uppercase">Stars</div>
               </div>
               <div className="text-center">
                  <div className="text-xl font-black text-blue-400">{player1.stats.coins}</div>
                  <div className="text-[8px] font-bold text-white/40 uppercase">Coins</div>
               </div>
            </div>
         </div>

         <div className="flex flex-col items-center gap-2">
            <div className="px-6 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.3em]">
               {turn === 0 ? "Player 1's Turn" : (mode === 'AI' ? "Computer's Turn" : "Player 2's Turn")}
            </div>
            {isMoving && <div className="text-[10px] font-bold text-gold-500 animate-pulse uppercase tracking-widest">Moving...</div>}
         </div>

         <div className={`p-6 rounded-3xl backdrop-blur-md border transition-all ${turn === 1 ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-105' : 'bg-white/5 border-white/10 opacity-60'}`}>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl">{mode === 'AI' ? '🤖' : '👤'}</div>
               <div>
                  <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">{mode === 'AI' ? 'Computer' : 'Player 2'}</div>
                  <div className="text-white font-black">{mode === 'AI' ? 'CELESTIAL-AI' : 'SEEKER'}</div>
               </div>
            </div>
            <div className="flex gap-4">
               <div className="text-center">
                  <div className="text-xl font-black text-gold-400">{player2.stats.stars}</div>
                  <div className="text-[8px] font-bold text-white/40 uppercase">Stars</div>
               </div>
               <div className="text-center">
                  <div className="text-xl font-black text-blue-400">{player2.stats.coins}</div>
                  <div className="text-[8px] font-bold text-white/40 uppercase">Coins</div>
               </div>
            </div>
         </div>
      </div>

      <div className="flex-1 w-full bg-slate-900">
         <Canvas shadows camera={{ position: [0, 20, 15], fov: 45 }}>
            <Suspense fallback={null}>
               <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
               <Environment preset="night" />
               <ambientLight intensity={0.5} />
               <directionalLight 
                 position={[10, 20, 10]} 
                 intensity={1.5} 
                 castShadow 
                 shadow-mapSize={[1024, 1024]}
               />
               
               <Maze maze={maze} />
               
               {/* Player 1 */}
               <group position={[(player1.pos.x - MAZE_SIZE/2) * CELL_SIZE, 0, (player1.pos.y - MAZE_SIZE/2) * CELL_SIZE]}>
                  <JoshuaModel color="#a855f7" moving={isMoving && turn === 0} />
               </group>
               
               {/* Player 2 */}
               <group position={[(player2.pos.x - MAZE_SIZE/2) * CELL_SIZE, 0, (player2.pos.y - MAZE_SIZE/2) * CELL_SIZE]}>
                  <JoshuaModel color="#3b82f6" moving={isMoving && turn === 1} />
               </group>

               {collectibles.map(c => (
                 <Collectible 
                   key={c.id} 
                   position={c.pos} 
                   type={c.type} 
                   onCollect={(type) => {}} // Controlled by handleMove for server-side sync
                 />
               ))}

               <ContactShadows opacity={0.4} scale={MAZE_SIZE * CELL_SIZE} blur={2} far={10} />
               <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} minDistance={10} maxDistance={40} />
            </Suspense>
         </Canvas>
      </div>

      {/* Footer Instructions */}
      <div className="p-4 bg-slate-950 border-t border-white/5 text-center">
         <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em]">
            Use WASD or ARROW KEYS to navigate Player 1 • Reach the GOLDEN SQUARE to enter Heaven
         </p>
=======
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
>>>>>>> origin/main
      </div>
    </div>
  )
}
