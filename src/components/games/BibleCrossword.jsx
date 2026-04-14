'use client'
import React, { useState, useEffect } from 'react'
import { CheckCircle, RefreshCw, Trophy } from 'lucide-react'

const CROSSWORD_DATA = {
  grid: [
    ['V', 'I', 'S', 'I', 'O', 'N', '', '', '', ''],
    ['I', '', '', '', '', '', '', '', '', ''],
    ['N', '', 'P', 'I', 'O', 'N', 'E', 'E', 'R', ''],
    ['T', '', '', '', '', '', '', '', '', ''],
    ['E', 'X', 'C', 'E', 'L', 'L', 'E', 'N', 'C', 'E'],
    ['G', '', '', '', '', '', '', '', '', ''],
    ['R', '', 'A', 'C', 'T', 'I', 'O', 'N', '', ''],
    ['I', '', '', '', '', '', '', '', '', ''],
    ['T', '', 'D', 'E', 'V', 'O', 'T', 'I', 'O', 'N'],
    ['Y', '', '', '', '', '', '', '', '', ''],
  ],
  clues: [
    { number: 1, direction: 'Across', clue: 'We see beyond the present (VIP LEAD)', answer: 'VISION', row: 0, col: 0 },
    { number: 1, direction: 'Down', clue: 'Transparency and honesty (VIP LEAD)', answer: 'INTEGRITY', row: 0, col: 0 },
    { number: 2, direction: 'Across', clue: 'Boldly venturing into new territories (VIP LEAD)', answer: 'PIONEER', row: 2, col: 2 },
    { number: 3, direction: 'Across', clue: 'Honoring God with distinction (VIP LEAD)', answer: 'EXCELLENCE', row: 4, col: 0 },
    { number: 4, direction: 'Across', clue: 'Doers of the Word (VIP LEAD)', answer: 'ACTION', row: 6, col: 2 },
    { number: 5, direction: 'Across', clue: 'Unwavering commitment to God (VIP LEAD)', answer: 'DEVOTION', row: 8, col: 2 },
  ]
}

export default function BibleCrossword({ onSave, initialState }) {
  const [userGrid, setUserGrid] = useState(initialState?.userGrid || 
    CROSSWORD_DATA.grid.map(row => row.map(cell => cell === '' ? null : ''))
  )
  const [gameWon, setGameWon] = useState(initialState?.gameWon || false)

  useEffect(() => {
    if (onSave) onSave({ userGrid, gameWon })
  }, [userGrid, gameWon, onSave])

  const handleCellChange = (r, c, val) => {
    if (gameWon) return
    const newVal = val.toUpperCase().slice(-1)
    const newGrid = [...userGrid]
    newGrid[r] = [...newGrid[r]]
    newGrid[r][c] = newVal
    setUserGrid(newGrid)

    // Check if won
    const isComplete = CROSSWORD_DATA.grid.every((row, rIdx) => 
      row.every((cell, cIdx) => cell === '' || userGrid[rIdx][cIdx] === cell || (rIdx === r && cIdx === c && newVal === cell))
    )
    if (isComplete) setGameWon(true)
  }

  const resetGame = () => {
    setUserGrid(CROSSWORD_DATA.grid.map(row => row.map(cell => cell === '' ? null : '')))
    setGameWon(false)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Grid */}
      <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-purple-100 mx-auto lg:mx-0">
        <div className="grid grid-cols-10 gap-1">
          {userGrid.map((row, r) => 
            row.map((cell, c) => (
              <div 
                key={`${r}-${c}`}
                className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded ${cell === null ? 'bg-purple-900/5' : 'bg-white border-2 border-purple-100 shadow-sm'}`}
              >
                {cell !== null && (
                  <input
                    type="text"
                    className={`w-full h-full text-center font-black uppercase focus:outline-none focus:bg-purple-50 transition-colors ${gameWon ? 'text-green-600 bg-green-50' : 'text-purple-900'}`}
                    value={cell}
                    onChange={(e) => handleCellChange(r, c, e.target.value)}
                    disabled={gameWon}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clues */}
      <div className="flex-1 space-y-6">
        <div className="card p-6 border-purple-100">
          <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-gold-500" /> Clues
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {CROSSWORD_DATA.clues.map((clue, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded bg-purple-100 text-purple-900 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                  {clue.number}{clue.direction[0]}
                </span>
                <div>
                  <p className="text-xs font-bold text-gray-900">{clue.direction} {clue.number}</p>
                  <p className="text-sm text-gray-500">{clue.clue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {gameWon ? (
          <div className="p-6 bg-green-100 rounded-3xl text-center animate-in zoom-in">
            <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
            <h4 className="text-green-900 font-bold">Perfect!</h4>
            <p className="text-green-700 text-xs mb-4">You&apos;ve mastered the DMGA core values.</p>
            <button onClick={resetGame} className="btn-secondary btn-sm w-full">Play Again</button>
          </div>
        ) : (
          <button onClick={resetGame} className="btn-secondary btn-sm w-full flex items-center justify-center gap-2">
            <RefreshCw size={14} /> Reset Puzzle
          </button>
        )}
      </div>
    </div>
  )
}
