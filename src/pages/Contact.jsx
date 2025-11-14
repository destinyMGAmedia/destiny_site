import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'

function Contact() {
  return (
    <main className="min-h-screen bg-gray-50 pt-24">
      <div className="bg-gradient-to-r from-primary-900 to-pink-600 text-white py-16 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            We'd love to connect with you! Have a question, prayer request, or
            need more information? Send us a message, and we'll get back to you as
            soon as we can.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl mb-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* CONTACT INFO */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-serif font-bold text-primary-900 mb-4 flex items-center gap-3">
                <FaMapMarkerAlt className="text-accent-300" />
                Our Location
              </h3>
              <p className="text-gray-700 text-lg">
                123 Church Street<br />
                City, State 12345<br />
                United States
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold text-primary-900 mb-4 flex items-center gap-3">
                <FaPhone className="text-accent-300" />
                Call Us
              </h3>
              <p className="text-gray-700 text-lg">
                Office: (123) 456-7890<br />
                Pastor: (123) 456-7891
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold text-primary-900 mb-4 flex items-center gap-3">
                <FaEnvelope className="text-accent-300" />
                Email Us
              </h3>
              <p className="text-gray-700 text-lg">
                General Inquiries: info@dmga.org<br />
                Prayer Requests: prayer@dmga.org
              </p>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-serif font-bold text-primary-900 mb-6">
              Send Us a Message
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="fname" className="block font-semibold mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="fname"
                  name="fname"
                  placeholder="John"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="lname" className="block font-semibold mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  placeholder="Doe"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john.doe@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block font-semibold mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block font-semibold mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="How can we assist you today?"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block font-semibold mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Write your message here..."
                  rows="5"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-accent-300 text-primary-900 rounded-lg font-semibold hover:bg-accent-400 transform hover:-translate-y-1 transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* OFFICE HOURS */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-primary-900 mb-6">
            Office Hours
          </h2>
          <div className="space-y-2 text-lg text-gray-700">
            <p>
              <strong>Monday – Friday:</strong> 9:00 AM – 5:00 PM
            </p>
            <p>
              <strong>Saturday:</strong> 10:00 AM – 2:00 PM
            </p>
            <p>
              <strong>Sunday:</strong> 8:00 AM – 1:00 PM
            </p>
            <p>
              <strong>Closed:</strong> Public Holidays
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Contact
