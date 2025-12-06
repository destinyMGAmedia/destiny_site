// src/components/ActionAlert.jsx
import React from 'react'
import { FaTimes } from 'react-icons/fa'

export default function ActionAlert({ message, onClose }) {
  if (!message) return null

  const primary = 'bg-blue-600'
  const primaryText = 'text-blue-600'

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 duration-300">
        <div className="flex justify-between items-center mb-4">
          <h4 className={`text-lg font-bold ${primaryText}`}>Action Status</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-blue-600 transition"
            aria-label="Close message"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className={`w-full px-4 py-2 ${primary} text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300`}
        >
          Close
        </button>
      </div>
    </div>
  )
}
