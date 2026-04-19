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
  Loader,
  useGLTF,
  useAnimations,
  Circle
} from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider, CylinderCollider, CapsuleCollider } from '@react-three/rapier'
import { Bloom, EffectComposer, DepthOfField } from '@react-three/postprocessing'
import * as THREE from 'three'

// --- Constants ---
const ROAD_WIDTH = 10
const ROAD_LENGTH = 300
const MOVE_SPEED = 10
const JUMP_FORCE = 8

// --- Joshua Character Component ---
const Joshua = ({ age, moving, jumping }) => {
  // Use a more stable human model from Three.js examples
  // Soldier.glb has: Idle, Walk, Run, TPose
  const { scene, animations } = useGLTF('https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/models/gltf/Soldier.glb')
  const group = useRef()
  const { actions } = useAnimations(animations, group)

  // Handle Age Evolutions - Adjusted scale and color
  const ageConfig = {
    boy: { scale: 0.6, color: '#4b2c20' },
    adolescent: { scale: 0.8, color: '#4b2c20' },
    youth: { scale: 1.0, color: '#4b2c20' },
    adult: { scale: 1.1, color: '#4b2c20' },
    advanced: { scale: 1.0, color: '#f3f4f6' },
  }

  const currentAge = ageConfig[age] || ageConfig.adult

  useEffect(() => {
    if (actions) {
      // Soldier animations: 'Idle', 'Walk', 'Run'
      const name = moving ? 'Run' : 'Idle'
      const action = actions[name]
      if (action) {
        // Stop all other actions first
        Object.values(actions).forEach(a => a?.fadeOut(0.2))
        action.reset().fadeIn(0.2).play()
      }
    }
  }, [actions, moving])

  // Apply shadows and material tweaks
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        // For the boy stage, we can make it look younger via scale (already done)
      }
    })
  }, [scene])

  return (
    <group ref={group} scale={currentAge.scale} position={[0, -0.9, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// --- Character Component ---
const Character = ({ playerRef, onCollision, age, mobileMove, onFall }) => {
  const rigidBody = useRef()
  
  useEffect(() => {
    if (playerRef) playerRef.current = rigidBody.current
  }, [playerRef])
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const { camera } = useThree()
  
  // Camera follow state
  const cameraOffset = new THREE.Vector3(0, 5, 10)

  const [isMoving, setIsMoving] = useState(false)
  const [isJumping, setIsJumping] = useState(false)

  useFrame((state, delta) => {
    if (!rigidBody.current) return

    const { forward, backward, left, right, jump } = getKeys()
    
    // Combine Keyboard and Mobile Controls
    const moveForward = forward || mobileMove.forward
    const moveBackward = backward || mobileMove.backward
    const moveLeft = left || mobileMove.left
    const moveRight = right || mobileMove.right
    const shouldJump = jump || mobileMove.jump
    
    // Get current position and velocity
    const charPos = rigidBody.current.translation()
    const velocity = rigidBody.current.linvel()
    
    // Fall Detection
    if (charPos.y < -5) {
      onFall()
    }

    // Calculate target movement
    let xSpeed = 0
    let zSpeed = 0
    
    if (moveForward) zSpeed -= MOVE_SPEED
    if (moveBackward) zSpeed += MOVE_SPEED
    if (moveLeft) xSpeed -= MOVE_SPEED
    if (moveRight) xSpeed += MOVE_SPEED

    // Apply movement with smoothing
    rigidBody.current.setLinvel({ 
      x: xSpeed, 
      y: velocity.y, 
      z: zSpeed 
    }, true)

    // Jump logic - check if touching ground (velocity.y close to 0)
    // We use a small epsilon for better detection
    if (shouldJump && Math.abs(velocity.y) < 0.1) {
      rigidBody.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true)
    }

    // Update animation state
    const moving = Math.abs(xSpeed) > 0.1 || Math.abs(zSpeed) > 0.1
    setIsMoving(moving)
    setIsJumping(Math.abs(velocity.y) > 0.2)

    // Camera follow - smoother interpolation
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
      colliders={false} 
      enabledRotations={[false, false, false]} 
      position={[0, 5, 0]}
      onIntersectionEnter={onCollision}
    >
      <CapsuleCollider args={[0.7, 0.4]} />
      <Suspense fallback={<mesh><capsuleGeometry args={[0.4, 1, 4, 16]} /><meshStandardMaterial color="orange" opacity={0.5} transparent /></mesh>}>
        <Joshua age={age} moving={isMoving} jumping={isJumping} />
      </Suspense>
    </RigidBody>
  )
}

// --- World Components ---
const WorldEnvironment = ({ stage }) => {
  const roadLength = ROAD_LENGTH
  const roadWidth = ROAD_WIDTH

  return (
    <RigidBody type="fixed" colliders="cuboid">
      {/* Ground based on stage */}
      <mesh receiveShadow position={[0, -0.5, -roadLength / 2 + 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roadWidth, roadLength]} />
        <meshStandardMaterial 
          color={
            stage === 1 ? '#e2c391' : // Egypt (Sand)
            stage === 2 ? '#1e40af' : // Red Sea (Water)
            stage === 3 ? '#d2b48c' : // Wilderness (Dry)
            stage === 4 ? '#365314' : // Mountains (Dark Green)
            stage === 5 ? '#a8a29e' : // Jericho (Stone/Gray)
            '#4ade80'                 // Canaan (Lush Green)
          } 
          roughness={1} 
        />
      </mesh>
      
      {/* Walls/Environment Features */}
      {stage === 1 && (
         <group>
            {/* Pyramid-like shapes for Egypt */}
            <mesh position={[8, 2, -20]}><coneGeometry args={[5, 10, 4]} /><meshStandardMaterial color="#c2a371" /></mesh>
            <mesh position={[-8, 1, -50]}><coneGeometry args={[4, 8, 4]} /><meshStandardMaterial color="#c2a371" /></mesh>
         </group>
      )}

      {stage === 2 && (
         <group>
            {/* High Water Walls for Red Sea Crossing */}
            <mesh position={[roadWidth/2 + 2, 5, -roadLength/2 + 10]}>
               <boxGeometry args={[1, 15, roadLength]} />
               <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-roadWidth/2 - 2, 5, -roadLength/2 + 10]}>
               <boxGeometry args={[1, 15, roadLength]} />
               <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
            </mesh>
         </group>
      )}

      {stage === 3 && (
         <group>
            {/* Rocks for Wilderness */}
            <mesh position={[4, 1, -40]}><dodecahedronGeometry args={[2]} /><meshStandardMaterial color="#8b7355" /></mesh>
            <mesh position={[-5, 0.5, -90]}><dodecahedronGeometry args={[1.5]} /><meshStandardMaterial color="#8b7355" /></mesh>
         </group>
      )}

      {stage === 4 && (
         <group>
            {/* Mountains and Forest for Victories */}
            <mesh position={[7, 5, -50]}><coneGeometry args={[4, 15, 3]} /><meshStandardMaterial color="#3f3f37" /></mesh>
            <mesh position={[-7, 4, -80]}><coneGeometry args={[3, 12, 3]} /><meshStandardMaterial color="#3f3f37" /></mesh>
            <mesh position={[5, 2, -120]}><cylinderGeometry args={[0.3, 0.3, 3]} /><meshStandardMaterial color="#4b2c20" /></mesh>
            <mesh position={[5, 4, -120]}><coneGeometry args={[2, 4, 8]} /><meshStandardMaterial color="#064e3b" /></mesh>
         </group>
      )}

      {stage === 5 && (
         <group>
            {/* Jericho Walls */}
            <mesh position={[0, 4, -ROAD_LENGTH + 50]}>
               <boxGeometry args={[ROAD_WIDTH, 8, 2]} />
               <meshStandardMaterial color="#78716c" />
            </mesh>
            <mesh position={[ROAD_WIDTH/2, 6, -ROAD_LENGTH + 50]}>
               <boxGeometry args={[2, 12, 4]} />
               <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[-ROAD_WIDTH/2, 6, -ROAD_LENGTH + 50]}>
               <boxGeometry args={[2, 12, 4]} />
               <meshStandardMaterial color="#57534e" />
            </mesh>
         </group>
      )}

      {stage === 6 && (
         <group>
            {/* Trees for Canaan */}
            <mesh position={[6, 2, -30]}><cylinderGeometry args={[0.5, 0.5, 4]} /><meshStandardMaterial color="#78350f" /></mesh>
            <mesh position={[6, 5, -30]}><sphereGeometry args={[2]} /><meshStandardMaterial color="#166534" /></mesh>
            <mesh position={[-6, 2, -60]}><cylinderGeometry args={[0.5, 0.5, 4]} /><meshStandardMaterial color="#78350f" /></mesh>
            <mesh position={[-6, 5, -60]}><sphereGeometry args={[2]} /><meshStandardMaterial color="#166534" /></mesh>
         </group>
      )}
      
      {/* Side barriers */}
      {stage !== 2 && (
         <group>
            <mesh receiveShadow position={[roadWidth/2 + 1, 0, -roadLength / 2 + 10]}>
               <boxGeometry args={[2, 1, roadLength]} />
               <meshStandardMaterial color="#8b7355" />
            </mesh>
            <mesh receiveShadow position={[-roadWidth/2 - 1, 0, -roadLength / 2 + 10]}>
               <boxGeometry args={[2, 1, roadLength]} />
               <meshStandardMaterial color="#8b7355" />
            </mesh>
         </group>
      )}
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
      colliders="ball"
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
        <Suspense fallback={null}>
           <Text position={[0, 1, 0]} fontSize={0.3} color="white">{label}</Text>
        </Suspense>
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
        const time = performance.now() * 0.001
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
      <Suspense fallback={null}>
         <Text position={[0, 1.2, 0]} fontSize={0.4} color="#ff4444">{label}</Text>
      </Suspense>
    </RigidBody>
  )
}

