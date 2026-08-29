'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle, RefreshCw, Info, Trophy } from 'lucide-react'

const DEFAULT_WORDS = [
  'DESTINY', 'MISSION', 'VISION', 'INTEGRITY', 'PIONEER', 'LEADERSHIP',
  'EXCELLENCE', 'ACTION', 'DEVOTION', 'CHAMPION', 'VICTORY',
  'ASSEMBLY', 'OASIS', 'FELLOWSHIP', 'WORSHIP', 'DIGNIFIED', 'REIGN',
  'TRANSFORM', 'NATIONS', 'BUILDING', 'PASTURES', 'DYNAMO'
]

const GRID_SIZE = 12

export default function BibleWordSearch({ initialState, onSave, words: wordsProp }) {
  const WORDS = (wordsProp && wordsProp.length > 0) ? wordsProp : DEFAULT_WORDS

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
    <div className="flex flex-col gap-6 sm:gap-10 select-none w-full bg-lavender-50/30">
      {/* Grid Side (Top) */}
      <div className="w-full py-6 sm:py-10 flex items-center justify-center bg-white/40 backdrop-blur-md border-b border-purple-100">
        <div
          ref={gridRef}
          className="grid grid-cols-12 gap-0.5 sm:gap-1 bg-purple-100 p-2 sm:p-4 md:p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border-4 sm:border-8 border-white cursor-crosshair mx-auto overflow-hidden touch-none"
          style={{ width: 'min(96vw, 600px)', aspectRatio: '1/1' }}
          onTouchStart={(e) => {
            e.preventDefault()
            const touch = e.touches[0]
            const el = document.elementFromPoint(touch.clientX, touch.clientY)
            const r = parseInt(el?.dataset?.r)
            const c = parseInt(el?.dataset?.c)
            if (!isNaN(r) && !isNaN(c)) handleMouseDown(r, c)
          }}
          onTouchMove={(e) => {
            e.preventDefault()
            const touch = e.touches[0]
            const el = document.elementFromPoint(touch.clientX, touch.clientY)
            const r = parseInt(el?.dataset?.r)
            const c = parseInt(el?.dataset?.c)
            if (!isNaN(r) && !isNaN(c)) handleMouseEnter(r, c)
          }}
          onTouchEnd={handleMouseUp}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => (
              <div
                key={`${r}-${c}`}
                data-r={r}
                data-c={c}
                onMouseDown={() => handleMouseDown(r, c)}
                onMouseEnter={() => handleMouseEnter(r, c)}
                className={`
                  flex items-center justify-center rounded-md font-black text-[10px] sm:text-sm md:text-base transition-all duration-150
                  ${isCellSelected(r, c) ? 'bg-gold-500 text-purple-900 scale-110 z-20 shadow-lg' :
                    isCellInFoundPath(r, c) ? 'bg-purple-900 text-white font-bold' : 'bg-white text-gray-700'}
                `}
              >
                {letter}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Word List Side (Bottom) */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-purple-900" style={{ fontFamily: 'var(--font-serif)' }}>
                  Find the Words
                </h3>
                <p className="text-gray-500 mt-1 text-sm sm:text-base">Discover DMGA&apos;s vision and mission hidden in the grid.</p>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm border border-purple-50 shrink-0 ml-4">
                <div className="text-right">
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Progress</div>
                  <div className="text-xl sm:text-2xl font-black text-purple-900">{foundWords.length}/{WORDS.length}</div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gold-500 flex items-center justify-center text-purple-900 font-bold text-sm">
                  {Math.round((foundWords.length / WORDS.length) * 100)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {WORDS.map((word) => (
                <div
                  key={word}
                  className={`
                    px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5
                    ${foundWords.includes(word) ?
                      'bg-green-100 border-green-200 text-green-700 opacity-60' :
                      'bg-white border-purple-100 text-purple-900 shadow-sm'}
                  `}
                >
                  {foundWords.includes(word) ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-purple-200 shrink-0" />}
                  <span className="truncate">{word}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {gameWon ? (
              <div className="p-6 sm:p-8 bg-gradient-to-br from-gold-500 to-orange-400 rounded-[2rem] sm:rounded-[2.5rem] text-center shadow-2xl animate-in zoom-in duration-500">
                <Trophy size={48} className="text-purple-900 mx-auto mb-3 sm:mb-4" />
                <h4 className="text-purple-900 font-black text-2xl sm:text-3xl mb-2">VICTORY!</h4>
                <p className="text-purple-900/70 font-bold mb-6 sm:mb-8 text-base sm:text-lg">You found all the words from our mission!</p>
                <button
                  onClick={generateGrid}
                  className="w-full bg-purple-900 text-white py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:shadow-xl transition-all active:scale-95"
                >
                  New Puzzle
                </button>
              </div>
            ) : (
              <div className="card p-6 sm:p-8 border-purple-100 bg-white shadow-xl rounded-[2rem] sm:rounded-[2.5rem]">
                <h4 className="font-bold text-purple-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <RefreshCw size={16} className="text-gold-600" /> How to Play
                </h4>
                <p className="text-sm text-gray-500 mb-5 sm:mb-8 leading-relaxed">
                  Drag over letters to select words. Works with mouse or touch. Words can be horizontal, vertical, or diagonal.
                </p>
                <button
                  onClick={generateGrid}
                  className="w-full py-3 sm:py-4 bg-purple-100 text-purple-700 rounded-2xl font-bold hover:bg-gold-500 hover:text-purple-900 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> Reset Grid
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
