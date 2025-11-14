import EventCard from '../components/EventCard'

function Events() {
  const events = [
    {
      day: '15',
      month: 'NOV',
      title: 'Annual Harvest Crusade',
      time: '4:00 PM – 8:00 PM',
      location: 'Main Auditorium, Lagos',
      onRegister: () => {
        // Handle registration
        alert('Registration form will open here')
      },
    },
    {
      day: '22',
      month: 'NOV',
      title: 'Youth Ablaze Conference',
      time: '9:00 AM – 3:00 PM',
      location: 'Youth Hall',
      onRegister: () => {
        alert('Registration form will open here')
      },
    },
    {
      day: '01',
      month: 'DEC',
      title: 'Christmas Carol Service',
      time: '6:00 PM',
      location: 'Main Sanctuary',
      onRegister: () => {
        alert('Registration form will open here')
      },
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50 pt-24">
      <div className="bg-gradient-to-r from-primary-900 to-pink-600 text-white py-16 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl opacity-90">
            Join our special gatherings and experience the power of fellowship
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <EventCard key={index} event={event} />
          ))}
        </div>
      </div>
    </main>
  )
}

export default Events
