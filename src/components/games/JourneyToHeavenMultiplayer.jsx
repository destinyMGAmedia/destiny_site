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
  Star, 
  Crown, 
  Settings,
  UserPlus,
  Play,
  Pause,
  Flag,
  Search,
  Send,
  Check,
  X,
  Trophy,
  Target
} from 'lucide-react'

// --- Constants ---
const MAZE_SIZE = 11
const CELL_SIZE = 4
const WALL_HEIGHT = 3

const DIFFICULTIES = {
  EASY: { 
    name: 'Easy', 
    mazeComplexity: 0.3, 
    starCount: 15, 
    temptationCount: 3,
    color: 'text-green-600',
    description: 'Gentle path with more stars and fewer obstacles'
  },
  MEDIUM: { 
    name: 'Medium', 
    mazeComplexity: 0.5, 
    starCount: 10, 
    temptationCount: 5,
    color: 'text-yellow-600',
    description: 'Balanced challenge for experienced players'
  },
  HARD: { 
    name: 'Hard', 
    mazeComplexity: 0.7, 
    starCount: 7, 
    temptationCount: 8,
    color: 'text-red-600',
    description: 'Intense journey with limited resources'
  }
}

const PLAYER_COLORS = ['#a855f7', '#3b82f6', '#ef4444', '#10b981']

// --- Game Logic Functions ---
const generateMaze = (size, complexity = 0.5) => {
  const maze = Array(size).fill().map(() => Array(size).fill(1))
  
  const walk = (x, y) => {
    maze[y][x] = 0
    const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]]
      .sort(() => Math.random() - 0.5)
    
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy
      if (nx > 0 && nx < size && ny > 0 && ny < size && maze[ny][nx] === 1) {
        if (Math.random() < complexity) {
          maze[y + dy / 2][x + dx / 2] = 0
          walk(nx, ny)
        }
      }
    }
  }
  
  walk(1, 1)
  maze[1][1] = 0 // Start
  maze[size - 2][size - 2] = 0 // End
  return maze
}

const generateStars = (maze, count) => {
  const stars = []
  let attempts = 0
  while (stars.length < count && attempts < count * 3) {
    const x = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1
    const y = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1
    attempts++
    
    if (maze[y][x] === 0 && !(x === 1 && y === 1) && !(x === MAZE_SIZE-2 && y === MAZE_SIZE-2)) {
      if (!stars.some(s => s.x === x && s.y === y)) {
        stars.push({ 
          id: `star_${stars.length}`, 
          x, 
          y, 
          collected: false 
        })
      }
    }
  }
  return stars
}

