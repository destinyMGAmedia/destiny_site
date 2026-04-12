'use client'
import React, { Suspense, useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Sky, 
  KeyboardControls, 
  useKeyboardControls,
  Stars,
  Float,
  Text,
  Html,
  Loader
} from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'
import { Bloom, EffectComposer, DepthOfField } from '@react-three/postprocessing'
import * as THREE from 'three'

// --- Constants ---
const ROAD_WIDTH = 10
const ROAD_LENGTH = 300
const MOVE_SPEED = 10
const JUMP_FORCE = 12

// --- Character Component ---
const Character = ({ playerRef, onCollision }) => {
  const rigidBody = useRef()
  
  useEffect(() => {
    if (playerRef) playerRef.current = rigidBody.current
  }, [playerRef])
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const { camera } = useThree()
  
  // Camera follow state
  const cameraOffset = new THREE.Vector3(0, 5, 10)
  const cameraTarget = new THREE.Vector3(0, 0, 0)

  useFrame((state, delta) => {
    if (!rigidBody.current) return

    const { forward, backward, left, right, jump } = getKeys()
    
    // Get current velocity
    const velocity = rigidBody.current.linvel()
    
    // Calculate target movement
    let xSpeed = 0
    let zSpeed = 0
    
    if (forward) zSpeed -= MOVE_SPEED
    if (backward) zSpeed += MOVE_SPEED
    if (left) xSpeed -= MOVE_SPEED
    if (right) xSpeed += MOVE_SPEED

    // Apply movement with smoothing
    rigidBody.current.setLinvel({ 
      x: xSpeed, 
      y: velocity.y, 
      z: zSpeed 
    }, true)

    // Jump logic - check if touching ground (velocity.y close to 0)
    if (jump && Math.abs(velocity.y) < 0.1) {
      rigidBody.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true)
    }

    // Camera follow - smoother interpolation
    const charPos = rigidBody.current.translation()
    const targetCameraPos = new THREE.Vector3(
      charPos.x + cameraOffset.x,
      charPos.y + cameraOffset.y,
      charPos.z + cameraOffset.z
    )
    
    state.camera.position.lerp(targetCameraPos, 0.1)
    state.camera.lookAt(charPos.x, charPos.y + 1, charPos.z)
  })

  return (
    <RigidBody 
      ref={rigidBody} 
      colliders="cuboid" 
      enabledRotations={[false, false, false]} 
      position={[0, 5, 0]}
      onIntersectionEnter={onCollision}
    >
      <group>
        {/* Simple Humanoid Shape */}
        <mesh castShadow position={[0, 0.9, 0]}>
          <capsuleGeometry args={[0.4, 1, 4, 16]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <mesh castShadow position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
      </group>
    </RigidBody>
  )
}

