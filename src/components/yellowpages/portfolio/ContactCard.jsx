'use client'
import { Phone, Mail, MessageCircle, Globe } from 'lucide-react'
import { whatsappUrl, telHref } from '@/lib/yellowpages/phone'

/** Contact links + social pills, shared by both portfolio layouts. */
export default function ContactCard({ listing }) {
  const dialOpts = { country: listing.country, dialCode: listing.countryDialCode }
  const callHref = telHref(listing.phone, dialOpts)
  const whatsappHref = listing.whatsapp ? whatsappUrl(listing.whatsapp, dialOpts) : null
  const socialLinks = Object.entries(listing.socialLinks || {}).filter(([, v]) => v)

  return (
    <section id="yp-contact" className="yp-portfolio-section yp-card p-6">
      <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--yp-ink)' }}>Contact</h2>
      <div className="flex flex-wrap gap-3">
        <a href={callHref} className="yp-btn-outline !py-2 !px-4">
          <Phone size={15} /> Call
        </a>
        {whatsappHref && (
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="yp-btn-outline !py-2 !px-4">
            <MessageCircle size={15} /> WhatsApp
          </a>
        )}
        {listing.email && (
          <a href={`mailto:${listing.email}`} className="yp-btn-outline !py-2 !px-4">
            <Mail size={15} /> Email
          </a>
        )}
        {listing.website && (
          <a href={listing.website} target="_blank" rel="noopener noreferrer" className="yp-btn-outline !py-2 !px-4">
            <Globe size={15} /> Website
          </a>
        )}
      </div>
      {socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3 text-sm">
          {socialLinks.map(([key, value]) => (
            <span key={key} className="yp-pill max-w-full break-all">{key}: {value}</span>
          ))}
        </div>
      )}
    </section>
  )
}
