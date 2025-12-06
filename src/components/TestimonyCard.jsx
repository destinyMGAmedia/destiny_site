import { useState } from 'react'

function TestimonyCard({ testimony }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { image, title, author, text, fullText } = testimony

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-purple-900 border-opacity-30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <img
        src={image || '/images/userPlaceHolder.jpg'}
        alt={title}
        className="w-full h-52 object-contain"
      />
      <div className="p-6">
        <h4 className="text-xl font-bold text-primary-900 mb-2">{title}</h4>
        <p className="text-gray-500 text-sm mb-3">{author}</p>
        <p className="text-gray-700 text-sm leading-relaxed">
          {isExpanded && fullText ? fullText : text}
          {fullText && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-accent-300 font-semibold ml-2 hover:underline"
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </p>
      </div>
    </div>
  )
}

export default TestimonyCard

