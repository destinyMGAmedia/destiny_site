import {
  Plane, HardHat, GraduationCap, Landmark, HeartPulse, UtensilsCrossed,
  Cpu, Palette, Scissors, Scale, Truck, ShoppingBag, Wrench, Wheat, PartyPopper, Tag,
  Cog, Ruler, Factory, Leaf, FlaskConical, Building2, Vote, Handshake, ShieldCheck,
  Users, HeartHandshake, Briefcase, Newspaper, Music, Trophy, Brain, Church,
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
  ENGINEERING_TECHNOLOGY: Cog,
  CIVIL_CONSTRUCTION_ENGINEERING: Ruler,
  MANUFACTURING_INDUSTRIAL: Factory,
  ENERGY_ENVIRONMENT: Leaf,
  SCIENCE_RESEARCH_INNOVATION: FlaskConical,
  ARCHITECTURE_URBAN_PLANNING: Building2,
  GOVERNANCE_POLITICS: Vote,
  LAW_JUSTICE: Scale,
  DIPLOMACY_INTERNATIONAL_RELATIONS: Handshake,
  DEFENCE_SECURITY_INTELLIGENCE: ShieldCheck,
  CIVIC_COMMUNITY_DEVELOPMENT: Users,
  NONPROFIT_HUMANITARIAN: HeartHandshake,
  CORPORATE_CONSULTING: Briefcase,
  MEDIA_JOURNALISM: Newspaper,
  MUSIC_PERFORMING_ARTS: Music,
  SPORTS_RECREATION: Trophy,
  MENTAL_HEALTH_COUNSELLING: Brain,
  FAITH_MINISTRY: Church,
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
            <Icon size={16} className="shrink-0" style={{ color: 'var(--yp-yellow-600)' }} />
            <span className="min-w-0 break-words">{c.label}</span>
          </li>
        )
      })}
    </ul>
  )
}
