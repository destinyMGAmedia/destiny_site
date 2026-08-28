import {
  buildResumeModel,
  resumeGaps,
  normalizeLocale,
  normalizeTemplate,
  localeConfig,
  resumeFileName,
} from './resumeModel'

const listing = {
  name: 'Jane Developer',
  headline: 'Full-stack Engineer',
  resumeSummary: 'Ten years shipping web apps.',
  email: 'jane@example.com',
  phone: '08012345678',
  city: 'Lagos',
  country: 'Nigeria',
  socialLinks: { linkedin: 'in/jane' },
  skills: ['React', 'Node.js'],
  languages: ['English'],
  experience: [
    { title: 'Engineer', organization: 'Acme', startDate: '2020', endDate: '2024', current: false, description: 'Built A\nShipped B\n• Led C' },
  ],
  education: [{ school: 'Uni', degree: 'BSc', field: 'CS', startYear: '2012', endYear: '2016' }],
  projects: [{ name: 'Thing', role: 'Lead', url: 'https://thing.dev', description: 'A thing' }],
  certifications: 'AWS SA',
}

describe('normalizeTemplate / normalizeLocale / localeConfig', () => {
  it('falls back to CLASSIC for unknown templates', () => {
    expect(normalizeTemplate('WILD')).toBe('CLASSIC')
    expect(normalizeTemplate('MODERN')).toBe('MODERN')
    expect(normalizeTemplate(undefined)).toBe('CLASSIC')
    expect(normalizeTemplate(null)).toBe('CLASSIC')
    expect(normalizeTemplate('')).toBe('CLASSIC')
    expect(normalizeTemplate('CLASSIC')).toBe('CLASSIC')
    expect(normalizeTemplate('COMPACT')).toBe('COMPACT')
  })

  it('defaults Nigeria and the UK to the UK ("CV") locale, everything else to US', () => {
    expect(normalizeLocale(null, 'Nigeria')).toBe('UK')
    expect(normalizeLocale(null, 'United Kingdom')).toBe('UK')
    expect(normalizeLocale(null, 'United States')).toBe('US')
    expect(normalizeLocale(null, '')).toBe('US')
    expect(normalizeLocale('US', 'Nigeria')).toBe('US') // explicit wins
  })

  it('honours an explicit valid locale regardless of country', () => {
    expect(normalizeLocale('UK', 'United States')).toBe('UK')
    expect(normalizeLocale('US', 'United Kingdom')).toBe('US')
    expect(normalizeLocale('UK')).toBe('UK')
    expect(normalizeLocale('US')).toBe('US')
  })

  it('recognises every spelling of the UK plus Nigeria, and treats unknowns / nullish country as US', () => {
    for (const c of ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Britain', 'the UK', 'NIGERIA']) {
      expect(normalizeLocale(null, c)).toBe('UK')
    }
    for (const c of ['Canada', 'Ghana', 'Kenya', '', null, undefined]) {
      expect(normalizeLocale(null, c)).toBe('US')
    }
    expect(normalizeLocale('bogus', 'Canada')).toBe('US') // invalid explicit -> country rules
  })

  it('localeConfig maps to the right words', () => {
    expect(localeConfig('UK')).toMatchObject({
      locale: 'UK', docWord: 'CV', fileWord: 'cv', spelling: 'British', experienceHeading: 'Professional Experience',
    })
    expect(localeConfig('US')).toMatchObject({
      locale: 'US', docWord: 'Résumé', fileWord: 'resume', spelling: 'American', experienceHeading: 'Work Experience',
    })
    // unknown -> US config
    expect(localeConfig('ZZ')).toMatchObject({ locale: 'US', docWord: 'Résumé' })
    expect(localeConfig(undefined)).toMatchObject({ locale: 'US' })
  })
})

