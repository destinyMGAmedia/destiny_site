'use client'
import React, { useState, useRef, useMemo, Suspense, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Text, 
  Stars, 
  Float, 
  useGLTF, 
  useAnimations, 
  Environment,
  Html,
  ContactShadows
} from '@react-three/drei'
import * as THREE from 'three'
import { 
  Users, 
  BookOpen, 
  Heart, 
  Gift,
  Crown,
  Zap,
  TrendingDown,
  Play,
  Pause,
  Flag,
  Trophy,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  UserPlus,
  Send,
  Search
} from 'lucide-react'

// --- Spiritual Game Constants ---
const BOARD_SIZE = 50 // 50 squares from Earth to Heaven
const CELL_SIZE = 2
const BOARD_WIDTH = 10 // 10 squares wide
const PLAYER_COLORS = ['#a855f7', '#3b82f6', '#ef4444', '#10b981']

// Spiritual Actions that give points
const SPIRITUAL_ACTIONS = [
  {
    id: 'prayer',
    name: 'Daily Prayer',
    icon: '🙏',
    points: 3,
    description: 'Spend time in prayer and communion with God',
    color: 'text-purple-600'
  },
  {
    id: 'bible_reading',
    name: 'Bible Reading',
    icon: '📖',
    points: 4,
    description: 'Read and meditate on God\'s Word',
    color: 'text-blue-600'
  },
  {
    id: 'soul_winning',
    name: 'Win Souls',
    icon: '❤️',
    points: 6,
    description: 'Share the Gospel and lead someone to Christ',
    color: 'text-red-500'
  },
  {
    id: 'giving',
    name: 'Give to Poor',
    icon: '💝',
    points: 5,
    description: 'Help those in need with generous giving',
    color: 'text-green-600'
  },
  {
    id: 'worship',
    name: 'Worship & Praise',
    icon: '🎵',
    points: 3,
    description: 'Worship God with your whole heart',
    color: 'text-yellow-600'
  },
  {
    id: 'fellowship',
    name: 'Christian Fellowship',
    icon: '👥',
    points: 2,
    description: 'Encourage fellow believers in faith',
    color: 'text-indigo-600'
  }
]

// Spiritual Ladders (acceleration points)
const SPIRITUAL_LADDERS = [
  { position: 7, destination: 15, name: 'Baptism', icon: '💧' },
  { position: 12, destination: 28, name: 'Holy Spirit Baptism', icon: '🔥' },
  { position: 23, destination: 35, name: 'Ministry Calling', icon: '✋' },
  { position: 31, destination: 42, name: 'Spiritual Maturity', icon: '🌱' },
  { position: 38, destination: 47, name: 'Walking in Love', icon: '💕' }
]

// Spiritual Snakes (sin/temptations that pull down)
const SPIRITUAL_SNAKES = [
  { position: 18, destination: 5, name: 'Pride', icon: '👑' },
  { position: 26, destination: 14, name: 'Unforgiveness', icon: '😠' },
  { position: 33, destination: 19, name: 'Worldliness', icon: '🌍' },
  { position: 41, destination: 25, name: 'Lukewarmness', icon: '🧊' },
  { position: 46, destination: 30, name: 'Self-Righteousness', icon: '🎭' }
]

// --- Helper Functions ---
const getPositionCoords = (position) => {
  if (position === 0) return { x: 0, z: 0 } // Starting position
  
  const row = Math.floor((position - 1) / BOARD_WIDTH)
  const col = (position - 1) % BOARD_WIDTH
  
  // Snake pattern - even rows go left to right, odd rows go right to left
  const x = (row % 2 === 0) ? col : (BOARD_WIDTH - 1 - col)
  const z = row
  
  return { 
    x: (x - BOARD_WIDTH / 2) * CELL_SIZE, 
    z: (z - BOARD_WIDTH / 2) * CELL_SIZE 
  }
}

const rollDice = () => Math.floor(Math.random() * 6) + 1

