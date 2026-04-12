'use client'
import SectionHeader from '@/components/ui/SectionHeader'
import Image from 'next/image'
import { Copy } from 'lucide-react'

export default function Giving({ givingDetails, assemblyName }) {
  return (
    <section id="giving" className="section-white">
      <div className="section-container">
        <SectionHeader
          label="Support"
          title="Giving"
          subtitle="Your giving fuels the mission of God in this assembly"
          centered
        />

        <div className="max-w-2xl mx-auto mt-8">
          {givingDetails ? (
            <div className="card p-8 text-center">
              {/* Scripture */}
              <p className="italic text-gray-500 text-sm mb-6">
                "Bring the whole tithe into the storehouse..." — Malachi 3:10
              </p>

              {/* Bank details */}
              <div className="space-y-3 mb-8">
                {givingDetails.accountName && (
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500 font-semibold uppercase">Account Name</span>
                    <span className="font-bold text-gray-900">{givingDetails.accountName}</span>
                  </div>
                )}
                {givingDetails.bankName && (
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500 font-semibold uppercase">Bank</span>
                    <span className="font-bold text-gray-900">{givingDetails.bankName}</span>
                  </div>
                )}
                {givingDetails.accountNumber && (
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500 font-semibold uppercase">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-lg tracking-wider">
                        {givingDetails.accountNumber}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(givingDetails.accountNumber)}
                        className="text-gray-400 hover:text-purple-700 transition-colors"
                        title="Copy account number"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              {givingDetails.qrCodeImage && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold text-gray-700">Scan to Give</p>
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2" style={{ borderColor: 'var(--gold-500)' }}>
                    <Image src={givingDetails.qrCodeImage} alt="Giving QR Code" fill sizes="160px" className="object-contain p-2" />
                  </div>
                </div>
              )}

              {givingDetails.instructions && (
                <p className="text-sm text-gray-500 mt-6 leading-relaxed">
                  {givingDetails.instructions}
                </p>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="italic text-gray-500 text-sm mb-4">
                "Bring the whole tithe into the storehouse..." — Malachi 3:10
              </p>
              <p className="text-gray-400 text-sm">
                Giving details for {assemblyName} will be available soon.
              </p>
              <p className="text-xs text-gray-300 mt-2">Please contact the assembly directly for giving information.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
