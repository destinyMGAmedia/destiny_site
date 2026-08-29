import {
  getTier,
  isPledgeTier,
  convertFromNGN,
  LADDER_TIERS,
  FOUNDERS_CIRCLE_TIERS,
  LADDER_PLEDGE_CUTOFF,
} from './tiers'

describe('getTier', () => {
  it('finds a tier in the LADDER package', () => {
    const tier = getTier('LADDER', 'GATE_CHAMPION')
    expect(tier).toEqual(LADDER_TIERS.find((t) => t.key === 'GATE_CHAMPION'))
  })

  it('finds a tier in the FOUNDERS_CIRCLE package', () => {
    const tier = getTier('FOUNDERS_CIRCLE', 'GOLD')
    expect(tier).toEqual(FOUNDERS_CIRCLE_TIERS.find((t) => t.key === 'GOLD'))
  })

  it('returns null for an unknown tier key', () => {
    expect(getTier('LADDER', 'NOT_A_TIER')).toBeNull()
    expect(getTier('FOUNDERS_CIRCLE', 'NOT_A_TIER')).toBeNull()
  })

  it('defaults to the LADDER package for an unrecognized package name', () => {
    const tier = getTier('SOMETHING_ELSE', 'GATE_CHAMPION')
    expect(tier).toEqual(LADDER_TIERS.find((t) => t.key === 'GATE_CHAMPION'))
  })
})

describe('isPledgeTier', () => {
  it('is always true for FOUNDERS_CIRCLE regardless of tier', () => {
    expect(isPledgeTier('FOUNDERS_CIRCLE', 'BRONZE')).toBe(true)
    expect(isPledgeTier('FOUNDERS_CIRCLE', 'PLATINUM')).toBe(true)
    expect(isPledgeTier('FOUNDERS_CIRCLE', 'NOT_A_TIER')).toBe(true)
  })

  it('is false for LADDER tiers below the pledge cutoff', () => {
    const belowCutoff = LADDER_TIERS.find((t) => t.amount < LADDER_PLEDGE_CUTOFF)
    expect(belowCutoff).toBeTruthy()
    expect(isPledgeTier('LADDER', belowCutoff.key)).toBe(false)
  })

  it('is true for LADDER tiers at or above the pledge cutoff', () => {
    const atCutoff = LADDER_TIERS.find((t) => t.amount === LADDER_PLEDGE_CUTOFF)
    expect(atCutoff).toBeTruthy()
    expect(isPledgeTier('LADDER', atCutoff.key)).toBe(true)

    const aboveCutoff = LADDER_TIERS.find((t) => t.amount > LADDER_PLEDGE_CUTOFF)
    expect(aboveCutoff).toBeTruthy()
    expect(isPledgeTier('LADDER', aboveCutoff.key)).toBe(true)
  })

  it('returns false for an unknown tier key in the LADDER package', () => {
    expect(isPledgeTier('LADDER', 'NOT_A_TIER')).toBe(false)
  })
})

describe('convertFromNGN', () => {
  it('is an identity conversion for NGN', () => {
    expect(convertFromNGN(1_000_000, 'NGN')).toBe(1_000_000)
  })

  it('converts to USD with rounding', () => {
    expect(convertFromNGN(1_600_000, 'USD')).toBe(1000)
  })

  it('converts to GBP with rounding', () => {
    expect(convertFromNGN(2_000_000, 'GBP')).toBe(1000)
  })

  it('converts to EUR with rounding', () => {
    expect(convertFromNGN(1_750_000, 'EUR')).toBe(1000)
  })

  it('rounds fractional results', () => {
    // 100,000 NGN / 1600 = 62.5 -> rounds to 63 (banker's rounding not used, Math.round(62.5) === 63)
    expect(convertFromNGN(100_000, 'USD')).toBe(63)
  })

  it('throws for an unsupported currency', () => {
    expect(() => convertFromNGN(1000, 'XYZ')).toThrow('Unsupported currency: XYZ')
  })
})
