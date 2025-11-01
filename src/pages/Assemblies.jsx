function Assemblies() {
  // Church branches/assemblies
  const assemblies = [
    {
      name: "Headquarters",
      location: "City Center",
      address: "123 Main Street, City, State 12345",
      pastor: "Rev. Dr. John Smith",
      services: [
        { day: "Sunday", time: "9:00 AM - 12:00 PM" },
        { day: "Wednesday", time: "6:00 PM - 8:00 PM" }
      ],
      contact: {
        phone: "(123) 456-7890",
        email: "hq@dmga.org"
      },
      icon: "⛪"
    },
    // Add more assemblies/branches here as needed
  ]

  return (
    <>
      {/* Page Header */}
      <section className="bg-purple-900 py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Our Assemblies</h1>
          <div className="h-1 w-24 bg-purple-400 mx-auto mb-6"></div>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Find a Destiny Mission Global Assembly branch near you
          </p>
        </div>
      </section>

      {/* Assemblies List */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {assemblies.map((assembly, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-purple-600"
              >
              <div className="grid md:grid-cols-3 gap-8">
                {/* Assembly Info */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl">{assembly.icon}</span>
                    <div>
                      <h2 className="text-3xl font-bold text-purple-900">{assembly.name}</h2>
                      <p className="text-purple-700">{assembly.location}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">📍 Address</p>
                      <p>{assembly.address}</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">👨‍💼 Pastor</p>
                      <p>{assembly.pastor}</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">📞 Contact</p>
                      <p>Phone: <a href={`tel:${assembly.contact.phone}`} className="text-purple-600 hover:text-purple-800">{assembly.contact.phone}</a></p>
                      <p>Email: <a href={`mailto:${assembly.contact.email}`} className="text-purple-600 hover:text-purple-800">{assembly.contact.email}</a></p>
                    </div>
                  </div>
                </div>

                {/* Service Times */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Service Times</h3>
                  <div className="space-y-3">
                    {assembly.services.map((service, idx) => (
                      <div 
                        key={idx}
                        className="bg-white rounded-lg p-4 shadow-md"
                      >
                        <p className="font-semibold text-purple-900">{service.day}</p>
                        <p className="text-gray-600 text-sm">{service.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Add More Branches CTA */}
      <section className="bg-purple-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Want to Start an Assembly?
            </h3>
            <p className="text-purple-200 mb-6">
              Interested in planting a Destiny Mission Global Assembly branch in your area? 
              Contact us to learn about our church planting program.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Note for Admin */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-purple-100 rounded-xl p-6 border border-purple-300">
              <p className="text-gray-800 text-sm">
                <strong>📝 Note:</strong> To add more assemblies/branches, edit the <code className="bg-purple-200 px-2 py-1 rounded">assemblies</code> array in <code className="bg-purple-200 px-2 py-1 rounded">src/pages/Assemblies.jsx</code>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Assemblies

