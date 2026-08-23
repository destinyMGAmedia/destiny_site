import crypto from 'crypto'
import {
  verifyWebhookSignature,
  createSubaccount,
  listBanks,
  resolveAccount,
  createContributionDva,
} from './paystack'

function mockFetchOnce(status, jsonBody) {
  global.fetch = vi.fn().mockResolvedValue({
    status,
    json: () => Promise.resolve(jsonBody),
  })
}

describe('verifyWebhookSignature', () => {
  const secret = 'sk_test_abc123'

  beforeEach(() => {
    vi.stubEnv('PAYSTACK_SECRET_KEY', secret)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts a signature computed with HMAC-SHA512 over the raw body using the secret key', () => {
    const rawBody = '{"event":"charge.success"}'
    const validSignature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
    expect(verifyWebhookSignature(rawBody, validSignature)).toBe(true)
  })

  it('rejects a signature computed with the wrong secret', () => {
    const rawBody = '{"event":"charge.success"}'
    const wrongSignature = crypto.createHmac('sha512', 'wrong-secret').update(rawBody).digest('hex')
    expect(verifyWebhookSignature(rawBody, wrongSignature)).toBe(false)
  })

  it('rejects when the body has been tampered with after signing', () => {
    const signature = crypto.createHmac('sha512', secret).update('{"amount":100}').digest('hex')
    expect(verifyWebhookSignature('{"amount":999999}', signature)).toBe(false)
  })

  it('rejects when the signature header is missing', () => {
    expect(verifyWebhookSignature('{"event":"charge.success"}', undefined)).toBe(false)
  })

  it('returns false (rejects) when PAYSTACK_SECRET_KEY is not set, never silently accepts', () => {
    vi.unstubAllEnvs()
    expect(verifyWebhookSignature('{"event":"charge.success"}', 'anything')).toBe(false)
  })
})

