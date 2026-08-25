import {
  Plane, HardHat, GraduationCap, Landmark, HeartPulse, UtensilsCrossed,
  Cpu, Palette, Scissors, Scale, Truck, ShoppingBag, Wrench, Wheat, PartyPopper, Tag,
} from 'lucide-react'
import { CATEGORIES } from '@/lib/yellowpages/constants'

const ICONS = {
  TOURISM_TRAVEL: Plane,
  CONSTRUCTION_REAL_ESTATE: HardHat,
  EDUCATION_TRAINING: GraduationCap,
  FINANCE_INSURANCE: Landmark,
  HEALTH_WELLNESS: HeartPulse,
  FOOD_HOSPITALITY: UtensilsCrossed,
  TECHNOLOGY_IT: Cpu,
  CREATIVE_MEDIA: Palette,
  FASHION_BEAUTY: Scissors,
  LEGAL_PROFESSIONAL_SERVICES: Scale,
  TRANSPORT_LOGISTICS: Truck,
  RETAIL_ECOMMERCE: ShoppingBag,
  HOME_SERVICES_TRADES: Wrench,
  AGRICULTURE_FOOD_PRODUCTION: Wheat,
  EVENTS_ENTERTAINMENT: PartyPopper,
  OTHER: Tag,
}

/**
 * Non-clickable showcase of what's in the directory — used on the cover page only, purely
 * illustrative (the real, filterable category picker lives in the browse feed's chip bar).
 */
export default function CategoryShowcase() {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Categories in the directory">
      {CATEGORIES.filter((c) => c.value !== 'OTHER').map((c) => {
        const Icon = ICONS[c.value] || Tag
        return (
          <li
            key={c.value}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--yp-surface)', border: '1px solid var(--yp-border)', color: 'var(--yp-ink-soft)' }}
          >
            <Icon size={16} style={{ color: 'var(--yp-yellow-600)' }} />
            {c.label}
          </li>
        )
      })}
    </ul>
  )
}
