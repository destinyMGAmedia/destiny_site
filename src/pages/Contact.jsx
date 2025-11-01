import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('success') === 'true') {
      setSubmitted(true)
      setTimeout(() => {
        window.history.replaceState({}, '', '/contact')
      }, 100)
    }
  }, [location])

  return (
    <>
      {/* Page Header */}
      <section className="bg-purple-900 py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Contact Us</h1>
          <div className="h-1 w-24 bg-purple-400 mx-auto mb-6"></div>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            We&apos;d love to hear from you. Reach out to us and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gray-50 rounded-xl p-8 shadow-lg text-center">
                <div className="text-5xl mb-4">📍</div>
                <h3 className="text-xl font-bold text-purple-900 mb-3">Location</h3>
                <p className="text-gray-700">
                  123 Church Street<br />
                  City, State 12345<br />
                  United States
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 shadow-lg text-center">
                <div className="text-5xl mb-4">📞</div>
                <h3 className="text-xl font-bold text-purple-900 mb-3">Phone</h3>
                <p className="text-gray-700">
                  Office: <a href="tel:+1234567890" className="text-purple-600 hover:text-purple-800 transition">(123) 456-7890</a><br />
                  Pastor: <a href="tel:+1234567891" className="text-purple-600 hover:text-purple-800 transition">(123) 456-7891</a>
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 shadow-lg text-center">
                <div className="text-5xl mb-4">✉️</div>
                <h3 className="text-xl font-bold text-purple-900 mb-3">Email</h3>
                <p className="text-gray-700">
                  <a href="mailto:info@dmga.org" className="text-purple-600 hover:text-purple-800 transition">info@dmga.org</a><br />
                  <a href="mailto:prayer@dmga.org" className="text-purple-600 hover:text-purple-800 transition">prayer@dmga.org</a>
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="max-w-3xl mx-auto">
              {submitted ? (
                // Success Message
                <div className="bg-gray-50 rounded-xl p-8 shadow-lg text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-3xl font-bold text-purple-900 mb-4">Thank You!</h2>
                  <p className="text-gray-700 mb-6">
                    Your message has been sent successfully. We&apos;ll get back to you soon!
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition duration-300"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Send Us a Message</h2>
                  <form 
                    action="https://formsubmit.co/info@dmga.org"
                    method="POST"
                    className="space-y-6"
                  >
                    {/* FormSubmit Configuration */}
                    <input type="text" name="_honey" style={{display: 'none'}} />
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_subject" value="New Contact Form Submission from DMGA Website" />
                    <input type="hidden" name="_next" value={`${window.location.origin}/contact?success=true`} />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-gray-900 mb-2 font-medium">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-gray-900 mb-2 font-medium">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-900 mb-2 font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-gray-900 mb-2 font-medium">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-gray-900 mb-2 font-medium">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="How can we help you?"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-gray-900 mb-2 font-medium">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows="6"
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                        placeholder="Your message..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 shadow-lg"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">Office Hours</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto mb-8"></div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Monday - Friday</p>
                  <p>9:00 AM - 5:00 PM</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Saturday</p>
                  <p>10:00 AM - 2:00 PM</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Sunday</p>
                  <p>8:00 AM - 1:00 PM</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Closed</p>
                  <p>Public Holidays</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
