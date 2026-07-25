import GatekeeperStructure from '@/components/nation/partner/GatekeeperStructure'
import CommissioningProcess from '@/components/nation/partner/CommissioningProcess'
import WhyPartner from '@/components/nation/partner/WhyPartner'
import FoundingPartnerCTA from '@/components/nation/partner/FoundingPartnerCTA'
import PageHero from '@/components/nation/shared/PageHero'

export const metadata = { title: 'Get Involved — Destiny Nation' }

export default function PartnerPage() {
  const bankDetails = {
    accountName: process.env.NATION_BANK_ACCOUNT_NAME || 'Destiny Mission Global Assembly (to be confirmed)',
    bankName: process.env.NATION_BANK_NAME || 'Bank name to be confirmed',
    accountNumber: process.env.NATION_BANK_ACCOUNT_NUMBER || 'Account number to be confirmed',
  }

  return (
    <>
      <PageHero
        imageKey="partner"
        eyebrow="Become a Gatekeeper"
        title="Get Involved"
        subtitle="Government, corporate, education, or individual — there's a seat at the gate for you. Join the first 100 Founding Gatekeepers of the Commission."
      />
      <WhyPartner />
      <GatekeeperStructure />
      <CommissioningProcess />
      <FoundingPartnerCTA bankDetails={bankDetails} />
    </>
  )
}
