import { checkEditAuthorization } from './editAuth'
import prisma from '@/lib/prisma'
import { EDIT_TOKEN_WINDOW_MINUTES } from './constants'

// prisma is the one true process boundary here (a real Postgres connection). The project
// convention — see the sibling route tests — is to substitute it with a vi.fn-backed double.
vi.mock('@/lib/prisma', () => ({
  default: { yellowPagesEditOtp: { findUnique: vi.fn() } },
}))

const listing = {
  id: 'listing-1',
  phone: '08012345678',
  email: 'owner@example.com',
  editStrict: false,
  editContacts: ['editor@example.com'],
}

const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000)

describe('checkEditAuthorization — editToken path', () => {
  beforeEach(() => vi.clearAllMocks())

  it('authorizes a consumed OTP for this listing inside the token window', async () => {
    prisma.yellowPagesEditOtp.findUnique.mockResolvedValue({
      id: 'otp-1',
      listingId: 'listing-1',
      consumedAt: minutesAgo(EDIT_TOKEN_WINDOW_MINUTES - 1),
    })
    await expect(checkEditAuthorization(listing, { editToken: '  otp-1  ' })).resolves.toEqual({ ok: true })
    expect(prisma.yellowPagesEditOtp.findUnique).toHaveBeenCalledWith({ where: { id: 'otp-1' } })
  })

  it('rejects an unknown token', async () => {
    prisma.yellowPagesEditOtp.findUnique.mockResolvedValue(null)
    await expect(checkEditAuthorization(listing, { editToken: 'nope' })).resolves.toMatchObject({ ok: false, status: 403 })
  })

  it('rejects a token that belongs to another listing', async () => {
    prisma.yellowPagesEditOtp.findUnique.mockResolvedValue({
      id: 'otp-2',
      listingId: 'other-listing',
      consumedAt: minutesAgo(1),
    })
    await expect(checkEditAuthorization(listing, { editToken: 'otp-2' })).resolves.toMatchObject({ ok: false, status: 403 })
  })

  it('rejects an OTP that was never consumed', async () => {
    prisma.yellowPagesEditOtp.findUnique.mockResolvedValue({ id: 'otp-3', listingId: 'listing-1', consumedAt: null })
    await expect(checkEditAuthorization(listing, { editToken: 'otp-3' })).resolves.toMatchObject({ ok: false, status: 403 })
  })

  it('rejects a token consumed before the window cutoff', async () => {
    prisma.yellowPagesEditOtp.findUnique.mockResolvedValue({
      id: 'otp-4',
      listingId: 'listing-1',
      consumedAt: minutesAgo(EDIT_TOKEN_WINDOW_MINUTES + 5),
    })
    await expect(checkEditAuthorization(listing, { editToken: 'otp-4' })).resolves.toMatchObject({ ok: false, status: 403 })
  })
})

describe('checkEditAuthorization — owner phone/email path', () => {
  beforeEach(() => vi.clearAllMocks())

  it('400 when neither a token nor a phone/email is supplied', async () => {
    await expect(checkEditAuthorization(listing, {})).resolves.toMatchObject({ ok: false, status: 400 })
    await expect(checkEditAuthorization(listing)).resolves.toMatchObject({ ok: false, status: 400 })
  })

  it('authorizes the public phone (with separators) when not editStrict', async () => {
    await expect(checkEditAuthorization(listing, { ownerPhone: '0801-234-5678' })).resolves.toEqual({ ok: true })
  })

  it('authorizes the public email case-insensitively', async () => {
    await expect(checkEditAuthorization(listing, { ownerEmail: 'OWNER@example.com' })).resolves.toEqual({ ok: true })
  })

  it('authorizes an editContacts entry', async () => {
    await expect(checkEditAuthorization(listing, { ownerEmail: 'editor@example.com' })).resolves.toEqual({ ok: true })
  })

  it('403 for a contact that is not on file', async () => {
    await expect(checkEditAuthorization(listing, { ownerEmail: 'stranger@example.com' })).resolves.toMatchObject({
      ok: false,
      status: 403,
    })
  })

  it('with editStrict, the public phone/email no longer authorize', async () => {
    const strict = { ...listing, editStrict: true }
    await expect(checkEditAuthorization(strict, { ownerPhone: '08012345678' })).resolves.toMatchObject({ ok: false, status: 403 })
    await expect(checkEditAuthorization(strict, { ownerEmail: 'editor@example.com' })).resolves.toEqual({ ok: true })
  })

  it('never touches the database on the phone/email path', async () => {
    await checkEditAuthorization(listing, { ownerPhone: '08012345678' })
    expect(prisma.yellowPagesEditOtp.findUnique).not.toHaveBeenCalled()
  })
})
