// import { FaFaClock, FaFaMapMarkerAlt } from 'react-icons/fa'

// function EventCard({ event }) {
//   const { day, month, title, time, location, onRegister } = event

//   return (
//     <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col md:flex-row">
//       <div className="bg-primary-900 text-white p-6 md:p-8 text-center min-w-[90px] flex flex-col justify-center">
//         <span className="text-4xl font-bold font-serif block">{day}</span>
//         <span className="text-sm uppercase tracking-wider">{month}</span>
//       </div>
//       <div className="p-6 flex-1 flex flex-col justify-between">
//         <div>
//           <h3 className="text-xl font-bold text-primary-900 mb-3">{title}</h3>
//           <p className="text-gray-600 mb-2 flex items-center gap-2">
//             <FaFaClock cFalassName="text-primary-900" />
//             {time}
//           </p>
//           <p className="text-gray-600 flex items-center gap-2">
//             <FaMapMarkerAlt className="text-primary-900" />
//             {location}
//           </p>
//         </div>
//         <button
//           onClick={onRegister}
//           className="mt-4 px-6 py-2 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transition-colors duration-300 text-sm self-start"
//         >
//           Register Now
//         </button>
//       </div>
      
//     </div>

//   )
// }

// export default EventCard

// src/components/EventCard.jsx
import React from 'react'
import { FaCalendar, FaClock, FaMapPin, FaArrowRight } from 'react-icons/fa'

export default function EventCard({ event, onAction }) {
  const { imageUrl, title, startDateDisplay, timeRange, location, startDay, endDay, month, year } = event

  const isMultiDay = startDay !== endDay
  const dateText = isMultiDay ? `${startDay} - ${endDay} ${month} ${year}` : startDateDisplay

  const primary = 'bg-purple-900'
  const secondaryText = 'text-amber-500'

  return (
    <div className="bg-white rounded-xl overflow-hidden border-2 border-purple-900/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-600/30 hover:-translate-y-1 w-full max-w-sm mx-auto">
      <div className="relative h-48 sm:h-56">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = 'https://placehold.co/800x450/6b7280/ffffff/png?text=Event+Image'
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 p-2 bg-purple-950 hover:bg-black to-transparent">
          <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{title}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center text-gray-700">
          <p className="flex items-center gap-2 text-sm font-medium">
            <FaCalendar className="text-accent-300 w-4 h-4" />
            {dateText}
          </p>
          <p className={`flex items-center gap-2 text-sm font-bold `}>
            <FaClock className={`w-4 h-4 ${secondaryText}`} />
            {timeRange}
          </p>
        </div>

        <p className="flex items-center gap-2 text-gray-500 text-sm">
          <FaMapPin className="text-gray-400 w-4 h-4" />
          {location}
        </p>

        <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between space-x-2">
          <button
            onClick={() => onAction('register', event)}
            className={`flex-1 flex items-center justify-center gap-1 px-4 py-2 ${primary} text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md`}
          >
            Register Now
          </button>

          <button
            onClick={() => onAction('details', event)}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Details <FaArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