const Goal = ({ position, onWin, stage }) => {
  const goalLabels = {
    1: 'RED SEA',
    2: 'WILDERNESS',
    3: 'VICTORIES',
    4: 'JERICHO',
    5: 'JORDAN',
    6: 'CANAAN'
  }
  
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid" sensor onIntersectionEnter={onWin}>
      <group>
        <mesh position={[0, 5, 0]}>
          <torusGeometry args={[4, 0.2, 16, 100]} />
          <meshStandardMaterial color="gold" emissive="gold" emissiveIntensity={2} />
        </mesh>
        <Suspense fallback={null}>
           <Text position={[0, 5, 0]} fontSize={1.2} color="gold">{goalLabels[stage] || 'CANAAN'}</Text>
        </Suspense>
        <pointLight color="gold" intensity={15} distance={30} />
        
        {/* Visual "landing circle" on ground */}
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]}>
           <ringGeometry args={[0, 5, 32]} />
           <meshStandardMaterial color="gold" transparent opacity={0.3} />
        </mesh>
      </group>
    </RigidBody>
  )
}

// --- Simple Error Boundary ---
class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="bg-red-900/90 p-6 rounded-2xl border border-red-500 text-white text-center backdrop-blur-md min-w-[300px]">
            <h3 className="text-xl font-bold mb-2">Connection Error</h3>
            <p className="text-xs opacity-70 mb-4">The game could not load all spiritual assets. Please check your connection.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-white text-red-900 px-4 py-2 rounded-lg font-bold text-sm"
            >
              Reconnect
            </button>
          </div>
        </Html>
      )
    }
    return this.props.children
  }
}

