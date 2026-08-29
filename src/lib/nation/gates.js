// Gate/project data reconciled from the source decks — see spec/destiny-nation-landing.md §0.
// Full 30-item Internal Gates and 30-item Influence Gates lists per
// "THE GATEKEEPERS @branding slides.pdf" (Layer 2 / Layer 3) and DestinyNation.png.

function slugify(name) {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const INTERNAL_CATEGORIES = [
  {
    key: 'spiritual-formation',
    name: 'Spiritual Formation',
    gates: [
      'Senior Pastoral Leadership',
      'Associate Pastoral Leadership',
      'Prayer',
      'Christian Education',
      'Discipleship',
      'Missions & Evangelism',
    ],
  },
  {
    key: 'family',
    name: 'Family',
    gates: ['Men', 'Women', 'Youth', 'Children', 'Singles', 'Family Life'],
  },
  {
    key: 'worship-communication',
    name: 'Worship & Communication',
    gates: ['Worship', 'Music', 'Creative Arts', 'Media', 'Digital Ministry', 'Publications & Knowledge Management'],
  },
  {
    key: 'operations',
    name: 'Operations',
    gates: ['Protocol', 'Hospitality', 'Welfare', 'Administration', 'Finance', 'Security & Risk Management'],
  },
  {
    key: 'leadership-expansion',
    name: 'Leadership & Expansion',
    gates: [
      'Small Gates',
      'Volunteer Development',
      'Leadership Development',
      'Church Planting',
      'Community Impact',
      'Strategic Development',
    ],
  },
]

export const INFLUENCE_SECTORS = [
  {
    key: 'governance',
    name: 'Governance & Public Leadership',
    gates: [
      'Governance & Public Policy',
      'Law & Justice',
      'Diplomacy & International Relations',
      'Defence, Security & Intelligence',
      'Civic Leadership & Community Development',
    ],
  },
  {
    key: 'economy',
    name: 'Economy & Enterprise',
    gates: [
      'Entrepreneurship & SMEs',
      'Corporate Leadership',
      'Finance, Banking & Investment',
      'Manufacturing & Industrial Development',
      'Trade, Commerce & Supply Chain',
    ],
  },
  {
    key: 'science-infrastructure',
    name: 'Science/Innovation & Infrastructure',
    gates: [
      'Engineering & Infrastructure',
      'Technology & Software',
      'Artificial Intelligence & Emerging Technologies',
      'Scientific Research & Innovation',
      'Energy, Environment & Sustainability',
    ],
  },
  {
    key: 'human-development',
    name: 'Human Development',
    gates: [
      'Education & Academia',
      'Healthcare & Medicine',
      'Mental Health & Counselling',
      'Family & Social Development',
      'Sports & Youth Development',
    ],
  },
  {
    key: 'culture-media',
    name: 'Culture & Media',
    gates: [
      'Media & Journalism',
      'Arts, Entertainment & Creative Industries',
      'Music & Worship Arts',
      'Communications, Publishing & Digital Content',
      'Fashion, Beauty & Lifestyle',
    ],
  },
  {
    key: 'global-development',
    name: 'Global Development',
    gates: [
      'Agriculture & Food Security',
      'Architecture, Housing & Urban Development',
      'Transportation, Aviation & Logistics',
      'Hospitality, Tourism & Events',
      'Humanitarian & Global Missions',
    ],
  },
]

// The 4 tests every Legacy Project must pass (Layer 4).
export const LEGACY_PROJECT_TESTS = [
  'Solves a real problem',
  'Outlives the anniversary',
  'Produces measurable impact',
  'Creates future leaders',
]

// Named gate → project examples given in the source deck, each tagged with the layer/group
// its gate belongs to so the Projects page can filter and gate grids can cross-link. All are
// assumed to pass all 4 Legacy Project tests, per the source framing ("The 30 Legacy Project Framework").
export const LEGACY_PROJECTS = [
  {
    gate: 'Christian Education',
    layer: 'INTERNAL',
    groupKey: 'spiritual-formation',
    project: 'Destiny Leadership Institute',
    outcome: 'Train 1,000 leaders in five years',
  },
  {
    gate: 'Youth',
    layer: 'INTERNAL',
    groupKey: 'family',
    project: 'Next Generation Leadership Fellowship',
    outcome: 'Raise future church and societal leaders',
  },
  {
    gate: 'Media',
    layer: 'INTERNAL',
    groupKey: 'worship-communication',
    project: 'Digital Broadcasting Studio',
    outcome: '24/7 digital content ecosystem',
  },
  {
    gate: 'Governance & Public Policy',
    layer: 'INFLUENCE',
    groupKey: 'governance',
    project: 'Faith & Public Leadership Forum',
    outcome: 'Prepare believers for public service',
  },
  {
    gate: 'Healthcare & Medicine',
    layer: 'INFLUENCE',
    groupKey: 'human-development',
    project: 'Community Health Initiative',
    outcome: '10,000 beneficiaries annually',
  },
  {
    gate: 'Technology & Software',
    layer: 'INFLUENCE',
    groupKey: 'science-infrastructure',
    project: 'Technology & AI Innovation Lab',
    outcome: 'Train digital-age leaders',
  },
]

const LEGACY_PROJECTS_BY_GATE = new Map(LEGACY_PROJECTS.map((p) => [`${p.layer}:${p.gate}`, p]))

export function getGateSlug(name) {
  return slugify(name)
}

// Returns the Legacy Project attached to a given gate, if the source deck names one.
export function getLegacyProjectForGate(layer, gateName) {
  return LEGACY_PROJECTS_BY_GATE.get(`${layer}:${gateName}`) || null
}

export function getGroupName(layer, groupKey) {
  const groups = layer === 'INFLUENCE' ? INFLUENCE_SECTORS : INTERNAL_CATEGORIES
  return groups.find((g) => g.key === groupKey)?.name || groupKey
}

// Gatekeeper role structure (per gate).
export const GATEKEEPER_ROLES = [
  { role: 'Gate Patron', description: 'Senior oversight, usually a pastor or elder.' },
  { role: 'Chief Gatekeeper', description: 'Operational head of the gate.' },
  { role: 'Emerging Gatekeeper', description: 'Successor-in-training.' },
]

// Commissioning process (5 phases).
export const COMMISSIONING_PHASES = [
  { phase: 'Recognition', description: 'Identifying those already stewarding influence in a gate.' },
  { phase: 'Nomination', description: 'Senior leadership nominates candidates for a gate role.' },
  { phase: 'Validation', description: 'Assessed on character, competence, contribution, and capacity.' },
  { phase: 'Formation', description: 'Gatekeepers Academy — Spiritual Leadership, Governance, Stewardship, Strategic Planning, Project Management, Succession Development.' },
  { phase: 'Commissioning', description: 'Public covenant, mandate, and impartation.' },
]

// Org-type value props for prospective partners.
export const PARTNER_TYPES = [
  'Government',
  'Corporate',
  'Development Partners',
  'Educational Institutions',
  'Churches',
  'Individuals',
]