describe('buildResumeModel', () => {
  it('assembles contact bits, splits description into bullets, and carries locale words', () => {
    const m = buildResumeModel(listing, { template: 'MODERN', locale: 'UK' })
    expect(m.template).toBe('MODERN')
    expect(m.docWord).toBe('CV')
    expect(m.experienceHeading).toBe('Professional Experience')
    expect(m.contact.email).toBe('jane@example.com')
    expect(m.contact.links).toEqual([{ label: 'linkedin', value: 'in/jane' }])
    expect(m.experience[0].bullets).toEqual(['Built A', 'Shipped B', 'Led C'])
    expect(m.experience[0].dateRange).toBe('2020 – 2024')
  })

  it('prefers AI content (summary + per-role bullets) when resumeUseAi is on', () => {
    const withAi = {
      ...listing,
      resumeUseAi: true,
      resumeAiContent: {
        summary: 'Optimised summary.',
        skills: ['TypeScript', 'React'],
        experience: [{ bullets: ['Delivered X', 'Improved Y'] }],
      },
    }
    const m = buildResumeModel(withAi, {})
    expect(m.summary).toBe('Optimised summary.')
    expect(m.skills).toEqual(['TypeScript', 'React'])
    expect(m.experience[0].bullets).toEqual(['Delivered X', 'Improved Y'])
    expect(m.aiApplied).toBe(true)
  })

  it('ignores AI content when resumeUseAi is off', () => {
    const m = buildResumeModel({ ...listing, resumeUseAi: false, resumeAiContent: { summary: 'nope' } }, {})
    expect(m.summary).toBe('Ten years shipping web apps.')
    expect(m.aiApplied).toBe(false)
  })

  it('does not apply AI when resumeUseAi is on but resumeAiContent is empty', () => {
    const m = buildResumeModel({ ...listing, resumeUseAi: true, resumeAiContent: {} }, {})
    expect(m.aiApplied).toBe(false)
    expect(m.summary).toBe('Ten years shipping web apps.')
  })

  it('falls back to a per-role AI entry without bullets by splitting the raw description', () => {
    const withAi = {
      ...listing,
      resumeUseAi: true,
      resumeAiContent: {
        summary: 'x',
        experience: [{ title: 'Staff Engineer', organization: 'Acme Corp' }], // no bullets
      },
    }
    const m = buildResumeModel(withAi, {})
    expect(m.experience[0].title).toBe('Staff Engineer')
    expect(m.experience[0].organization).toBe('Acme Corp')
    expect(m.experience[0].bullets).toEqual(['Built A', 'Shipped B', 'Led C'])
  })

  it('defaults name to the locale doc word and assembles location from city/state/country', () => {
    expect(buildResumeModel({}, { locale: 'US' }).name).toBe('Résumé')
    expect(buildResumeModel({}, { locale: 'UK' }).name).toBe('CV')
    const m = buildResumeModel({ city: 'Lagos', state: 'Lagos', country: 'Nigeria' }, {})
    expect(m.contact.location).toBe('Lagos, Lagos, Nigeria')
    expect(buildResumeModel({ country: 'Nigeria' }, {}).contact.location).toBe('Nigeria')
  })

  it('drops falsy social links and trims their values', () => {
    const m = buildResumeModel({ ...listing, socialLinks: { linkedin: ' in/jane ', github: '', x: null } }, {})
    expect(m.contact.links).toEqual([{ label: 'linkedin', value: 'in/jane' }])
  })

  it('builds date ranges from any combination of start / end / current', () => {
    const m = buildResumeModel({
      experience: [
        { title: 'A', startDate: '2020', endDate: '2024' },
        { title: 'B', startDate: '2022', current: true },
        { title: 'C', startDate: '2019' },
        { title: 'D', endDate: '2018' },
        { title: 'E' },
      ],
    }, {})
    expect(m.experience.map((e) => e.dateRange)).toEqual(['2020 – 2024', '2022 – Present', '2019', '2018', ''])
  })

  it('splits descriptions on newlines and "-"/"*"/"•" markers', () => {
    const m = buildResumeModel({
      experience: [
        { title: 'A', description: '- one\n- two\n- three' },
        { title: 'B', description: '* alpha\n* beta' },
        { title: 'C', description: 'single line' },
        { title: 'D', description: '   ' },
      ],
    }, {})
    expect(m.experience[0].bullets).toEqual(['one', 'two', 'three'])
    expect(m.experience[1].bullets).toEqual(['alpha', 'beta'])
    expect(m.experience[2].bullets).toEqual(['single line'])
    expect(m.experience[3].bullets).toEqual([])
  })

  it('maps education entries: heading, conditional org, year range', () => {
    const m = buildResumeModel({
      education: [
        { school: 'MIT', degree: 'PhD', field: 'AI', startYear: '2010', endYear: '2014', description: 'thesis' },
        { school: 'OU' }, // no degree/field -> school becomes the heading, org stays empty
      ],
    }, {})
    expect(m.education[0]).toEqual({ heading: 'PhD, AI', org: 'MIT', meta: '2010 – 2014', description: 'thesis' })
    expect(m.education[1]).toEqual({ heading: 'OU', org: '', meta: '', description: '' })
  })

  it('maps project entries: name/role heading and optional url', () => {
    const m = buildResumeModel({
      projects: [
        { name: 'Thing', role: 'Lead', url: ' https://t.dev ', description: 'd' },
        { name: 'Solo' },
        { role: 'Advisor' },
      ],
    }, {})
    expect(m.projects[0]).toEqual({ heading: 'Thing — Lead', url: 'https://t.dev', description: 'd' })
    expect(m.projects[1].heading).toBe('Solo')
    expect(m.projects[2].heading).toBe('Advisor')
  })

  it('coerces non-array skills / languages / experience / education to empty', () => {
    const m = buildResumeModel({ skills: 'react', languages: null, experience: 'x', education: undefined, projects: 5 }, {})
    expect(m.skills).toEqual([])
    expect(m.languages).toEqual([])
    expect(m.experience).toEqual([])
    expect(m.education).toEqual([])
    expect(m.projects).toEqual([])
  })

  it('reads certifications from AI content first, then the listing', () => {
    expect(buildResumeModel(listing, {}).certifications).toBe('AWS SA')
    const m = buildResumeModel(
      { ...listing, resumeUseAi: true, resumeAiContent: { summary: 's', certifications: 'CISSP' } },
      {},
    )
    expect(m.certifications).toBe('CISSP')
  })
})

