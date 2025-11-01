function About() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-purple-900 py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">About Us</h1>
          <div className="h-1 w-24 bg-purple-400 mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-purple-200 italic max-w-3xl mx-auto">To bring people and places into their destiny in God and raise dynamic leaders</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-8"></div>
            <div className="bg-gray-50 rounded-xl p-8 shadow-lg">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                At Destiny Mission Global Assembly, we are committed to bringing men, women, and children into their God-ordained destinies. 
                Through powerful worship, transformative teaching, and genuine fellowship, we help believers discover and fulfill their divine purpose.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our church is a place where lives are changed, families are restored, and destinies are realized through the power of God's Word and the Holy Spirit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">Our Vision</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-8"></div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <p className="text-lg text-gray-700 leading-relaxed">
                To be a beacon of hope and transformation in our community and beyond, raising up a generation of believers 
                who walk in their God-given purpose and impact the world for Christ. We envision a church where every member 
                is empowered to fulfill their destiny and make disciples who make disciples.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Declaration Section */}
      <section className="bg-purple-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Declaration</h2>
            <div className="h-1 w-24 bg-purple-400 mx-auto mb-12"></div>
            <div className="space-y-6 text-white">
              <p className="text-xl md:text-2xl font-semibold leading-relaxed">
                I am wonderfully made and dignified
              </p>
              <p className="text-xl md:text-2xl font-semibold leading-relaxed">
                Destined to rule and reign
              </p>
              <p className="text-xl md:text-2xl font-semibold leading-relaxed">
                I am a champion because
              </p>
              <p className="text-xl md:text-2xl font-semibold leading-relaxed">
                I have the seed of greatness in me.
              </p>
              <div className="my-8">
                <div className="h-px w-48 bg-purple-400 mx-auto my-8"></div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-purple-200">
                Destiny Family... Champions forever!
              </p>
              <p className="text-3xl md:text-4xl font-bold text-white mt-6">
                Victory!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">Our Core Values</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>
            <p className="text-center text-purple-900 font-bold text-2xl mb-8">VIP LEAD</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Vision",
                  description: "We see beyond the present, casting a compelling picture of God's future for individuals and communities"
                },
                {
                  title: "Integrity",
                  description: "We operate with transparency, honesty, and moral uprightness in all our dealings"
                },
                {
                  title: "Pioneering",
                  description: "We boldly venture into new territories and embrace innovative approaches to fulfill God's mission"
                },
                {
                  title: "Leadership",
                  description: "We raise and empower dynamic leaders who influence their generation for Christ"
                },
                {
                  title: "Excellence",
                  description: "We pursue excellence in all we do to honor God and serve His people with distinction"
                },
                {
                  title: "Action",
                  description: "We are doers of the Word, translating faith into practical demonstration and tangible results"
                },
                {
                  title: "Devotion",
                  description: "We maintain unwavering commitment to God, His Word, and our divine assignment"
                }
              ].map((value, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border-l-4 border-purple-600"
                >
                  <h3 className="text-xl font-bold text-purple-900 mb-3">{value.title}</h3>
                  <p className="text-gray-700">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Anthem Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">Our Anthem</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>
            <div className="bg-gradient-to-br from-purple-50 to-gray-50 rounded-xl p-8 md:p-12 shadow-lg border-2 border-purple-200">
              {/* Verse 1 */}
              <div className="mb-8 text-center">
                <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-3">
                  We&apos;re the building of the Lord
                </p>
                <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-3">
                  Standing on the rock
                </p>
                <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-3">
                  Washed by the Blood of the Lamb
                </p>
                <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-3">
                  Destined to reign
                </p>
                <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-3">
                  To redeem this land to God
                </p>
                <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
                  And to worship in spirit and truth
                </p>
              </div>

              {/* Chorus Label */}
              <div className="my-8">
                <p className="text-center text-purple-900 font-bold text-xl mb-6">Chorus</p>
                <div className="h-px w-32 bg-purple-400 mx-auto mb-6"></div>
              </div>

              {/* Chorus */}
              <div className="text-center bg-purple-100 rounded-lg p-6 md:p-8 border border-purple-300">
                <p className="text-xl md:text-2xl font-semibold text-purple-900 leading-relaxed mb-4">
                  People of Destiny, a family we are
                </p>
                <p className="text-xl md:text-2xl font-semibold text-purple-900 leading-relaxed mb-4">
                  An oasis of Love in a thirsty land
                </p>
                <p className="text-xl md:text-2xl font-semibold text-purple-900 leading-relaxed mb-4">
                  Small enough to know you
                </p>
                <p className="text-xl md:text-2xl font-semibold text-purple-900 leading-relaxed mb-4">
                  Big enough to serve you
                </p>
                <p className="text-xl md:text-2xl font-semibold text-purple-900 leading-relaxed mb-4">
                  Here the pastures are green
                </p>
                <p className="text-xl md:text-2xl font-semibold text-purple-900 leading-relaxed mb-4">
                  and the Lord is in this place
                </p>
                <p className="text-xl md:text-2xl font-bold text-purple-900 leading-relaxed">
                  And He&apos;s building us to stand
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Leadership</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-8"></div>
            <p className="text-lg text-gray-700">
              Our dedicated leadership team is committed to serving God and His people with passion and integrity.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