// --- World Components ---
const WildernessRoad = () => {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh receiveShadow position={[0, -0.5, -ROAD_LENGTH / 2 + 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
        <meshStandardMaterial color="#d2b48c" roughness={1} />
      </mesh>
      
      {/* Side barriers/rocks */}
      <mesh receiveShadow position={[ROAD_WIDTH/2 + 1, 0, -ROAD_LENGTH / 2 + 10]}>
        <boxGeometry args={[2, 1, ROAD_LENGTH]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh receiveShadow position={[-ROAD_WIDTH/2 - 1, 0, -ROAD_LENGTH / 2 + 10]}>
        <boxGeometry args={[2, 1, ROAD_LENGTH]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
    </RigidBody>
  )
}

const Pickup = ({ position, type, color, label, onPickup }) => {
  const [active, setActive] = useState(true)

  if (!active) return null

  return (
    <RigidBody 
      type="fixed" 
      position={position} 
      sensor 
      onIntersectionEnter={() => {
        setActive(false)
        onPickup(type, label)
      }}
    >
      <Float speed={3} rotationIntensity={2} floatIntensity={1}>
        <mesh castShadow>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 1, 0]} fontSize={0.3} color="white">{label}</Text>
      </Float>
    </RigidBody>
  )
}

const Temptation = ({ position, label, onHit, playerRef }) => {
  const rigidBody = useRef()
  const speed = 3
  
  useFrame((state, delta) => {
    if (rigidBody.current && playerRef?.current) {
      const charPos = playerRef.current.translation()
      const tempPos = rigidBody.current.translation()
      
      const direction = new THREE.Vector3(
        charPos.x - tempPos.x,
        0,
        charPos.z - tempPos.z
      )
      
      const distance = direction.length()
      
      // Track player if within range (15 units)
      if (distance < 15 && distance > 1) {
        direction.normalize()
        rigidBody.current.setNextKinematicTranslation({
          x: tempPos.x + direction.x * speed * delta,
          y: tempPos.y, // Maintain current height
          z: tempPos.z + direction.z * speed * delta
        })
      } else {
        // Idle bobbing
        const time = state.clock.getElapsedTime()
        rigidBody.current.setNextKinematicTranslation({
          x: position[0] + Math.sin(time + position[2]) * 2,
          y: position[1] + Math.cos(time * 2) * 0.5,
          z: position[2]
        })
      }
    }
  })

  return (
    <RigidBody 
      ref={rigidBody} 
      type="kinematicPosition" 
      position={position} 
      colliders="ball" 
      sensor
      onIntersectionEnter={() => onHit(label)}
    >
      <mesh castShadow>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} wireframe />
      </mesh>
      <Text position={[0, 1.2, 0]} fontSize={0.4} color="#ff4444">{label}</Text>
    </RigidBody>
  )
}

const Goal = ({ position, onWin }) => {
  return (
    <RigidBody type="fixed" position={position} sensor onIntersectionEnter={onWin}>
      <group>
        <mesh position={[0, 5, 0]}>
          <torusGeometry args={[4, 0.1, 16, 100]} />
          <meshStandardMaterial color="gold" emissive="gold" emissiveIntensity={2} />
        </mesh>
        <Text position={[0, 5, 0]} fontSize={1} color="gold">CANAAN</Text>
        <pointLight color="gold" intensity={10} distance={20} />
      </group>
    </RigidBody>
  )
}

