import { FaClock, FaMapMarkerAlt } from 'react-icons/fa'

function EventCard({ event }) {
  const { day, month, title, time, location, onRegister } = event

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col md:flex-row">
      <div className="bg-primary-900 text-white p-6 md:p-8 text-center min-w-[90px] flex flex-col justify-center">
        <span className="text-4xl font-bold font-serif block">{day}</span>
        <span className="text-sm uppercase tracking-wider">{month}</span>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-primary-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-2 flex items-center gap-2">
            <FaClock className="text-primary-900" />
            {time}
          </p>
          <p className="text-gray-600 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary-900" />
            {location}
          </p>
        </div>
        <button
          onClick={onRegister}
          className="mt-4 px-6 py-2 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transition-colors duration-300 text-sm self-start"
        >
          Register Now
        </button>
      </div>
    </div>
  )
}

export default EventCard

