// src/components/EventDetailModal.jsx
import React from 'react'
import { FaTimes, FaCalendar, FaClock, FaMapPin } from 'react-icons/fa'

export default function EventDetailModal({ event, onClose }) {
  if (!event) return null

  const {
    imageUrl,
    title,
    startDateDisplay,
    endDateDisplay,
    timeRange,
    location,
    startDay,
    endDay,
    month,
    description,
  } = event

  const isMultiDay = startDay !== endDay
  const fullDateText = isMultiDay ? `${startDateDisplay} - ${endDateDisplay}` : startDateDisplay
  const dayText = isMultiDay ? `${startDay} - ${endDay}` : startDay
  const modalPrimaryText = 'text-cyan-800'

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4 sm:p-8 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-gray-700 hover:text-gray-900 transition z-10 shadow-md"
          aria-label="Close event details"
        >
          <FaTimes size={24} />
        </button>

        <div className="relative h-48 sm:h-64">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover rounded-t-xl"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = 'https://placehold.co/800x450/6b7280/ffffff/png?text=Event+Image'
            }}
          />
        </div>

        <div className="p-6 space-y-6">
          <h2 className={`text-3xl font-extrabold ${modalPrimaryText} border-b pb-3`}>{title}</h2>

          <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-lg">
            <div className="flex flex-col items-center justify-center text-center bg-blue-600 text-white p-3 rounded-lg min-w-[80px]">
              <span className="text-2xl font-bold leading-none">{dayText}</span>
              <span className="text-xs uppercase tracking-wider">{month}</span>
            </div>

            <div className="flex-1 space-y-1">
              <p className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <FaCalendar cFalassNamFae="text-blue-600 w-5 h-5" />
                {fullDateText}
              </p>
              <p className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <FaClock className="text-amber-500 w-5 h-5" />
                {timeRange}
              </p>
            </div>
          </div>

          <p className="flex items-start gap-2 text-lg text-gray-700">
            <FaMapPin className="text-gray-500 w-5 h-5 mt-1 flex-shrink-0" />
            <span className="font-medium">{location}</span>
          </p>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">About the Event</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