// --- 3D Components ---
const PlayerModel = ({ color, moving, position, playerId }) => {
  const { scene, animations } = useGLTF('https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/models/gltf/Soldier.glb')
  const group = useRef()
  const { actions } = useAnimations(animations, group)
  const clone = useMemo(() => scene.clone(), [scene])

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

  useEffect(() => {
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [clone])

  return (
    <group ref={group} position={position} scale={0.8}>
      <primitive object={clone} />
      {/* Player indicator */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      {/* Player ID */}
      <Html position={[0, 3, 0]} center>
        <div className="bg-black/60 text-white px-2 py-1 rounded text-xs font-bold">
          P{playerId}
        </div>
      </Html>
    </group>
  )
}

const Maze3D = ({ maze }) => {
  return (
    <group>
      {maze.map((row, y) => row.map((cell, x) => {
        const worldX = (x - MAZE_SIZE/2) * CELL_SIZE
        const worldZ = (y - MAZE_SIZE/2) * CELL_SIZE
        
        if (cell === 1) {
          return (
            <mesh key={`${x}-${y}`} position={[worldX, WALL_HEIGHT/2, worldZ]} castShadow receiveShadow>
              <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
          )
        }
        return (
          <mesh key={`${x}-${y}`} position={[worldX, -0.05, worldZ]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[CELL_SIZE, CELL_SIZE]} />
            <meshStandardMaterial color={
              x === 1 && y === 1 ? "#10b981" : 
              x === MAZE_SIZE-2 && y === MAZE_SIZE-2 ? "#fbbf24" : 
              "#1e293b"
            } />
          </mesh>
        )
      }))}
      
      {/* Outer Floor */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[MAZE_SIZE * CELL_SIZE * 2, MAZE_SIZE * CELL_SIZE * 2]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  )
}

const StarCollectible = ({ star, onCollect, playerId }) => {
  if (star.collected) return null
  
  const worldX = (star.x - MAZE_SIZE/2) * CELL_SIZE
  const worldZ = (star.y - MAZE_SIZE/2) * CELL_SIZE

  return (
    <Float speed={4} rotationIntensity={2} floatIntensity={1} position={[worldX, 0.5, worldZ]}>
      <mesh 
        onClick={() => onCollect(star.id, playerId)}
        onPointerOver={(e) => e.stopPropagation()}
      >
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color="gold" emissive="gold" emissiveIntensity={2} />
      </mesh>
    </Float>
  )
}

const GoalPortal = ({ onWin }) => {
  const worldX = (MAZE_SIZE-2 - MAZE_SIZE/2) * CELL_SIZE
  const worldZ = (MAZE_SIZE-2 - MAZE_SIZE/2) * CELL_SIZE

  return (
    <group position={[worldX, 0, worldZ]}>
      <mesh position={[0, 5, 0]}>
        <torusGeometry args={[4, 0.2, 16, 100]} />
        <meshStandardMaterial color="gold" emissive="gold" emissiveIntensity={2} />
      </mesh>
      <Suspense fallback={null}>
        <Text position={[0, 5, 0]} fontSize={1.2} color="gold">HEAVEN</Text>
      </Suspense>
      <pointLight color="gold" intensity={15} distance={30} />
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]} onClick={onWin}>
        <ringGeometry args={[0, 5, 32]} />
        <meshStandardMaterial color="gold" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// --- Main Multiplayer Component ---
export default function JourneyToHeavenMultiplayer({ initialState, onSave, username }) {
  const [gameState, setGameState] = useState('menu') // menu, lobby, playing, finished
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [isHost, setIsHost] = useState(false)
  
  // Game world state
  const [maze, setMaze] = useState([])
  const [stars, setStars] = useState([])
  const [playerPositions, setPlayerPositions] = useState({})
  const [playerStars, setPlayerStars] = useState({})
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [winner, setWinner] = useState(null)
  const [gamePhase, setGamePhase] = useState('waiting') // waiting, playing, paused, finished
  
  // UI State
  const [inviteUsername, setInviteUsername] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [pendingInvites, setPendingInvites] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  
  // Polling for real-time updates
  const pollInterval = useRef(null)

  // Initialize game world based on difficulty
  const initializeGame = useCallback((diff = difficulty) => {
    const diffConfig = DIFFICULTIES[diff]
    const newMaze = generateMaze(MAZE_SIZE, diffConfig.mazeComplexity)
    const newStars = generateStars(newMaze, diffConfig.starCount)
    
    setMaze(newMaze)
    setStars(newStars)
    
    // Initialize player positions
    const initialPositions = {}
    const initialStars = {}
    players.forEach((player, index) => {
      initialPositions[player.username] = { x: 1, y: 1 }
      initialStars[player.username] = 0
    })
    
    setPlayerPositions(initialPositions)
    setPlayerStars(initialStars)
  }, [difficulty, players])

  // Create new room
  const createRoom = async () => {
    try {
      const response = await fetch('/api/games/multiplayer/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostPlayer: username,
          difficulty,
          maxPlayers: 4
        })
      })
      
      if (response.ok) {
        const newRoom = await response.json()
        setRoom(newRoom)
        setPlayers(newRoom.players)
        setIsHost(true)
        setGameState('lobby')
        startPolling(newRoom.id)
      }
    } catch (error) {
      console.error('Error creating room:', error)
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
        startPolling(joinedRoom.id)
      }
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }

  // Search for players
  const searchPlayers = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      const response = await fetch(`/api/games/multiplayer/players?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const players = await response.json()
        setSearchResults(players.filter(player => player !== username))
      }
    } catch (error) {
      console.error('Error searching players:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Send invitation
  const sendInvite = async (targetUsername = inviteUsername.trim()) => {
    if (!targetUsername || !room) return
    
    try {
      const response = await fetch('/api/games/multiplayer/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          fromPlayer: username,
          toPlayer: targetUsername
        })
      })
      
      if (response.ok) {
        setInviteUsername('')
        setSearchResults([])
        setShowInviteModal(false)
      }
    } catch (error) {
      console.error('Error sending invite:', error)
    }
  }

  // Start game
  const startGame = async () => {
    if (!room || !isHost) return
    
    try {
      const response = await fetch(`/api/games/multiplayer/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'IN_PROGRESS'
        })
      })
      
      if (response.ok) {
        initializeGame()
        setGamePhase('playing')
        setGameState('playing')
      }
    } catch (error) {
      console.error('Error starting game:', error)
    }
  }

  // Pause game
  const pauseGame = async () => {
    if (!room || !isHost) return
    
    try {
      const response = await fetch(`/api/games/multiplayer/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: { ...room.gameState, paused: true }
        })
      })
      
      if (response.ok) {
        setGamePhase('paused')
      }
    } catch (error) {
      console.error('Error pausing game:', error)
    }
  }

  // Resume game
  const resumeGame = async () => {
    if (!room || !isHost) return
    
    try {
      const response = await fetch(`/api/games/multiplayer/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: { ...room.gameState, paused: false }
        })
      })
      
      if (response.ok) {
        setGamePhase('playing')
      }
    } catch (error) {
      console.error('Error resuming game:', error)
    }
  }

  // Forfeit game
  const forfeitGame = async () => {
    if (!room) return
    
    try {
      const response = await fetch(`/api/games/multiplayer/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ABANDONED'
        })
      })
      
      if (response.ok) {
        stopPolling()
        setGameState('menu')
        setRoom(null)
        setPlayers([])
      }
    } catch (error) {
      console.error('Error forfeiting game:', error)
    }
  }

  // Collect star
  const collectStar = (starId, playerId) => {
    if (gamePhase !== 'playing') return
    
    setStars(prev => prev.map(s => 
      s.id === starId ? { ...s, collected: true } : s
    ))
    
    const playerName = players[playerId - 1]?.username
    if (playerName) {
      setPlayerStars(prev => ({
        ...prev,
        [playerName]: (prev[playerName] || 0) + 1
      }))
    }
  }

  // Check win condition
  const checkWin = (playerName) => {
    const pos = playerPositions[playerName]
    if (pos && pos.x === MAZE_SIZE-2 && pos.y === MAZE_SIZE-2) {
      setWinner({ player: playerName, stars: playerStars[playerName] || 0 })
      setGamePhase('finished')
      setGameState('finished')
      return true
    }
    return false
  }

  // Movement handling
  const movePlayer = useCallback((direction) => {
    if (gamePhase !== 'playing') return
    
    const currentPos = playerPositions[username]
    if (!currentPos) return
    
    const deltas = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    }
    
    const delta = deltas[direction]
    if (!delta) return
    
    const newX = currentPos.x + delta.x
    const newY = currentPos.y + delta.y
    
    if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && maze[newY][newX] === 0) {
      const newPos = { x: newX, y: newY }
      setPlayerPositions(prev => ({
        ...prev,
        [username]: newPos
      }))
      
      checkWin(username)
    }
  }, [gamePhase, playerPositions, username, maze])

  // Real-time polling
  const startPolling = (roomId) => {
    stopPolling()
    pollInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/games/multiplayer/rooms/${roomId}`)
        if (response.ok) {
          const updatedRoom = await response.json()
          setRoom(updatedRoom)
          setPlayers(updatedRoom.players)
          
          if (updatedRoom.status === 'IN_PROGRESS' && gameState === 'lobby') {
            initializeGame(updatedRoom.difficulty)
            setGamePhase('playing')
            setGameState('playing')
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)
  }

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current)
      pollInterval.current = null
    }
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          movePlayer('up')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          movePlayer('down')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          movePlayer('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          movePlayer('right')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      stopPolling()
    }
  }, [gameState, movePlayer])

  // Render different states
  const renderMenu = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="text-5xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Journey to Heaven
          </h2>
          <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
            Multiplayer Edition
          </p>
        </div>

        <div className="space-y-4 bg-white/5 p-8 rounded-3xl border border-white/10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
              Difficulty
            </label>
            <div className="flex gap-2">
              {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                <button 
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
                    difficulty === key 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {diff.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 italic">
              {DIFFICULTIES[difficulty].description}
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
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-100 transition-all active:scale-95"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLobby = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h2 className="text-4xl font-black text-white mb-2">Game Lobby</h2>
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <span>Room Code: <span className="font-mono font-bold text-white">{room?.roomCode}</span></span>
            <span className={DIFFICULTIES[room?.difficulty || difficulty].color}>
              {DIFFICULTIES[room?.difficulty || difficulty].name}
            </span>
          </div>
        </div>

        <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              Players ({players.length}/{room?.maxPlayers || 4})
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
            
            {/* Empty slots */}
            {Array.from({ length: (room?.maxPlayers || 4) - players.length }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-white/5 p-4 rounded-2xl border-2 border-dashed border-white/20">
                <div className="flex items-center justify-center h-8 text-slate-500">
                  Waiting for player...
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
            Leave Game
          </button>
          
          {isHost && players.length >= 2 && (
            <button 
              onClick={startGame}
              className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-500 transition-all"
            >
              <Play className="inline mr-2" size={16} />
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const renderGame = () => (
    <div className="relative w-full h-screen bg-slate-900">
      {/* Game HUD */}
      <div className="absolute top-6 left-6 z-40 space-y-4">
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Players & Stars
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
              <div className="flex items-center gap-1">
                <Star size={14} className="text-gold-400" />
                <span className="font-bold">{playerStars[player.username] || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="absolute top-6 right-6 z-40 flex gap-2">
        {isHost && (
          <button 
            onClick={gamePhase === 'playing' ? pauseGame : resumeGame}
            className={`p-3 text-white rounded-xl transition-all ${
              gamePhase === 'playing' 
                ? 'bg-yellow-600 hover:bg-yellow-500' 
                : 'bg-green-600 hover:bg-green-500'
            }`}
            title={gamePhase === 'playing' ? 'Pause Game' : 'Resume Game'}
          >
            {gamePhase === 'playing' ? <Pause size={20} /> : <Play size={20} />}
          </button>
        )}
        <button 
          onClick={forfeitGame}
          className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all"
          title="Forfeit Game"
        >
          <Flag size={20} />
        </button>
      </div>

      {/* 3D Game World */}
      <Canvas shadows camera={{ position: [0, 25, 20], fov: 45 }}>
        <Suspense fallback={<Html center><div className="text-white">Loading...</div></Html>}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="night" />
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          
          <Maze3D maze={maze} />
          
          {/* Render players */}
          {players.map((player, index) => {
            const position = playerPositions[player.username]
            if (!position) return null
            
            const worldX = (position.x - MAZE_SIZE/2) * CELL_SIZE
            const worldZ = (position.y - MAZE_SIZE/2) * CELL_SIZE
            
            return (
              <PlayerModel 
                key={player.username}
                color={PLAYER_COLORS[index]}
                moving={false}
                position={[worldX, 0, worldZ]}
                playerId={index + 1}
              />
            )
          })}
          
          {/* Render stars */}
          {stars.map(star => (
            <StarCollectible 
              key={star.id} 
              star={star} 
              onCollect={collectStar}
              playerId={players.findIndex(p => p.username === username) + 1}
            />
          ))}
          
          <GoalPortal onWin={() => checkWin(username)} />
          
          <ContactShadows opacity={0.4} scale={MAZE_SIZE * CELL_SIZE} blur={2} far={10} />
          <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} minDistance={15} maxDistance={50} />
        </Suspense>
      </Canvas>

      {/* Pause Overlay */}
      {gamePhase === 'paused' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="text-center text-white p-8">
            <Pause size={64} className="mx-auto mb-4 text-yellow-400" />
            <h3 className="text-3xl font-bold mb-2">Game Paused</h3>
            <p className="text-white/70">
              {isHost ? 'Click resume to continue' : 'Waiting for host to resume...'}
            </p>
          </div>
        </div>
      )}

      {/* Movement Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl text-white text-center">
        <p className="text-xs font-bold uppercase tracking-widest">
          WASD or Arrow Keys to Move • Collect Stars • Reach Heaven First!
        </p>
      </div>
    </div>
  )

  const renderFinished = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-purple-950/90 backdrop-blur-xl p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <Trophy size={64} className="text-gold-400 mx-auto mb-4" />
          <h2 className="text-5xl font-black text-white mb-2">Game Over!</h2>
          {winner && (
            <div>
              <p className="text-gold-400 font-bold text-xl mb-2">
                {winner.player} Wins!
              </p>
              <p className="text-white/70">
                With {winner.stars} stars collected
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Final Scores</h3>
          {players
            .sort((a, b) => (playerStars[b.username] || 0) - (playerStars[a.username] || 0))
            .map((player, index) => (
              <div key={player.username} className="flex items-center justify-between p-3 rounded-xl mb-2 bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-gold-400 font-bold">#{index + 1}</span>
                  <span className="text-white font-bold">{player.username}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-gold-400" />
                  <span className="text-white font-bold">{playerStars[player.username] || 0}</span>
                </div>
              </div>
            ))}
        </div>

        <button 
          onClick={() => {
            stopPolling()
            setGameState('menu')
            setRoom(null)
            setPlayers([])
          }}
          className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-500 transition-all"
        >
          Return to Menu
        </button>
      </div>
    </div>
  )

  // Modals
  const renderModals = () => (
    <>
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Invite Player</h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(e) => {
                    setInviteUsername(e.target.value)
                    searchPlayers(e.target.value)
                  }}
                  placeholder="Search username..."
                  className="w-full p-3 border border-gray-200 rounded-xl"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl">
                  {searchResults.map((player, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInviteUsername(player)
                        setSearchResults([])
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-sm">
                          {player[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{player}</span>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowInviteModal(false)
                    setSearchResults([])
                    setInviteUsername('')
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => sendInvite()}
                  disabled={!inviteUsername.trim()}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="inline mr-2" />
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Join Game Room</h3>
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
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl"
                >
                  Join Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {gameState === 'menu' && renderMenu()}
      {gameState === 'lobby' && renderLobby()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'finished' && renderFinished()}
      {renderModals()}
    </div>
  )
}