// --- 3D Components ---
const PlayerModel = ({ color, position, playerId, isCurrentPlayer }) => {
  const { scene, animations } = useGLTF('https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/models/gltf/Soldier.glb')
  const group = useRef()
  const { actions } = useAnimations(animations, group)
  const clone = useMemo(() => scene.clone(), [scene])
  const coords = getPositionCoords(position)

  useEffect(() => {
    if (actions) {
      const action = actions['Idle']
      if (action) {
        Object.values(actions).forEach(a => a?.fadeOut(0.2))
        action.reset().fadeIn(0.2).play()
      }
    }
  }, [actions])

  useEffect(() => {
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [clone])

  return (
    <group ref={group} position={[coords.x, 0.5, coords.z]} scale={0.8}>
      <primitive object={clone} />
      {/* Player indicator */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial 
          color={color} 
          emissive={isCurrentPlayer ? color : '#000000'} 
          emissiveIntensity={isCurrentPlayer ? 1 : 0} 
        />
      </mesh>
      {/* Player ID */}
      <Html position={[0, 3, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-bold ${
          isCurrentPlayer ? 'bg-yellow-400 text-black' : 'bg-black/60 text-white'
        }`}>
          P{playerId}
        </div>
      </Html>
    </group>
  )
}

const Board3D = () => {
  return (
    <group>
      {/* Create board squares */}
      {Array.from({ length: BOARD_SIZE + 1 }, (_, i) => {
        const coords = getPositionCoords(i)
        const isSpecial = i === 0 || i === BOARD_SIZE
        const hasLadder = SPIRITUAL_LADDERS.some(l => l.position === i)
        const hasSnake = SPIRITUAL_SNAKES.some(s => s.position === i)
        
        let color = '#e5e7eb' // Default gray
        if (i === 0) color = '#10b981' // Green start
        else if (i === BOARD_SIZE) color = '#fbbf24' // Golden heaven
        else if (hasLadder) color = '#3b82f6' // Blue for ladders
        else if (hasSnake) color = '#ef4444' // Red for snakes
        
        return (
          <group key={i}>
            <mesh position={[coords.x, 0, coords.z]} receiveShadow>
              <boxGeometry args={[CELL_SIZE * 0.9, 0.1, CELL_SIZE * 0.9]} />
              <meshStandardMaterial color={color} />
            </mesh>
            
            {/* Position number */}
            <Html position={[coords.x, 0.2, coords.z]} center>
              <div className="text-xs font-bold text-black bg-white/80 rounded px-1">
                {i === 0 ? 'START' : i === BOARD_SIZE ? 'HEAVEN' : i}
              </div>
            </Html>
            
            {/* Special markers */}
            {hasLadder && (
              <mesh position={[coords.x, 0.5, coords.z]}>
                <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
                <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.5} />
              </mesh>
            )}
            
            {hasSnake && (
              <mesh position={[coords.x, 0.3, coords.z]}>
                <torusGeometry args={[0.4, 0.1, 8, 16]} />
                <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={0.5} />
              </mesh>
            )}
          </group>
        )
      })}
      
      {/* Base platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH * CELL_SIZE + 4, 0.5, BOARD_WIDTH * CELL_SIZE + 4]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  )
}

// --- Main Spiritual Game Component ---
export default function JourneyToHeavenSpiritual({ initialState, onSave, username }) {
  const [gameState, setGameState] = useState('menu') // menu, lobby, playing, finished
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [isHost, setIsHost] = useState(false)
  
  // Game state
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [playerPositions, setPlayerPositions] = useState({})
  const [playerHoliness, setPlayerHoliness] = useState({})
  const [gamePhase, setGamePhase] = useState('waiting') // waiting, rolling, choosing_action, moving, finished
  const [diceValue, setDiceValue] = useState(null)
  const [selectedAction, setSelectedAction] = useState(null)
  const [winner, setWinner] = useState(null)
  const [turnHistory, setTurnHistory] = useState([])
  
  // UI state
  const [showActionModal, setShowActionModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [inviteUsername, setInviteUsername] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isRolling, setIsRolling] = useState(false)

  // Initialize game
  const initializeGame = useCallback(() => {
    const initialPositions = {}
    const initialHoliness = {}
    
    players.forEach(player => {
      initialPositions[player.username] = 0 // Start at position 0
      initialHoliness[player.username] = 50 // Start with 50 holiness points
    })
    
    setPlayerPositions(initialPositions)
    setPlayerHoliness(initialHoliness)
    setCurrentPlayerIndex(0)
    setGamePhase('rolling')
  }, [players])

  // Roll dice for movement
  const handleRollDice = () => {
    if (gamePhase !== 'rolling') return
    
    setIsRolling(true)
    const value = rollDice()
    
    setTimeout(() => {
      setDiceValue(value)
      setIsRolling(false)
      setGamePhase('choosing_action')
      setShowActionModal(true)
    }, 1000)
  }

  // Choose spiritual action
  const chooseAction = (action) => {
    setSelectedAction(action)
    setShowActionModal(false)
    
    // Calculate movement based on action points + dice
    const currentPlayer = players[currentPlayerIndex]
    const currentPos = playerPositions[currentPlayer.username] || 0
    const movement = diceValue + action.points
    
    movePlayer(currentPlayer.username, movement, action)
  }

  // Move player and handle special squares
  const movePlayer = (playerName, movement, action) => {
    const currentPos = playerPositions[playerName] || 0
    let newPos = Math.min(currentPos + movement, BOARD_SIZE)
    
    // Update holiness based on action
    setPlayerHoliness(prev => ({
      ...prev,
      [playerName]: Math.min(100, (prev[playerName] || 50) + action.points)
    }))
    
    // Check for ladders (spiritual growth)
    const ladder = SPIRITUAL_LADDERS.find(l => l.position === newPos)
    if (ladder) {
      newPos = ladder.destination
      addToHistory(`${playerName} found ${ladder.name}! Climbed from ${ladder.position} to ${ladder.destination}`)
    }
    
    // Check for snakes (sin/temptation)
    const snake = SPIRITUAL_SNAKES.find(s => s.position === newPos)
    if (snake) {
      newPos = snake.destination
      setPlayerHoliness(prev => ({
        ...prev,
        [playerName]: Math.max(0, (prev[playerName] || 50) - 10)
      }))
      addToHistory(`${playerName} fell to ${snake.name}! Moved back from ${snake.position} to ${snake.destination}`)
    }
    
    // Update position
    setPlayerPositions(prev => ({
      ...prev,
      [playerName]: newPos
    }))
    
    // Check for win
    if (newPos >= BOARD_SIZE) {
      setWinner({
        player: playerName,
        holiness: playerHoliness[playerName] || 50,
        position: newPos
      })
      setGamePhase('finished')
      setGameState('finished')
      return
    }
    
    // Add turn to history
    addToHistory(`${playerName} chose "${action.name}" and moved ${movement} spaces to position ${newPos}`)
    
    // Next player's turn
    setTimeout(() => {
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length)
      setGamePhase('rolling')
      setSelectedAction(null)
      setDiceValue(null)
    }, 2000)
  }

  const addToHistory = (message) => {
    setTurnHistory(prev => [...prev.slice(-4), message])
  }

  // Room management functions
  const createRoom = async () => {
    try {
      const response = await fetch('/api/games/multiplayer/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostPlayer: username,
          difficulty: 'MEDIUM',
          maxPlayers: 4
        })
      })
      
      if (response.ok) {
        const newRoom = await response.json()
        setRoom(newRoom)
        setPlayers(newRoom.players)
        setIsHost(true)
        setGameState('lobby')
      }
    } catch (error) {
      console.error('Error creating room:', error)
      // Fallback to demo mode
      const mockRoom = {
        id: 'demo-room',
        roomCode: 'DEMO',
        hostPlayer: username,
        players: [{ username, position: 1 }]
      }
      setRoom(mockRoom)
      setPlayers(mockRoom.players)
      setIsHost(true)
      setGameState('lobby')
    }
  }

  // Join room by code
  const joinRoom = async () => {
    try {
      const response = await fetch('/api/games/multiplayer/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCode.toUpperCase(),
          username
        })
      })
      
      if (response.ok) {
        const joinedRoom = await response.json()
        setRoom(joinedRoom)
        setPlayers(joinedRoom.players)
        setIsHost(false)
        setGameState('lobby')
        setShowJoinModal(false)
      }
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }

  const startGame = () => {
    if (!room || !isHost) return
    
    initializeGame()
    setGameState('playing')
  }

  const forfeitGame = () => {
    setGameState('menu')
    setRoom(null)
    setPlayers([])
    setWinner(null)
  }

  // Render different game states
  const renderMenu = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="text-5xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Journey to Heaven
          </h2>
          <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
            Spiritual Board Game
          </p>
        </div>

        <div className="space-y-4 bg-white/5 p-8 rounded-3xl border border-white/10">
          <div className="space-y-3">
            <p className="text-sm text-slate-300 leading-relaxed">
              Build your spiritual life through daily Christian practices. Roll dice and choose spiritual actions 
              to advance toward Heaven while avoiding sin and temptation.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <button 
              onClick={createRoom}
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-purple-500 transition-all active:scale-95"
            >
              <Users className="inline mr-2" size={16} />
              Create Room
            </button>
            
            <button 
              onClick={() => setShowJoinModal(true)}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all active:scale-95"
            >
              Join Room
            </button>
          </div>
        </div>

        <div className="bg-purple-900/40 p-6 rounded-2xl border border-purple-700/30">
          <h3 className="text-lg font-bold text-white mb-3">Spiritual Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {SPIRITUAL_ACTIONS.slice(0, 4).map(action => (
              <div key={action.id} className="bg-white/5 p-3 rounded-xl">
                <div className="text-lg mb-1">{action.icon}</div>
                <div className="text-xs text-white font-medium">{action.name}</div>
                <div className="text-xs text-slate-400">+{action.points} steps</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderLobby = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h2 className="text-4xl font-black text-white mb-2">Spiritual Journey Lobby</h2>
          <p className="text-slate-400">Gather fellow believers for the journey to Heaven</p>
        </div>

        <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              Players ({players.length}/4)
            </h3>
            {isHost && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all"
              >
                <UserPlus size={20} />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {players.map((player, index) => (
              <div key={player.username} className="bg-white/10 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: PLAYER_COLORS[index] || '#gray' }}
                  />
                  <span className="text-white font-bold">{player.username}</span>
                  {player.username === room?.hostPlayer && (
                    <Crown size={16} className="text-gold-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={forfeitGame}
            className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-500 transition-all"
          >
            Cancel Game
          </button>
          
          {isHost && players.length >= 1 && (
            <button 
              onClick={startGame}
              className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-500 transition-all"
            >
              <Play className="inline mr-2" size={16} />
              Begin Journey
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const renderJoinModal = () => (
    showJoinModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-3xl max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4">Join Spiritual Journey</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code..."
              className="w-full p-3 border border-gray-200 rounded-xl text-center font-mono text-lg"
              maxLength={6}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={joinRoom}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl"
              >
                Join Journey
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  )

  const renderGame = () => {
    const currentPlayer = players[currentPlayerIndex]
    const isMyTurn = currentPlayer?.username === username
    
    return (
      <div className="relative w-full h-screen bg-slate-900">
        {/* Game HUD */}
        <div className="absolute top-6 left-6 z-40 space-y-4">
          {/* Current Turn */}
          <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Current Turn
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: PLAYER_COLORS[currentPlayerIndex] }}
              />
              <span className="font-bold">{currentPlayer?.username}</span>
              {isMyTurn && (
                <span className="px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded">
                  YOUR TURN
                </span>
              )}
            </div>
          </div>

          {/* Players & Progress */}
          <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Progress to Heaven
            </div>
            {players.map((player, index) => (
              <div key={player.username} className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PLAYER_COLORS[index] }}
                  />
                  <span className="text-sm font-bold">{player.username}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    Pos: {playerPositions[player.username] || 0}/50
                  </div>
                  <div className="text-xs">
                    Holiness: {playerHoliness[player.username] || 50}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Turn History */}
          <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white max-w-xs">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Recent Actions
            </div>
            <div className="space-y-1 text-xs">
              {turnHistory.map((action, index) => (
                <div key={index} className="text-slate-300">{action}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Dice and Action Controls */}
        {isMyTurn && gamePhase === 'rolling' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
            <button
              onClick={handleRollDice}
              disabled={isRolling}
              className="flex flex-col items-center gap-4 bg-purple-600 text-white p-8 rounded-3xl shadow-2xl hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="text-6xl">
                {isRolling ? '🎲' : diceValue ? `${diceValue}` : '🎲'}
              </div>
              <span className="font-bold text-lg">
                {isRolling ? 'Rolling...' : 'Roll Dice'}
              </span>
            </button>
          </div>
        )}

        {/* Game Controls */}
        <div className="absolute top-6 right-6 z-40 flex gap-2">
          <button 
            onClick={forfeitGame}
            className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all"
            title="Leave Game"
          >
            <Flag size={20} />
          </button>
        </div>

        {/* 3D Game World */}
        <Canvas shadows camera={{ position: [0, 25, 15], fov: 45 }}>
          <Suspense fallback={<Html center><div className="text-white">Loading...</div></Html>}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="night" />
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[10, 20, 10]} 
              intensity={1.5} 
              castShadow 
              shadow-mapSize={[1024, 1024]}
            />
            
            <Board3D />
            
            {/* Render players */}
            {players.map((player, index) => (
              <PlayerModel 
                key={player.username}
                color={PLAYER_COLORS[index]}
                position={playerPositions[player.username] || 0}
                playerId={index + 1}
                isCurrentPlayer={currentPlayerIndex === index}
              />
            ))}
            
            <ContactShadows opacity={0.4} scale={30} blur={2} far={10} />
            <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} minDistance={20} maxDistance={60} />
          </Suspense>
        </Canvas>
      </div>
    )
  }

  const renderFinished = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-purple-950/90 backdrop-blur-xl p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <Crown size={64} className="text-gold-400 mx-auto mb-4" />
          <h2 className="text-5xl font-black text-white mb-2">Heaven Reached!</h2>
          {winner && (
            <div>
              <p className="text-gold-400 font-bold text-xl mb-2">
                {winner.player} has entered Heaven!
              </p>
              <p className="text-white/70">
                With {winner.holiness} holiness points
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Final Standings</h3>
          {players
            .sort((a, b) => (playerPositions[b.username] || 0) - (playerPositions[a.username] || 0))
            .map((player, index) => (
              <div key={player.username} className="flex items-center justify-between p-3 rounded-xl mb-2 bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-gold-400 font-bold">#{index + 1}</span>
                  <span className="text-white font-bold">{player.username}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">Pos: {playerPositions[player.username] || 0}</div>
                  <div className="text-slate-400 text-xs">Holiness: {playerHoliness[player.username] || 50}</div>
                </div>
              </div>
            ))}
        </div>

        <button 
          onClick={forfeitGame}
          className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-500 transition-all"
        >
          Return to Menu
        </button>
      </div>
    </div>
  )

  // Action Selection Modal
  const renderActionModal = () => (
    showActionModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-3xl max-w-lg w-full mx-4">
          <h3 className="text-2xl font-bold mb-4 text-center">Choose Your Spiritual Action</h3>
          <p className="text-center text-gray-600 mb-6">
            You rolled a <strong>{diceValue}</strong>! Choose a spiritual practice to add to your movement:
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {SPIRITUAL_ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => chooseAction(action)}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <h4 className="font-bold text-sm mb-1">{action.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{action.description}</p>
                <div className="bg-purple-100 px-2 py-1 rounded text-xs font-bold text-purple-700">
                  +{action.points} steps
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Total: {diceValue + action.points} steps
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  )

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {gameState === 'menu' && renderMenu()}
      {gameState === 'lobby' && renderLobby()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'finished' && renderFinished()}
      {renderActionModal()}
      {renderJoinModal()}
    </div>
  )
}