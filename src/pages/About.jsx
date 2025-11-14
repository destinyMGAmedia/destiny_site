function About() {
  const coreValues = [
    {
      letter: 'V',
      title: 'Vision',
      description: 'We see beyond the present, casting a compelling picture of God\'s future for individuals and communities.',
    },
    {
      letter: 'I',
      title: 'Integrity',
      description: 'We operate with transparency, honesty, and moral uprightness in all our dealings.',
    },
    {
      letter: 'P',
      title: 'Pioneering',
      description: 'We boldly venture into new territories and embrace innovative approaches to fulfill God\'s mission.',
    },
    {
      letter: 'L',
      title: 'Leadership',
      description: 'We raise and empower dynamic leaders who influence their generation for Christ.',
    },
    {
      letter: 'E',
      title: 'Excellence',
      description: 'We pursue excellence in all we do to honor God and serve His people with distinction.',
    },
    {
      letter: 'A',
      title: 'Action',
      description: 'We are doers of the Word, translating faith into practical demonstration and tangible results.',
    },
    {
      letter: 'D',
      title: 'Devotion',
      description: 'We maintain unwavering commitment to God, His Word, and our divine assignment.',
    },
  ]

  const leaders = [
    {
      image: '/images/userPlaceHolder.jpg',
      name: 'Rev. John Doe',
      position: 'Lead Pastor & Founder',
      description: 'A visionary leader and teacher of the Word, Rev. John Doe has a passion for empowering believers to fulfill their divine destiny.',
    },
    {
      image: '/images/userPlaceHolder.jpg',
      name: 'Pastor Mary Doe',
      position: 'Co-Pastor',
      description: 'A compassionate shepherd and intercessor, Pastor Mary Doe plays a vital role in nurturing families and strengthening the church community.',
    },
    {
      image: '/images/userPlaceHolder.jpg',
      name: 'Pastor David Smith',
      position: 'Youth & Outreach Pastor',
      description: 'Committed to raising young leaders and reaching the lost through creative evangelism and mentorship.',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50 pt-24">
      {/* HERO */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 mb-4">
            About Us
          </h1>
          <p className="text-xl text-gray-600">
            To bring people and places into their destiny in God and raise dynamic leaders.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-serif font-bold text-primary-900 mb-6">
            Our Mission
          </h2>
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              At <strong>Destiny Mission Global Assembly</strong>, we are committed
              to bringing men, women, and children into their God-ordained
              destinies. Through powerful worship, transformative teaching, and
              genuine fellowship, we help believers discover and fulfill their
              divine purpose.
            </p>
            <p>
              Our church is a place where lives are changed, families are restored,
              and destinies are realized through the power of God's Word and the
              Holy Spirit.
            </p>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-serif font-bold text-primary-900 mb-6">
            Our Vision
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            To be a beacon of hope and transformation in our community and beyond,
            raising up a generation of believers who walk in their God-given
            purpose and impact the world for Christ. We envision a church where
            every member is empowered to fulfill their destiny and make disciples
            who make disciples.
          </p>
        </div>
      </section>

      {/* DECLARATION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-serif font-bold text-primary-900 mb-6">
            Our Declaration
          </h2>
          <div className="text-center text-lg leading-relaxed space-y-2">
            <p>I am wonderfully made and dignified</p>
            <p>Destined to rule and reign</p>
            <p>I am a champion because</p>
            <p>I have the seed of greatness in me.</p>
            <p className="mt-4">
              <strong>Destiny Family... Champions forever!</strong>
            </p>
            <p>
              <strong>Victory!</strong>
            </p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-serif font-bold text-primary-900 mb-4 text-center">
            Our Core Values
          </h2>
          <h3 className="text-4xl font-serif font-bold text-center text-primary-900 mb-12">
            VIP LEAD
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl font-bold text-accent-300 mb-3">
                  {value.letter}
                </div>
                <h4 className="text-xl font-serif font-bold text-primary-900 mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-700">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANTHEM */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-serif font-bold text-primary-900 mb-6">
            Our Anthem
          </h2>
          <div className="text-lg leading-relaxed space-y-4">
            <p>
              We're the building of the Lord <br />
              Standing on the rock <br />
              Washed by the Blood of the Lamb <br />
              Destined to reign <br />
              To redeem this land to God <br />
              And to worship in spirit and truth
            </p>
            <div className="mt-6">
              <h4 className="text-xl font-serif font-bold text-primary-900 mb-3">
                Chorus
              </h4>
              <p>
                People of Destiny, a family we are <br />
                An oasis of Love in a thirsty land <br />
                Small enough to know you <br />
                Big enough to serve you <br />
                Here the pastures are green <br />
                and the Lord is in this place <br />
                And He's building us to stand
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HISTORY */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-serif font-bold text-primary-900 mb-6">
            Our History
          </h2>
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              Destiny Mission Global Assembly began with a divine vision to bring
              people into alignment with God's purpose for their lives. What started
              as a small fellowship of believers has grown into a thriving church
              family committed to raising leaders, transforming communities, and
              reaching nations for Christ.
            </p>
            <p>
              Over the years, the church has experienced tremendous growth in
              membership and impact — hosting life-changing conferences, outreaches,
              and discipleship programs. Through faith, dedication, and the leading
              of the Holy Spirit, Destiny Mission continues to stand as a beacon of
              light, hope, and transformation.
            </p>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-serif font-bold text-primary-900 mb-4 text-center">
            Our Leadership
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Meet the anointed men and women leading Destiny Mission Global
            Assembly under God's direction and grace.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leaders.map((leader, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-serif font-bold text-primary-900 mb-2">
                    {leader.name}
                  </h4>
                  <p className="text-accent-300 font-semibold mb-3">
                    {leader.position}
                  </p>
                  <p className="text-gray-700">{leader.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
