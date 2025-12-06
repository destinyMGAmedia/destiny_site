import { Link } from 'react-router-dom'
import { FaPlayCircle, FaHeart, FaPrayingHands, FaLightbulb } from 'react-icons/fa'

function QuickActions() {
  const actions = [
    {
      icon: FaPlayCircle,
      title: 'Live Stream',
      link: '/live',
      color: 'text-accent-300',
    },
    {
      icon: FaHeart,
      title: 'Give Online',
      link: '/giving',
      color: 'text-accent-300',
    },
    {
      icon: FaPrayingHands,
      title: 'Submit Prayer',
      link: '/prayer',
      color: 'text-accent-300',
    },
    {
      icon: FaLightbulb,
      title: 'Share Testimony',
      link: '/testimonies',
      color: 'text-accent-300',
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.link}
                className="bg-white p-8 rounded-xl text-center border-2 border-purple-900 border-opacity-30 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <Icon className={`text-5xl mx-auto mb-4 ${action.color} group-hover:scale-110 transition-transform duration-300`} />
                <h3 className="text-xl font-semibold text-primary-900">{action.title}</h3>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default QuickActions

