function Programmes() {
  // Church programmes/activities (from old Ministries)
  const programmes = [
    {
      title: "Worship & Praise",
      description: "Experience powerful worship that ushers in God's presence and transforms hearts",
      icon: "🎵",
      schedule: ["Sunday Services", "Special Events", "Choir Practice"]
    },
    {
      title: "Bible Study",
      description: "Deep diving into God's Word to build strong foundations of faith",
      icon: "📖",
      schedule: ["Wednesday Bible Study", "Small Groups", "Online Study"]
    },
    {
      title: "Youth Ministry",
      description: "Empowering the next generation to walk in their purpose and fulfill their destiny",
      icon: "🌟",
      schedule: ["Youth Service", "Youth Camps", "Mentorship Programs"]
    },
    {
      title: "Prayer & Intercession",
      description: "Corporate prayer sessions that bring breakthrough and move the hand of God",
      icon: "🙏",
      schedule: ["Early Morning Prayers", "Prayer Vigils", "Prayer Chain"]
    },
    {
      title: "Community Outreach",
      description: "Touching lives in our community through acts of love and service",
      icon: "❤️",
      schedule: ["Food Distribution", "Hospital Visits", "Community Events"]
    },
    {
      title: "Discipleship",
      description: "Mentoring and equipping believers to grow in Christ and make disciples",
      icon: "👥",
      schedule: ["New Believers Class", "Leadership Training", "One-on-One Mentoring"]
    },
    {
      title: "Children's Ministry",
      description: "Nurturing young hearts to know and love Jesus from an early age",
      icon: "👶",
      schedule: ["Sunday School", "Vacation Bible School", "Children's Church"]
    },
    {
      title: "Women's Ministry",
      description: "Empowering women to discover their identity in Christ and fulfill their purpose",
      icon: "👩",
      schedule: ["Women's Fellowship", "Bible Study", "Conferences"]
    },
    {
      title: "Men's Ministry",
      description: "Raising godly men who lead with integrity and strength",
      icon: "👨",
      schedule: ["Men's Fellowship", "Accountability Groups", "Men's Retreats"]
    }
  ]

  // Weekly Schedule
  const weeklySchedule = [
    {
      title: "Sunday Worship Service",
      date: "Every Sunday",
      time: "9:00 AM - 12:00 PM",
      location: "Main Sanctuary",
      description: "Join us for powerful worship, life-changing messages, and fellowship"
    },
    {
      title: "Midweek Bible Study",
      date: "Every Wednesday",
      time: "6:00 PM - 8:00 PM",
      location: "Fellowship Hall",
      description: "Deep dive into God's Word and grow in your understanding"
    },
    {
      title: "Prayer Vigil",
      date: "First Friday of Every Month",
      time: "10:00 PM - 2:00 AM",
      location: "Prayer Room",
      description: "Corporate prayer and intercession for breakthrough"
    },
    {
      title: "Youth Night",
      date: "Every Saturday",
      time: "5:00 PM - 7:00 PM",
      location: "Youth Center",
      description: "Fun, fellowship, and faith-building activities for young people"
    }
  ]

  // Special Events
  const specialEvents = [
    {
      title: "Annual Conference",
      description: "Three days of powerful teaching, worship, and impartation",
      icon: "🎪"
    },
    {
      title: "Community Outreach",
      description: "Reaching out to our community with the love of Christ",
      icon: "🤝"
    },
    {
      title: "Family Fun Day",
      description: "A day of fun activities and fellowship for the whole family",
      icon: "🎉"
    },
    {
      title: "Leadership Summit",
      description: "Equipping and empowering leaders for effective ministry",
      icon: "📚"
    }
  ]

  return (
    <>
      {/* Page Header */}
      <section className="bg-purple-900 py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Our Programmes</h1>
          <div className="h-1 w-24 bg-purple-400 mx-auto mb-6"></div>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Discover opportunities to grow, serve, and fulfill your purpose
          </p>
        </div>
      </section>

      {/* Weekly Schedule */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">Weekly Schedule</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>
            <div className="grid md:grid-cols-2 gap-6">
              {weeklySchedule.map((event, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-purple-600"
                >
                  <h3 className="text-2xl font-bold text-purple-900 mb-4">{event.title}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-700 flex items-center">
                      <span className="mr-2">📅</span>
                      {event.date}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <span className="mr-2">⏰</span>
                      {event.time}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <span className="mr-2">📍</span>
                      {event.location}
                    </p>
                  </div>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Church Programmes/Activities */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">Our Activities</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programmes.map((programme, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition duration-300"
                >
                  <div className="text-5xl mb-4">{programme.icon}</div>
                  <h3 className="text-2xl font-bold text-purple-900 mb-3">{programme.title}</h3>
                  <p className="text-gray-700 mb-4">{programme.description}</p>
                  <div className="space-y-2">
                    {programme.schedule.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2 text-purple-600">•</span>
                        {item}
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
              {specialEvents.map((event, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg text-center transition duration-300"
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

      {/* Get Involved CTA */}
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

