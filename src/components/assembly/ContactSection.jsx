import { Phone, Mail, MessageSquare, MapPin } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

export default function ContactSection({ assembly }) {
  return (
    <section id="contact" style={{ background: 'var(--purple-900)' }}>
      <div className="section-container">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--gold-500)' }}>
            Get In Touch
          </span>
          <h2 className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Contact {assembly.name}
          </h2>
          <div className="w-12 h-1 mx-auto mt-3 rounded-full" style={{ background: 'var(--gold-500)' }} />
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
          {assembly.address && (
            <div className="flex items-start gap-3 text-white/80 max-w-xs">
              <MapPin size={20} style={{ color: 'var(--gold-500)' }} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed">{assembly.address}</p>
            </div>
          )}

          {assembly.phone && (
            <a
              href={`tel:${assembly.phone}`}
              className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
            >
              <Phone size={20} style={{ color: 'var(--gold-500)' }} />
              <span className="text-sm">{assembly.phone}</span>
            </a>
          )}

          {assembly.email && (
            <a
              href={`mailto:${assembly.email}`}
              className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
            >
              <Mail size={20} style={{ color: 'var(--gold-500)' }} />
              <span className="text-sm">{assembly.email}</span>
            </a>
          )}

          {assembly.whatsapp && (
            <a
              href={`https://wa.me/${assembly.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
            >
              <FaWhatsapp size={20} className="text-green-400" />
              <span className="text-sm">WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
