'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle, RefreshCw, Info, Trophy } from 'lucide-react'

const WORDS = [
  'DESTINY', 'MISSION', 'VISION', 'INTEGRITY', 'PIONEER', 'LEADERSHIP', 
  'EXCELLENCE', 'ACTION', 'DEVOTION', 'CHAMPION', 'CHAMPIONS', 'VICTORY', 
  'ASSEMBLY', 'OASIS', 'FELLOWSHIP', 'WORSHIP', 'DIGNIFIED', 'REIGN',
  'TRANSFORM', 'NATIONS', 'BUILDING', 'PASTURES', 'DYNAMO'
]

const GRID_SIZE = 12

export default function BibleWordSearch({ initialState, onSave }) {
  const [grid, setGrid] = useState(initialState?.grid || [])
  const [foundWords, setFoundWords] = useState(initialState?.foundWords || [])
  const [foundPaths, setFoundPaths] = useState(initialState?.foundPaths || [])
  const [selecting, setSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectionPath, setSelectionPath] = useState([])
  const [gameWon, setGameWon] = useState(initialState?.gameWon || false)
  const gridRef = useRef(null)

  // Save progress whenever important state changes
  useEffect(() => {
    if (grid.length > 0 && onSave) {
      onSave({ grid, foundWords, foundPaths, gameWon })
    }
  }, [grid, foundWords, foundPaths, gameWon, onSave])

  const generateGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''))
    const directions = [
      [0, 1], [1, 0], [1, 1], [-1, 1],
      [0, -1], [-1, 0], [-1, -1], [1, -1]
    ]

    const canPlace = (word, r, c, dir) => {
      for (let i = 0; i < word.length; i++) {
        const row = r + i * dir[0]
        const col = c + i * dir[1]
        if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false
        if (newGrid[row][col] !== '' && newGrid[row][col] !== word[i]) return false
      }
      return true
    }

    const placeWord = (word) => {
      let placed = false
      let attempts = 0
      while (!placed && attempts < 150) {
        attempts++
        const dir = directions[Math.floor(Math.random() * directions.length)]
        const r = Math.floor(Math.random() * GRID_SIZE)
        const c = Math.floor(Math.random() * GRID_SIZE)

        if (canPlace(word, r, c, dir)) {
          for (let i = 0; i < word.length; i++) {
            newGrid[r + i * dir[0]][c + i * dir[1]] = word[i]
          }
          placed = true
        }
      }
    }

    WORDS.sort((a, b) => b.length - a.length).forEach(placeWord)

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)]
        }
      }
    }

    setGrid(newGrid)
    setFoundWords([])
    setFoundPaths([])
    setGameWon(false)
  }, [])

  useEffect(() => {
    if (grid.length === 0) {
      generateGrid()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPath = (start, end) => {
    if (!start || !end) return []
    const dr = end.r - start.r
    const dc = end.c - start.c
    const dist = Math.max(Math.abs(dr), Math.abs(dc))
    if (dist === 0) return [start]
    
    const stepR = dr === 0 ? 0 : dr / dist
    const stepC = dc === 0 ? 0 : dc / dist
    
    if (!Number.isInteger(stepR) || !Number.isInteger(stepC) || Math.abs(stepR) > 1 || Math.abs(stepC) > 1) {
      return [start]
    }

    const path = []
    for (let i = 0; i <= dist; i++) {
      path.push({ r: start.r + i * stepR, c: start.c + i * stepC })
    }
    return path
  }

  const handleMouseDown = (r, c) => {
    if (gameWon) return
    setSelecting(true)
    setSelectionStart({ r, c })
    setSelectionPath([{ r, c }])
  }

  const handleMouseEnter = (r, c) => {
    if (selecting) {
      setSelectionPath(getPath(selectionStart, { r, c }))
    }
  }

  const handleMouseUp = useCallback(() => {
    if (!selecting) return
    setSelecting(false)
    
    const word = selectionPath.map(p => grid[p.r][p.c]).join('')
    const reversedWord = word.split('').reverse().join('')
    
    let matchedWord = null
    if (WORDS.includes(word) && !foundWords.includes(word)) matchedWord = word
    else if (WORDS.includes(reversedWord) && !foundWords.includes(reversedWord)) matchedWord = reversedWord

    if (matchedWord) {
      const newFoundWords = [...foundWords, matchedWord]
      setFoundWords(newFoundWords)
      setFoundPaths([...foundPaths, selectionPath])
      if (newFoundWords.length === WORDS.length) setGameWon(true)
    }
    
    setSelectionPath([])
    setSelectionStart(null)
  }, [selecting, selectionPath, grid, foundWords, foundPaths])

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (selecting) handleMouseUp()
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [selecting, handleMouseUp])

  const isCellSelected = (r, c) => selectionPath.some(p => p.r === r && p.c === c)
  const isCellInFoundPath = (r, c) => foundPaths.some(path => path.some(p => p.r === r && p.c === c))

  return (
    <div className="flex flex-col gap-10 select-none w-full min-h-screen bg-lavender-50/30">
      {/* Grid Side (Top) */}
      <div className="w-full py-12 flex items-center justify-center bg-white/40 backdrop-blur-md border-b border-purple-100">
        <div 
          ref={gridRef}
          className="grid grid-cols-12 gap-1 bg-purple-100 p-3 md:p-6 rounded-[2.5rem] shadow-2xl border-8 border-white cursor-crosshair mx-auto overflow-hidden touch-none"
          style={{ width: 'min(90vw, 600px)', aspectRatio: '1/1' }}
        >
          {grid.map((row, r) => 
            row.map((letter, c) => (
              <div 
                key={`${r}-${c}`}
                onMouseDown={() => handleMouseDown(r, c)}
                onMouseEnter={() => handleMouseEnter(r, c)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const el = document.elementFromPoint(touch.clientX, touch.clientY);
                  if (el) handleMouseDown(r, c);
                }}
                className={`
                  flex items-center justify-center rounded-lg font-black text-xs md:text-xl transition-all duration-150
                  ${isCellSelected(r, c) ? 'bg-gold-500 text-purple-900 scale-110 z-20 shadow-lg' : 
                    isCellInFoundPath(r, c) ? 'bg-purple-900 text-white font-bold' : 'bg-white text-gray-700 hover:bg-purple-50'}
                `}
              >
                {letter}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Word List Side (Bottom) */}
      <div className="w-full max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-3xl font-bold text-purple-900" style={{ fontFamily: 'var(--font-serif)' }}>
                      Find the Words
                   </h3>
                   <p className="text-gray-500 mt-2">Discover the vision and mission of DMGA hidden in the grid.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-purple-50">
                   <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Progress</div>
                      <div className="text-2xl font-black text-purple-900">{foundWords.length}/{WORDS.length}</div>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-gold-500 flex items-center justify-center text-purple-900 font-bold">
                      {Math.round((foundWords.length / WORDS.length) * 100)}%
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {WORDS.map((word) => (
                 <div 
                   key={word} 
                   className={`
                     px-4 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all border flex items-center gap-2
                     ${foundWords.includes(word) ? 
                       'bg-green-100 border-green-200 text-green-700 opacity-60' : 
                       'bg-white border-purple-100 text-purple-900 shadow-sm'}
                   `}
                 >
                   {foundWords.includes(word) ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-200" />}
                   {word}
                 </div>
               ))}
             </div>
          </div>

          <div className="space-y-6">
             {gameWon ? (
               <div className="p-8 bg-gradient-to-br from-gold-500 to-orange-400 rounded-[2.5rem] text-center shadow-2xl animate-in zoom-in duration-500">
                 <Trophy size={64} className="text-purple-900 mx-auto mb-4" />
                 <h4 className="text-purple-900 font-black text-3xl mb-2">VICTORY!</h4>
                 <p className="text-purple-900/70 font-bold mb-8 text-lg">You found all the words from our mission!</p>
                 <button 
                   onClick={generateGrid}
                   className="w-full bg-purple-900 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-95"
                 >
                   New Puzzle
                 </button>
               </div>
             ) : (
                <div className="card p-8 border-purple-100 bg-white shadow-xl rounded-[2.5rem]">
                   <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                      <RefreshCw size={18} className="text-gold-600" /> Game Controls
                   </h4>
                   <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                      Click and drag (or touch and drag) over letters to select words. Words can be horizontal, vertical, or diagonal.
                   </p>
                   <button 
                      onClick={generateGrid}
                      className="w-full py-4 bg-purple-100 text-purple-700 rounded-2xl font-bold hover:bg-gold-500 hover:text-purple-900 transition-all shadow-sm flex items-center justify-center gap-2"
                   >
                      <RefreshCw size={18} /> Reset Grid
                   </button>
                </div>
             )}
             
             <div className="p-6 bg-purple-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <p className="text-xs leading-relaxed italic opacity-80 relative z-10">
                  &quot;Destiny Mission Global Assembly is more than a church; it is an Oasis for all, raising champions through excellence and integrity.&quot;
                </p>
             </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e9d5ff;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}
