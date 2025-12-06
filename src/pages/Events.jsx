// src/pages/EventsPage.jsx
import React, { useState } from 'react'
import EventCard from '../components/EventCard'
import EventDetailModal from '../components/EventDetailModal'
import ActionAlert from '../components/ActionAlert'
import { events } from '../Data'  // ← now pulling from data.js

export default function Events() {
  const [actionMessage, setActionMessage] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const handleCardAction = (actionType, event) => {
    if (actionType === 'register') {
      setActionMessage(`Successfully attempted to register for "${event.title}". (In a real app, this would initiate the registration process)`)
    } else if (actionType === 'details') {
      setSelectedEvent(event)
    }
  }

  const closeActionAlert = () => setActionMessage(null)
  const closeDetailModal = () => setSelectedEvent(null)

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 sm:p-12 font-sans">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Discover Events</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Explore the vibrant social scene around you, from festivals to tech summits.</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onAction={handleCardAction} />
          ))}
        </main>
      </div>

      <ActionAlert message={actionMessage} onClose={closeActionAlert} />
      <EventDetailModal event={selectedEvent} onClose={closeDetailModal} />
    </>
  )
}
