import { GET } from './route'

vi.mock('@/lib/cloudinary', () => ({
  getUploadFolder: vi.fn(() => 'dmga/global/yellowpages'),
  generateUploadSignature: vi.fn(() => ({ signature: 'sig', timestamp: 123, folder: 'dmga/global/yellowpages', cloudName: 'c', apiKey: 'k' })),
}))

import { getUploadFolder, generateUploadSignature } from '@/lib/cloudinary'

function makeRequest(query = '') {
  return new Request(`http://localhost/api/yellowpages/upload-signature${query}`)
}

describe('GET /api/yellowpages/upload-signature', () => {
  beforeEach(() => vi.clearAllMocks())

  it('always uses the fixed global/yellowpages folder, ignoring any client input', async () => {
    await GET(makeRequest('?type=logo'))
    expect(getUploadFolder).toHaveBeenCalledWith('global', 'yellowpages')
  })

  it('defaults to a "logo" tag when type is omitted or unrecognized', async () => {
    await GET(makeRequest())
    expect(generateUploadSignature).toHaveBeenCalledWith('dmga/global/yellowpages', ['yellowpages', 'logo'])
  })

  it('tags a "photo" upload correctly', async () => {
    await GET(makeRequest('?type=photo'))
    expect(generateUploadSignature).toHaveBeenCalledWith('dmga/global/yellowpages', ['yellowpages', 'photo'])
  })

  it('returns the signature payload as-is', async () => {
    const res = await GET(makeRequest())
    const body = await res.json()
    expect(body).toEqual({ signature: 'sig', timestamp: 123, folder: 'dmga/global/yellowpages', cloudName: 'c', apiKey: 'k' })
  })
})