describe('resumeGaps', () => {
  it('is empty for a complete résumé', () => {
    expect(resumeGaps(buildResumeModel(listing, {}))).toEqual([])
  })

  it('flags a missing summary, dates, bullets, education and skills', () => {
    const bare = buildResumeModel({
      name: 'Bare',
      email: 'b@x.com',
      experience: [{ title: 'Dev', organization: 'X' }],
    }, {})
    const keys = resumeGaps(bare).map((g) => g.key)
    expect(keys).toEqual(expect.arrayContaining(['summary', 'dates', 'bullets', 'education', 'skills']))
    expect(keys).not.toContain('contact') // an email is present
    expect(keys).not.toContain('experience') // one entry is present
  })

  it('flags "experience" (not "dates"/"bullets") when there is no experience at all', () => {
    const keys = resumeGaps(buildResumeModel({ name: 'X', email: 'x@y.com' }, {})).map((g) => g.key)
    expect(keys).toContain('experience')
    expect(keys).not.toContain('dates')
    expect(keys).not.toContain('bullets')
  })

  it('flags "contact" only when both email and phone are missing', () => {
    const noContact = buildResumeModel({ name: 'X', resumeSummary: 's', skills: ['a'],
      experience: [{ title: 'T', organization: 'O', startDate: '2020', endDate: '2021', description: 'did x' }],
      education: [{ school: 'U' }] }, {})
    expect(resumeGaps(noContact).map((g) => g.key)).toEqual(['contact'])

    const phoneOnly = buildResumeModel({ name: 'X', phone: '0800', resumeSummary: 's', skills: ['a'],
      experience: [{ title: 'T', organization: 'O', startDate: '2020', endDate: '2021', description: 'did x' }],
      education: [{ school: 'U' }] }, {})
    expect(resumeGaps(phoneOnly)).toEqual([])
  })

  it('each gap carries a key, label and an anchor', () => {
    for (const g of resumeGaps(buildResumeModel({ name: 'Empty' }, {}))) {
      expect(g).toEqual(expect.objectContaining({
        key: expect.any(String), label: expect.any(String), anchor: expect.stringMatching(/^yp-/),
      }))
    }
  })
})

describe('resumeFileName', () => {
  it('slugifies the name and appends the locale word', () => {
    expect(resumeFileName(buildResumeModel(listing, { locale: 'UK' }))).toBe('jane-developer-cv.pdf')
    expect(resumeFileName(buildResumeModel(listing, { locale: 'US' }))).toBe('jane-developer-resume.pdf')
  })

  it('collapses punctuation, lowercases, and trims leading/trailing dashes', () => {
    expect(resumeFileName({ name: "  Dr. Amara O'Neil, MBA  ", fileWord: 'cv' })).toBe('dr-amara-o-neil-mba-cv.pdf')
  })

  it('caps the slug at 60 characters', () => {
    const long = 'a'.repeat(100)
    const out = resumeFileName({ name: long, fileWord: 'resume' })
    expect(out).toBe(`${'a'.repeat(60)}-resume.pdf`)
  })

  it('falls back to "resume" when the name slugifies to nothing', () => {
    expect(resumeFileName({ name: '!!!', fileWord: 'cv' })).toBe('resume-cv.pdf')
    expect(resumeFileName({ fileWord: 'cv' })).toBe('cv-cv.pdf')
  })
})