// --- Main Game Component ---
export default function PromiseLand({ initialState, onSave }) {
  const [gameKey, setGameKey] = useState(0)
  const playerRef = useRef()
  const [gameState, setGameState] = useState('playing') // playing, won, lost
  const [stage, setStage] = useState(initialState?.stage || 1)
  const [spirit, setSpirit] = useState(initialState?.spirit ?? 100)
  const [lives, setLives] = useState(initialState?.lives ?? 3)
  const [armors, setArmors] = useState(initialState?.armors || [])
  const [message, setMessage] = useState('Joshua in Egypt: Prepare for the Passover!')
  const lastHitTime = useRef(0)

  // Save progress whenever important state changes
  useEffect(() => {
    if (gameState === 'playing' && onSave) {
      onSave({ stage, spirit, armors, lives })
    }
  }, [stage, spirit, armors, lives, gameState, onSave])
  
  // Character Age Logic
  const getAgeByStage = (s) => {
    if (s === 1) return 'boy'
    if (s === 2) return 'adolescent'
    if (s === 3) return 'youth'
    if (s === 4) return 'adult'
    if (s === 5) return 'adult'
    return 'advanced'
  }
  const age = getAgeByStage(stage)

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
    const now = Date.now()
    if (now - lastHitTime.current < 2000) return // 2s cooldown
    lastHitTime.current = now

    const damage = armors.length > 0 ? 10 : 20
    const nextSpirit = spirit - damage

    if (nextSpirit <= 0) {
      if (lives > 1) {
        setLives(l => l - 1)
        setSpirit(100)
        setGameKey(k => k + 1) // Reset current stage position
        setMessage(`Spirit exhausted! One life lost. Joshua perseveres.`)
      } else {
        setLives(0)
        setSpirit(0)
        setGameState('lost')
        setMessage(`All lives lost! Joshua's journey has ended for now.`)
      }
    } else {
      setSpirit(nextSpirit)
      setMessage(`Tempted by ${label}! Spirit weakened.`)
    }
  }

  const handleWin = () => {
    if (stage < 6) {
      setStage(prev => prev + 1)
      setSpirit(100)
      const stageMsgs = {
        2: 'Miracle at the Red Sea: Follow the path!',
        3: 'Into the Wilderness: Joshua leads the way!',
        4: 'Victories in battle: Jericho is near!',
        5: 'The Walls of Jericho: Faith will bring them down!',
        6: 'Entering Canaan: The Promise Land at last!'
      }
      setMessage(stageMsgs[stage + 1])
      setGameKey(k => k + 1) // Reset position for next stage
    } else {
      setGameState('won')
      setMessage('Hallelujah! Joshua has led the people into Canaan!')
    }
  }

  const handleFall = () => {
    if (gameState === 'playing') {
      if (lives > 1) {
        setLives(l => l - 1)
        setSpirit(100)
        setGameKey(k => k + 1) // Reset current stage position
        setMessage(`You fell! One life lost. Try again from the start of this stage.`)
      } else {
        setLives(0)
        setSpirit(0)
        setGameState('lost')
        setMessage('You fell off the path! All lives lost.')
      }
    }
  }

  const restart = () => {
    setGameKey(k => k + 1)
    setSpirit(100)
    setArmors([])
    setStage(1)
    setLives(3)
    setGameState('playing')
    setMessage('Joshua in Egypt: Prepare for the Passover!')
  }

  // Mobile Controls Handling
  const [mobileMove, setMobileMove] = useState({ forward: false, backward: false, left: false, right: false, jump: false })

  return (
    <div className="relative w-full h-[600px] lg:h-screen bg-sky-400 rounded-none overflow-hidden shadow-2xl">
      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none space-y-4">
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 text-white min-w-[200px]">
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Lives</span>
            <div className="flex gap-1.5">
               {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white/20 transition-all duration-500 ${i < lives ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]' : 'bg-gray-800/50'}`} 
                  />
               ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Spirit Meter</span>
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

        <div className="bg-purple-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white min-w-[200px]">
           <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Current Objective</div>
           <div className="text-sm font-bold text-gold-400">
              {stage === 1 && 'Cross the Red Sea'}
              {stage === 2 && 'Navigate the Water'}
              {stage === 3 && 'Survive the Wilderness'}
              {stage === 4 && 'Achieve Victory'}
              {stage === 5 && 'Collapse Jericho Walls'}
              {stage === 6 && 'Inherit Canaan'}
           </div>
           <div className="mt-2 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-bold uppercase tracking-widest">
                 Joshua: {age}
              </span>
              <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 rounded text-[9px] font-bold uppercase tracking-widest">
                 Stage {stage}/6
              </span>
           </div>
        </div>
      </div>

      {/* Message Overlay */}
      <div className="absolute top-6 right-6 z-10 hidden md:block">
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-medium tracking-tight italic">
            &quot;{message}&quot;
          </p>
        </div>
      </div>

      {gameState !== 'playing' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-md p-6 text-center animate-in fade-in duration-500">
          <div className="max-w-md w-full">
            <h2 className={`text-5xl font-bold mb-4 ${gameState === 'won' ? 'text-gold-400' : 'text-red-500'}`} style={{ fontFamily: 'var(--font-serif)' }}>
              {gameState === 'won' ? 'CANAAN REACHED!' : 'JOURNEY FAILED'}
            </h2>
            <p className="text-white/70 text-lg mb-8">
              {gameState === 'won' 
                ? 'Hallelujah! Joshua has successfully led the people into the Promise Land of Canaan.' 
                : 'The trials of the journey were too great. Seek revival and try again!'}
            </p>
            <button 
              onClick={restart}
              className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all active:scale-95 ${gameState === 'won' ? 'bg-gold-500 text-purple-900' : 'bg-red-600 text-white'}`}
            >
              {gameState === 'won' ? 'Restart Journey' : 'Seek Revival'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Controls UI */}
      <div className="absolute bottom-8 right-8 z-20 md:hidden flex flex-col items-center gap-2">
         <button 
            className={`w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center active:bg-white/40`}
            onTouchStart={() => setMobileMove(p => ({ ...p, jump: true }))}
            onTouchEnd={() => setMobileMove(p => ({ ...p, jump: false }))}
         >
            <span className="font-bold text-white">JUMP</span>
         </button>
      </div>

      <div className="absolute bottom-8 left-8 z-20 md:hidden grid grid-cols-3 gap-2">
         <div />
         <button 
            className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center"
            onTouchStart={() => setMobileMove(p => ({ ...p, forward: true }))}
            onTouchEnd={() => setMobileMove(p => ({ ...p, forward: false }))}
         >
            <span className="text-white">↑</span>
         </button>
         <div />
         <button 
            className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center"
            onTouchStart={() => setMobileMove(p => ({ ...p, left: true }))}
            onTouchEnd={() => setMobileMove(p => ({ ...p, left: false }))}
         >
            <span className="text-white">←</span>
         </button>
         <button 
            className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center"
            onTouchStart={() => setMobileMove(p => ({ ...p, backward: true }))}
            onTouchEnd={() => setMobileMove(p => ({ ...p, backward: false }))}
         >
            <span className="text-white">↓</span>
         </button>
         <button 
            className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center"
            onTouchStart={() => setMobileMove(p => ({ ...p, right: true }))}
            onTouchEnd={() => setMobileMove(p => ({ ...p, right: false }))}
         >
            <span className="text-white">→</span>
         </button>
      </div>

      <KeyboardControls map={map} key={gameKey}>
        <Canvas shadows="pcf">
          <Suspense fallback={<Html center><div className="text-white font-bold flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            Initializing Level {stage}...
          </div></Html>}>
            <GameErrorBoundary>
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

              <Physics gravity={[0, -25, 0]}>
                <WorldEnvironment stage={stage} />
                <Character 
                  playerRef={playerRef} 
                  age={age} 
                  onCollision={() => {}} 
                  mobileMove={mobileMove}
                  onFall={handleFall}
                />
                
                {/* Armors & Miracles (Positioned based on stage) */}
                {stage === 1 && (
                   <>
                     <Pickup position={[0, 1, -30]} type="helmet" color="#fbbf24" label="Passover Lamb" onPickup={handlePickup} />
                     <Pickup position={[2, 1, -60]} type="manna" color="#ffffff" label="Unleavened Bread" onPickup={handlePickup} />
                   </>
                )}
                
                {stage === 2 && (
                   <>
                     <Pickup position={[0, 1, -50]} type="water" color="#60a5fa" label="The Dry Path" onPickup={handlePickup} />
                     <Pickup position={[-3, 1, -100]} type="shield" color="#3b82f6" label="Faith in the Deep" onPickup={handlePickup} />
                   </>
                )}

                {stage === 3 && (
                   <>
                     <Pickup position={[3, 1, -80]} type="manna" color="#ffffff" label="Manna" onPickup={handlePickup} />
                     <Pickup position={[-3, 1, -130]} type="sword" color="#ef4444" label="Sword of Truth" onPickup={handlePickup} />
                   </>
                )}

                {stage === 4 && (
                   <>
                     <Pickup position={[2, 1, -180]} type="breastplate" color="#ec4899" label="Jericho Victory" onPickup={handlePickup} />
                   </>
                )}

                {stage === 5 && (
                   <>
                     <Pickup position={[0, 1, -150]} type="sword" color="#ef4444" label="Seven Trumpets" onPickup={handlePickup} />
                   </>
                )}

                {/* Temptations */}
                <Temptation position={[2, 1.2, -45]} label="Fear" onHit={handleHit} playerRef={playerRef} />
                <Temptation position={[-3, 1.2, -100]} label="Murmuring" onHit={handleHit} playerRef={playerRef} />
                <Temptation position={[0, 1.2, -160]} label="Idolatry" onHit={handleHit} playerRef={playerRef} />

                <Goal position={[0, 0, -ROAD_LENGTH + 20]} onWin={handleWin} stage={stage} />
              </Physics>

              <EffectComposer>
                <Bloom luminanceThreshold={1} luminanceSmoothing={0.9} height={300} />
              </EffectComposer>
            </GameErrorBoundary>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      
      <Loader />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/50 text-xs uppercase font-bold tracking-widest hidden md:block">
        WASD to Move • SPACE to Jump • Lead the people
      </div>
    </div>
  )
}