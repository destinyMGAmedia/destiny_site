import {
  getGateSlug,
  getLegacyProjectForGate,
  getGroupName,
  INTERNAL_CATEGORIES,
  INFLUENCE_SECTORS,
} from './gates'

describe('getGateSlug', () => {
  it('lowercases the name', () => {
    expect(getGateSlug('Worship')).toBe('worship')
  })

  it('replaces & with "and"', () => {
    expect(getGateSlug('Missions & Evangelism')).toBe('missions-and-evangelism')
  })

  it('strips non-alphanumeric characters down to hyphens', () => {
    expect(getGateSlug('Governance & Public Policy')).toBe('governance-and-public-policy')
  })

  it('trims leading and trailing hyphens', () => {
    expect(getGateSlug('  Security & Risk Management  ')).toBe('security-and-risk-management')
  })

  it('collapses punctuation like commas into single separators', () => {
    expect(getGateSlug('Publications & Knowledge Management')).toBe('publications-and-knowledge-management')
  })
})

describe('getLegacyProjectForGate', () => {
  it('returns the project for a known gate+layer pair', () => {
    const project = getLegacyProjectForGate('INTERNAL', 'Christian Education')
    expect(project).toEqual({
      gate: 'Christian Education',
      layer: 'INTERNAL',
      groupKey: 'spiritual-formation',
      project: 'Destiny Leadership Institute',
      outcome: 'Train 1,000 leaders in five years',
    })
  })

  it('returns the project for an INFLUENCE layer gate', () => {
    const project = getLegacyProjectForGate('INFLUENCE', 'Healthcare & Medicine')
    expect(project).toMatchObject({ project: 'Community Health Initiative' })
  })

  it('returns null for an unknown gate', () => {
    expect(getLegacyProjectForGate('INTERNAL', 'Not A Real Gate')).toBeNull()
  })

  it('returns null when the gate exists but under the wrong layer', () => {
    expect(getLegacyProjectForGate('INFLUENCE', 'Christian Education')).toBeNull()
  })
})

describe('getGroupName', () => {
  it('resolves an INTERNAL category name from its key', () => {
    const key = INTERNAL_CATEGORIES[0].key
    expect(getGroupName('INTERNAL', key)).toBe(INTERNAL_CATEGORIES[0].name)
  })

  it('resolves an INFLUENCE sector name from its key', () => {
    const key = INFLUENCE_SECTORS[0].key
    expect(getGroupName('INFLUENCE', key)).toBe(INFLUENCE_SECTORS[0].name)
  })

  it('falls back to the raw key when not found in INTERNAL', () => {
    expect(getGroupName('INTERNAL', 'not-a-real-key')).toBe('not-a-real-key')
  })

  it('falls back to the raw key when not found in INFLUENCE', () => {
    expect(getGroupName('INFLUENCE', 'not-a-real-key')).toBe('not-a-real-key')
  })
})
