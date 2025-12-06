import React from "react";
import { programmes, weeklySchedule, specialEvents } from "../Data";

// Import icons
import { FaMusic, FaBook, FaUsers } from "react-icons/fa"; // remove FaMessageCircle
import { LuMessageCircle, LuHandHelping, LuChurch } from "react-icons/lu";
import { TbMoodKid, TbBuildingCircus, TbConfetti, TbCalendarStar } from "react-icons/tb";
import { MdWoman, MdMan } from "react-icons/md";


// Map string names to components
const iconMap = {
  FaMusic: FaMusic,
  FaBook: FaBook,
  FaUsers: FaUsers,
  FaMessageCircle: LuMessageCircle, // point to correct icon
  LuHandHelping: LuHandHelping,
  LuChurch: LuChurch,
  TbMoodKid: TbMoodKid,
  TbBuildingCircus: TbBuildingCircus,
  TbConfetti: TbConfetti,
  TbCalendarStar: TbCalendarStar,
  MdWoman: MdWoman,
  MdMan: MdMan,
};


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
              {programmes.map((programme) => {
                const Icon = iconMap[programme.icon];
                return (
                  <div
                    key={programme.title}
                    className="bg-white rounded-xl p-8 border-2 border-purple-900/30 hover:shadow-xl hover:shadow-purple-800/20 transition duration-300"
                  >
                    <div className="text-4xl mb-4 text-accent-300">
                      <Icon />
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
                );
              })}
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
              {specialEvents.map((event) => {
                const Icon = iconMap[event.icon];
                return (
                  <div
                    key={event.title}
                    className="bg-gray-50 rounded-xl p-6 border-2 border-purple-800/30 hover:shadow-xl hover:shadow-purple-900/20 text-left transition duration-300"
                  >
                    <div className="text-5xl mb-4 text-accent-300">
                      <Icon />
                    </div>
                    <h3 className="text-xl font-bold text-purple-900 mb-3">{event.title}</h3>
                    <p className="text-gray-700 text-sm">{event.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Programmes;
