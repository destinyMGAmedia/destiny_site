import SectionHeader from '@/components/ui/SectionHeader'
import { MapPin, Phone, Mail, MessageSquare, Clock } from 'lucide-react'

export default function FindUs({ assembly }) {
  const services = Array.isArray(assembly.serviceTimes) ? assembly.serviceTimes : []

  return (
    <section id="find-us" className="section-white">
      <div className="section-container">
        <SectionHeader label="Location" title="Find Us" subtitle="We'd love to welcome you" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8">
          {/* Info */}
          <div className="space-y-6">
            {assembly.address && (
              <div className="flex items-start gap-3">
                <MapPin size={18} style={{ color: 'var(--purple-700)' }} className="mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-900 mb-1">Address</p>
                  <p className="text-gray-600 leading-relaxed">{assembly.address}</p>
                  {assembly.parkingNotes && (
                    <p className="text-xs text-gray-400 mt-1">🅿️ {assembly.parkingNotes}</p>
                  )}
                </div>
              </div>
            )}

            {/* Service Times */}
            {services.length > 0 && (
              <div className="flex items-start gap-3">
                <Clock size={18} style={{ color: 'var(--purple-700)' }} className="mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-900 mb-2">Service Times</p>
                  <div className="space-y-2">
                    {services.map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                        <span className="font-semibold text-sm" style={{ color: 'var(--purple-800)' }}>
                          {s.day}
                        </span>
                        <span className="text-sm text-gray-600">{s.time}</span>
                        {s.type && (
                          <span className="pill pill-purple text-xs">{s.type}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="space-y-2">
              {assembly.phone && (
                <a
                  href={`tel:${assembly.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-800 transition-colors"
                >
                  <Phone size={15} style={{ color: 'var(--purple-700)' }} />
                  {assembly.phone}
                </a>
              )}
              {assembly.email && (
                <a
                  href={`mailto:${assembly.email}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-800 transition-colors"
                >
                  <Mail size={15} style={{ color: 'var(--purple-700)' }} />
                  {assembly.email}
                </a>
              )}
              {assembly.whatsapp && (
                <a
                  href={`https://wa.me/${assembly.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  <MessageSquare size={15} className="text-green-500" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Map */}
          {assembly.mapLink ? (
            <div className="rounded-2xl overflow-hidden shadow-lg h-80">
              <iframe
                src={assembly.mapLink}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${assembly.name} location`}
              />
            </div>
          ) : (
            <div
              className="rounded-2xl flex items-center justify-center h-80"
              style={{ background: 'var(--purple-50)' }}
            >
              <div className="text-center">
                <MapPin size={40} style={{ color: 'var(--purple-300)' }} className="mx-auto mb-3" />
                <p className="text-sm text-gray-400">Map coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