describe('createSubaccount', () => {
  beforeEach(() => {
    vi.stubEnv('PAYSTACK_SECRET_KEY', 'sk_test_abc123')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('posts the correct payload shape and returns the subaccount_code on success', async () => {
    mockFetchOnce(200, { status: true, data: { subaccount_code: 'ACCT_xyz123' } })

    const code = await createSubaccount({
      businessName: 'Destiny Mission Global Assembly',
      bankCode: '058',
      accountNumber: '0123456789',
    })

    expect(code).toBe('ACCT_xyz123')
    const [url, options] = global.fetch.mock.calls[0]
    expect(url).toBe('https://api.paystack.co/subaccount')
    expect(options.method).toBe('POST')
    expect(options.headers.Authorization).toBe('Bearer sk_test_abc123')
    expect(JSON.parse(options.body)).toEqual({
      business_name: 'Destiny Mission Global Assembly',
      settlement_bank: '058',
      account_number: '0123456789',
      percentage_charge: 0,
    })
  })

  it('throws with Paystack’s message when the API reports failure', async () => {
    mockFetchOnce(400, { status: false, message: 'Invalid account number' })

    await expect(
      createSubaccount({ businessName: 'X', bankCode: '058', accountNumber: 'bad' })
    ).rejects.toThrow('Invalid account number')
  })

  it('throws a generic message when the API reports failure with no message', async () => {
    mockFetchOnce(400, { status: false })
    await expect(
      createSubaccount({ businessName: 'X', bankCode: '058', accountNumber: 'bad' })
    ).rejects.toThrow('Failed to create subaccount')
  })

  it('includes a custom percentageCharge and description in the payload when provided', async () => {
    mockFetchOnce(200, { status: true, data: { subaccount_code: 'ACCT_xyz123' } })

    await createSubaccount({
      businessName: 'Destiny Mission Global Assembly',
      bankCode: '058',
      accountNumber: '0123456789',
      percentageCharge: 2.5,
      description: 'Platform cut for processing',
    })

    const [, options] = global.fetch.mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({
      business_name: 'Destiny Mission Global Assembly',
      settlement_bank: '058',
      account_number: '0123456789',
      percentage_charge: 2.5,
      description: 'Platform cut for processing',
    })
  })
})

describe('listBanks', () => {
  beforeEach(() => vi.stubEnv('PAYSTACK_SECRET_KEY', 'sk_test_abc123'))
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('maps the response down to { name, code } pairs', async () => {
    mockFetchOnce(200, {
      status: true,
      data: [
        { name: 'Guaranty Trust Bank', code: '058', extra: 'ignored' },
        { name: 'Wema Bank', code: '035' },
      ],
    })

    const banks = await listBanks()
    expect(banks).toEqual([
      { name: 'Guaranty Trust Bank', code: '058' },
      { name: 'Wema Bank', code: '035' },
    ])
  })

  it('returns an empty array when Paystack reports failure, rather than throwing', async () => {
    mockFetchOnce(500, { status: false })
    const banks = await listBanks()
    expect(banks).toEqual([])
  })

  it('returns an empty array when status is true but data is missing', async () => {
    mockFetchOnce(200, { status: true })
    const banks = await listBanks()
    expect(banks).toEqual([])
  })

  it('requests the NGN currency and a 200-item page size', async () => {
    mockFetchOnce(200, { status: true, data: [] })
    await listBanks()
    const [url] = global.fetch.mock.calls[0]
    expect(url).toBe('https://api.paystack.co/bank?currency=NGN&per_page=200')
  })
})

describe('resolveAccount', () => {
  beforeEach(() => vi.stubEnv('PAYSTACK_SECRET_KEY', 'sk_test_abc123'))
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('returns the resolved account data on success', async () => {
    mockFetchOnce(200, { status: true, data: { account_name: 'JOHN DOE', account_number: '0123456789' } })
    const result = await resolveAccount({ accountNumber: '0123456789', bankCode: '058' })
    expect(result).toEqual({ account_name: 'JOHN DOE', account_number: '0123456789' })
  })

  it('throws when the account cannot be resolved', async () => {
    mockFetchOnce(400, { status: false, message: 'Could not resolve account name' })
    await expect(resolveAccount({ accountNumber: 'bad', bankCode: '058' })).rejects.toThrow(
      'Could not resolve account name'
    )
  })
})

describe('createContributionDva', () => {
  beforeEach(() => {
    vi.stubEnv('PAYSTACK_SECRET_KEY', 'sk_test_abc123')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('creates a customer named Destiny/Nation with a unique synthesized email, then a linked DVA', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ status: true, data: { customer_code: 'CUS_abc123' } }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: () =>
          Promise.resolve({
            status: true,
            data: {
              bank: { name: 'Wema Bank' },
              account_number: '9999999999',
              account_name: 'DESTINY NATION',
            },
          }),
      })

    const result = await createContributionDva({ reference: 'DN-PSK-123-abcd', subaccountCode: 'ACCT_church' })

    expect(result).toEqual({
      customerCode: 'CUS_abc123',
      bank: 'Wema Bank',
      accountNumber: '9999999999',
      accountName: 'DESTINY NATION',
    })

    const [customerUrl, customerOptions] = global.fetch.mock.calls[0]
    expect(customerUrl).toBe('https://api.paystack.co/customer')
    const customerBody = JSON.parse(customerOptions.body)
    expect(customerBody.first_name).toBe('Destiny')
    expect(customerBody.last_name).toBe('Nation')
    expect(customerBody.email).toBe('give+dn-psk-123-abcd@destinymissionglobal.org')

    const [dvaUrl, dvaOptions] = global.fetch.mock.calls[1]
    expect(dvaUrl).toBe('https://api.paystack.co/dedicated_account')
    expect(JSON.parse(dvaOptions.body)).toEqual({
      customer: 'CUS_abc123',
      preferred_bank: 'wema-bank',
      subaccount: 'ACCT_church',
    })
  })

  it('omits the subaccount field entirely when none is provided', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ status: true, data: { customer_code: 'CUS_abc123' } }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: () =>
          Promise.resolve({
            status: true,
            data: { bank: { name: 'Wema Bank' }, account_number: '111', account_name: 'DESTINY NATION' },
          }),
      })

    await createContributionDva({ reference: 'DN-PSK-1' })

    const [, dvaOptions] = global.fetch.mock.calls[1]
    expect(JSON.parse(dvaOptions.body)).not.toHaveProperty('subaccount')
  })

  it('throws a descriptive error when the dedicated-account feature is not enabled', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ status: true, data: { customer_code: 'CUS_abc123' } }),
      })
      .mockResolvedValueOnce({
        status: 400,
        json: () => Promise.resolve({ status: false, code: 'feature_unavailable', message: 'Not eligible' }),
      })

    await expect(createContributionDva({ reference: 'DN-PSK-2' })).rejects.toThrow(
      /not yet enabled/i
    )
  })

  it('throws when customer creation itself fails', async () => {
    mockFetchOnce(400, { status: false, message: 'Invalid email' })
    await expect(createContributionDva({ reference: 'DN-PSK-3' })).rejects.toThrow('Invalid email')
  })
})
