import { NATION_IMAGES, imgUrl } from './images'

describe('NATION_IMAGES', () => {
  it('exposes an entry for every section key used across the Nation site', () => {
    expect(Object.keys(NATION_IMAGES)).toEqual(
      expect.arrayContaining(['hero', 'internalGates', 'influenceGates', 'legacyProjects', 'partner'])
    )
  })

  it.each(Object.entries(NATION_IMAGES))('%s has url, alt, credit and creditUrl', (_key, entry) => {
    expect(typeof entry.url).toBe('string')
    expect(entry.url.length).toBeGreaterThan(0)
    expect(typeof entry.alt).toBe('string')
    expect(entry.alt.length).toBeGreaterThan(0)
    expect(typeof entry.credit).toBe('string')
    expect(entry.credit.length).toBeGreaterThan(0)
    expect(entry.creditUrl).toMatch(/^https:\/\/unsplash\.com\//)
  })
})

describe('imgUrl', () => {
  it('builds a URL with the default width and quality when no options are given', () => {
    const url = imgUrl('hero')
    expect(url).toBe(`${NATION_IMAGES.hero.url}?auto=format&fit=crop&w=1600&q=75`)
  })

  it('honors a custom width', () => {
    const url = imgUrl('internalGates', { w: 2000 })
    expect(url).toBe(`${NATION_IMAGES.internalGates.url}?auto=format&fit=crop&w=2000&q=75`)
  })

  it('honors a custom quality', () => {
    const url = imgUrl('influenceGates', { q: 50 })
    expect(url).toBe(`${NATION_IMAGES.influenceGates.url}?auto=format&fit=crop&w=1600&q=50`)
  })

  it('honors both custom width and quality together', () => {
    const url = imgUrl('legacyProjects', { w: 800, q: 40 })
    expect(url).toBe(`${NATION_IMAGES.legacyProjects.url}?auto=format&fit=crop&w=800&q=40`)
  })

  it('throws when given a key that is not in NATION_IMAGES', () => {
    expect(() => imgUrl('doesNotExist')).toThrow()
  })
})
