'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle, RefreshCw, Info, Trophy } from 'lucide-react'

const WORDS = [
  'DESTINY', 'MISSION', 'VISION', 'INTEGRITY', 'PIONEER', 'LEADERSHIP', 
  'EXCELLENCE', 'ACTION', 'DEVOTION', 'CHAMPION', 'VICTORY', 'ASSEMBLY', 
  'OASIS', 'FELLOWSHIP', 'WORSHIP', 'DIGNIFIED', 'DYNAMO'
]

const GRID_SIZE = 12

export default function BibleWordSearch() {
  const [grid, setGrid] = useState([])
  const [foundWords, setFoundWords] = useState([])
  const [foundPaths, setFoundPaths] = useState([])
  const [selecting, setSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectionPath, setSelectionPath] = useState([])
  const [gameWon, setGameWon] = useState(false)
  const gridRef = useRef(null)

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
    generateGrid()
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
    <div className="flex flex-col lg:flex-row gap-10 select-none">
      {/* Word Search Grid */}
      <div className="flex-1">
        <div 
          ref={gridRef}
          className="grid grid-cols-12 gap-1 bg-purple-100 p-2 rounded-2xl shadow-xl border-4 border-purple-200 cursor-crosshair mx-auto overflow-hidden"
          style={{ maxWidth: '500px', aspectRatio: '1/1' }}
        >
          {grid.map((row, r) => 
            row.map((letter, c) => (
              <div 
                key={`${r}-${c}`}
                onMouseDown={() => handleMouseDown(r, c)}
                onMouseEnter={() => handleMouseEnter(r, c)}
                className={`
                  flex items-center justify-center rounded-lg font-black text-sm md:text-base transition-all duration-150
                  ${isCellSelected(r, c) ? 'bg-gold-500 text-purple-900 scale-110 z-20 shadow-lg' : 
                    isCellInFoundPath(r, c) ? 'bg-purple-900/10 text-purple-900 font-bold' : 'bg-white text-gray-700 hover:bg-purple-50'}
                `}
              >
                {letter}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Word List and Status */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="card p-6 border-purple-100 bg-white/50 backdrop-blur-sm shadow-xl flex-1">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-purple-900 flex items-center gap-2">
                <Info size={18} className="text-gold-600" /> Word List
             </h3>
             <span className="text-xs font-black px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {foundWords.length} / {WORDS.length}
             </span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {WORDS.map((word) => (
              <div 
                key={word} 
                className={`
                  px-3 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all border
                  ${foundWords.includes(word) ? 
                    'bg-green-100 border-green-200 text-green-700 line-through opacity-60' : 
                    'bg-white border-purple-50 text-gray-500'}
                `}
              >
                {word}
              </div>
            ))}
          </div>

          {gameWon ? (
            <div className="mt-8 p-6 bg-gold-500 rounded-2xl text-center shadow-2xl animate-bounce">
              <Trophy size={48} className="text-purple-900 mx-auto mb-3" />
              <h4 className="text-purple-900 font-black text-xl mb-1">AMAZING!</h4>
              <p className="text-purple-800 text-sm font-bold mb-4">You found all the words!</p>
              <button 
                onClick={generateGrid}
                className="bg-purple-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-purple-800 transition-colors"
              >
                Play Again
              </button>
            </div>
          ) : (
             <button 
                onClick={generateGrid}
                className="w-full mt-8 py-3 flex items-center justify-center gap-2 text-sm font-black text-purple-700 bg-purple-100 hover:bg-gold-500 hover:text-purple-900 rounded-xl transition-all shadow-sm"
             >
                <RefreshCw size={16} /> New Puzzle
             </button>
          )}
        </div>
        
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
           <p className="text-[10px] text-purple-800 leading-relaxed italic">
             &quot;Find words from our About page: our vision, mission, core values, and the spirit of Destiny Mission Global Assembly.&quot;
           </p>
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
