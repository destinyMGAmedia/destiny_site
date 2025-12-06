// src/pages/Programmes.jsx

import React from "react"
import { programmes, weeklySchedule, specialEvents } from "../Data"

function Programmes() {
  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-900 to-pink-600 text-white py-32 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Our Programmes</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Discover opportunities to grow, serve, and fulfill your purpose
          </p>
        </div>
      </div>

      {/* Weekly Schedule */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">Weekly Schedule</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>

            <div className="grid md:grid-cols-2 gap-6">
              {weeklySchedule.map((event) => (
                <div 
                  key={event.title}
                  className="bg-gray-50 rounded-xl p-8 border hover:shadow-xl hover:shadow-purple-600/20 transition duration-300 border-l-4 border-purple-600"
                >
                  <h3 className="text-2xl font-bold text-purple-900 mb-4">{event.title}</h3>

                  <div className="space-y-2 mb-4">
                    <p className="text-gray-700 flex items-center">
                      <span className="mr-2">📅</span>{event.date}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <span className="mr-2">⏰</span>{event.time}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <span className="mr-2">📍</span>{event.location}
                    </p>
                  </div>

                  <p className="text-gray-600">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Church Programmes / Activities */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">Our Activities</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programmes.map((programme) => (
                <div 
                  key={programme.title}
                  className="bg-white rounded-xl p-8 border-2 border-purple-900/30 hover:shadow-xl hover:shadow-purple-800/20 transition duration-300"
                >
                  <div className="text-4xl text-primary">
                     {programme.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-purple-900 mb-3">{programme.title}</h3>
                  <p className="text-gray-700 mb-4">{programme.description}</p>

                  <div className="space-y-2">
                    {programme.schedule.map((item) => (
                      <div key={item} className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2 text-purple-600">•</span>{item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Special Events */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">Special Events</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialEvents.map((event) => (
                <div 
                  key={event.title}
                  className="bg-gray-50 rounded-xl p-6 border-2 border-purple-800/30 hover:shadow-xl hover:shadow-purple-900/20 text-center transition duration-300"
                >
                  <div className="text-5xl mb-4">{event.icon}</div>
                  <h3 className="text-xl font-bold text-purple-900 mb-3">{event.title}</h3>
                  <p className="text-gray-700 text-sm">{event.description}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-purple-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Get Involved</h2>
            <p className="text-xl text-purple-200 mb-8">
              Find your place in our community and use your gifts to serve others
            </p>

            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg"
            >
              Join a Programme
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Programmes