// --- Main Game Component ---
export default function PromiseLand() {
  const [gameKey, setGameKey] = useState(0)
  const playerRef = useRef()
  const [gameState, setGameState] = useState('playing') // playing, won, lost
  const [spirit, setSpirit] = useState(100)
  const [armors, setArmors] = useState([])
  const [message, setMessage] = useState('Begin your journey to the Promise Land!')

  const map = useMemo(() => [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
  ], [])

  const handlePickup = (type, label) => {
    if (type === 'manna' || type === 'water') {
      setSpirit(prev => Math.min(100, prev + 25))
      setMessage(`Received ${label}! Spirit restored.`)
    } else {
      setArmors(prev => [...prev, { type, short: label.charAt(0) }])
      setMessage(`Equipped ${label}! Your defense grows.`)
    }
  }

  const handleHit = (label) => {
    const damage = armors.length > 0 ? 10 : 20
    setSpirit(prev => {
      const next = prev - damage
      if (next <= 0) setGameState('lost')
      return Math.max(0, next)
    })
    setMessage(`Tempted by ${label}! Spirit weakened.`)
  }

  const handleWin = () => {
    setGameState('won')
    setMessage('Hallelujah! You have reached Canaan!')
  }

  const restart = () => {
    setGameKey(k => k + 1)
    setSpirit(100)
    setArmors([])
    setGameState('playing')
    setMessage('Begin your journey to the Promise Land!')
  }

  return (
    <div className="relative w-full h-[600px] bg-sky-400 rounded-3xl overflow-hidden shadow-2xl">
      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 text-white min-w-[200px]">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Spirit Meter</span>
            <span className="text-xs font-bold">{spirit}%</span>
          </div>
          <div className="w-full h-3 bg-gray-800/50 rounded-full overflow-hidden mb-4 border border-white/10">
            <div 
              className={`h-full transition-all duration-500 ${spirit < 30 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-400 to-purple-500'}`} 
              style={{ width: `${spirit}%` }}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {armors.length > 0 ? armors.map((a, i) => (
              <div key={i} className="w-8 h-8 rounded-lg bg-gold-500/80 flex items-center justify-center text-[10px] font-bold border border-gold-400 text-purple-900 shadow-lg">
                {a.short}
              </div>
            )) : (
              <span className="text-[10px] text-white/40 uppercase tracking-tighter italic">No Armor Equipped</span>
            )}
          </div>
        </div>
      </div>

      {/* Message Overlay */}
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-medium tracking-tight italic">
            &quot;{message}&quot;
          </p>
        </div>
      </div>

      {gameState !== 'playing' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md p-6 text-center animate-in fade-in duration-500">
          <div className="max-w-md w-full">
            <h2 className={`text-5xl font-bold mb-4 ${gameState === 'won' ? 'text-gold-400' : 'text-red-500'}`} style={{ fontFamily: 'var(--font-serif)' }}>
              {gameState === 'won' ? 'CANAAN REACHED!' : 'SPIRIT DEPLETED'}
            </h2>
            <p className="text-white/70 text-lg mb-8">
              {gameState === 'won' 
                ? 'Hallelujah! You have successfully navigated the wilderness and reached the Promise Land.' 
                : 'The temptations of the wilderness were too great. Seek revival and try again!'}
            </p>
            <button 
              onClick={restart}
              className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all active:scale-95 ${gameState === 'won' ? 'bg-gold-500 text-purple-900' : 'bg-red-600 text-white'}`}
            >
              {gameState === 'won' ? 'Journey Again' : 'Seek Revival'}
            </button>
          </div>
        </div>
      )}

      <KeyboardControls map={map} key={gameKey}>
        <Canvas shadows>
          <Suspense fallback={<Html center><div className="text-white font-bold">Initializing Game World...</div></Html>}>
            <Sky sunPosition={[100, 20, 100]} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.8} />
            <directionalLight 
              position={[10, 20, 10]} 
              intensity={2.5} 
              castShadow 
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />

            <Physics gravity={[0, -20, 0]}>
              <WildernessRoad />
              <Character playerRef={playerRef} />
              
              {/* Armors */}
              <Pickup position={[0, 1.5, -30]} type="helmet" color="#fbbf24" label="Helmet of Salvation" onPickup={handlePickup} />
              <Pickup position={[3, 1.5, -80]} type="shield" color="#3b82f6" label="Shield of Faith" onPickup={handlePickup} />
              <Pickup position={[-3, 1.5, -130]} type="sword" color="#ef4444" label="Sword of Spirit" onPickup={handlePickup} />
              <Pickup position={[2, 1.5, -180]} type="breastplate" color="#ec4899" label="Breastplate of Righteousness" onPickup={handlePickup} />
              
              {/* Miracles */}
              <Pickup position={[0, 1.5, -60]} type="manna" color="#ffffff" label="Manna from Heaven" onPickup={handlePickup} />
              <Pickup position={[4, 1.5, -150]} type="water" color="#60a5fa" label="Water from Rock" onPickup={handlePickup} />

              {/* Temptations */}
              <Temptation position={[2, 2, -45]} label="Envy" onHit={handleHit} playerRef={playerRef} />
              <Temptation position={[-3, 2, -100]} label="Malice" onHit={handleHit} playerRef={playerRef} />
              <Temptation position={[0, 2, -160]} label="Pride" onHit={handleHit} playerRef={playerRef} />
              <Temptation position={[4, 2, -220]} label="Fornication" onHit={handleHit} playerRef={playerRef} />
              <Temptation position={[-4, 2, -260]} label="Idolatry" onHit={handleHit} playerRef={playerRef} />

              <Goal position={[0, 0, -ROAD_LENGTH + 20]} onWin={handleWin} />
            </Physics>

            <EffectComposer>
              <Bloom luminanceThreshold={1} luminanceSmoothing={0.9} height={300} />
              <DepthOfField focusDistance={0} focalLength={0.02} bounce={0.1} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      
      <Loader />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/50 text-xs uppercase font-bold tracking-widest">
        WASD to Move • SPACE to Jump • Reach Canaan
      </div>
    </div>
  )
}
