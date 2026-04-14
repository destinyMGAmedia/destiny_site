'use client'
import { Users, MapPin, Clock, Calendar, Info } from 'lucide-react'
import Image from 'next/image'

export default function ArkCenters({ section, centers }) {
  return (
    <section id="ark-centers" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
          >
            {section.title || 'Ark Centers'}
          </h2>
          <p className="text-gray-600">
            Our house fellowships (Ark Centers) provide a closer-knit community where you can grow in faith, 
            share life together, and support one another in your local neighborhood.
          </p>
        </div>

        {(!centers || centers.length === 0) ? (
          <div className="bg-purple-50 rounded-2xl p-12 text-center border-2 border-dashed border-purple-200">
            <Users size={48} className="mx-auto text-purple-300 mb-4" />
            <h3 className="text-xl font-bold text-purple-900 mb-2">Centers Coming Soon</h3>
            <p className="text-purple-700 max-w-md mx-auto">
              We are currently setting up Ark Centers in this assembly. Please check back soon or contact us to find a fellowship near you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center) => (
              <div 
                key={center.id}
                className="card p-6 border-t-4 hover:shadow-xl transition-shadow flex flex-col"
                style={{ borderTopColor: 'var(--purple-600)' }}
              >
                <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Users size={20} className="shrink-0" /> {center.name}
                </h3>
                
                <div className="space-y-3 text-gray-600 flex-1">
                  {center.location && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="mt-1 shrink-0 text-purple-500" />
                      <span className="text-sm">{center.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="shrink-0 text-purple-500" />
                    <span className="text-sm">Every Other {center.meetingDay}</span>
                  </div>
                  {center.meetingTime && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="shrink-0 text-purple-500" />
                      <span className="text-sm">{center.meetingTime}</span>
                    </div>
                  )}
                </div>

                {center.leader && (
                  <div className="mt-6 pt-4 border-t flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden relative border shrink-0">
                      {center.leader.photo ? (
                        <Image 
                          src={center.leader.photo} 
                          alt={center.leader.firstName} 
                          fill 
                          sizes="40px"
                          className="object-cover" 
                        />
                      ) : (
                        <span className="font-bold text-purple-800">
                          {center.leader.firstName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold truncate">Center Leader</p>
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {center.leader.firstName} {center.leader.lastName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-purple-50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 border border-purple-100 max-w-4xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <Info className="text-purple-600" />
          </div>
          <div className="text-center md:text-left">
            <h4 className="font-bold text-purple-900">Note on Mid-Week Services</h4>
            <p className="text-sm text-purple-800">
              Ark Centers typically meet every other Thursday. On Thursdays when house fellowships do not meet, 
              we hold a general mid-week service at our main assembly building. 
              Please check our weekly announcements for the schedule.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
