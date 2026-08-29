// Giving tiers for Destiny Nation — The Gatekeepers Commission.
// Two separate, non-overlapping packages — see spec/destiny-nation-landing.md §0.
// Amounts are in NGN (base currency); the give form converts for other currencies via CURRENCY_RATES.

export const LADDER_TIERS = [
  { key: 'LEGACY_FOUNDER', rank: 1, name: 'Legacy Founder', amount: 100_000_000, cadence: 'one-time or pledge' },
  { key: 'NATION_BUILDER', rank: 2, name: 'Nation Builder', amount: 50_000_000, cadence: 'pledge' },
  { key: 'SPONSOR_A_GATE', rank: 3, name: 'Sponsor a Gate', amount: 30_000_000, cadence: 'annual pledge (per gate)' },
  { key: 'GATE_CHAMPION', rank: 4, name: 'Gate Champion', amount: 10_000_000, cadence: 'one-time / annual pledge' },
  { key: 'SCHOLARSHIP_FUND', rank: 5, name: 'Future Leaders Scholarship Fund', amount: 5_000_000, cadence: 'one-time (or pledge)' },
  { key: 'LEGACY_CIRCLE', rank: 6, name: 'Legacy Circle', amount: 1_000_000, cadence: 'annual giving community' },
  { key: 'KINGDOM_BUILDER', rank: 7, name: 'Kingdom Builder', amount: 500_000, cadence: 'one-time or recurring' },
  { key: 'GATEKEEPER_PARTNER', rank: 8, name: 'Gatekeeper Partner', amount: 100_000, cadence: 'one-time or recurring (monthly)' },
  { key: 'GATEKEEPER_FRIEND', rank: 9, name: 'Gatekeeper Friend', amount: 30_000, cadence: 'one-time or recurring (monthly/annual)' },
]

// Package A tiers at or above this amount are lead-capture/pledge only — never self-serve checkout.
export const LADDER_PLEDGE_CUTOFF = 10_000_000

// Confirmed directly from the source infographic (DestinyNation.png) — not a guessed split.
export const FOUNDERS_CIRCLE_TIERS = [
  { key: 'BRONZE', name: 'Bronze', amount: 25_000_000 },
  { key: 'SILVER', name: 'Silver', amount: 50_000_000 },
  { key: 'GOLD', name: 'Gold', amount: 100_000_000 },
  { key: 'DIAMOND', name: 'Diamond', amount: 250_000_000 },
  { key: 'PLATINUM', name: 'Platinum', amount: 500_000_000 },
]

// Static conversion table — not live FX, admin-editable later (spec §3).
export const CURRENCY_RATES = {
  NGN: 1,
  USD: 1 / 1600,
  GBP: 1 / 2000,
  EUR: 1 / 1750,
}

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_RATES)

export function getTier(pkg, tierKey) {
  const tiers = pkg === 'FOUNDERS_CIRCLE' ? FOUNDERS_CIRCLE_TIERS : LADDER_TIERS
  return tiers.find((t) => t.key === tierKey) || null
}

// Founders' Circle is pledge-only at every tier; Package A is pledge-only from the cutoff up.
export function isPledgeTier(pkg, tierKey) {
  if (pkg === 'FOUNDERS_CIRCLE') return true
  const tier = getTier('LADDER', tierKey)
  return !!tier && tier.amount >= LADDER_PLEDGE_CUTOFF
}

export function convertFromNGN(ngnAmount, currency) {
  const rate = CURRENCY_RATES[currency]
  if (!rate) throw new Error(`Unsupported currency: ${currency}`)
  return Math.round(ngnAmount * rate)
}
