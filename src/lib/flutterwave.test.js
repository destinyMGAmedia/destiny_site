import { createPayment, verifyPayment } from './flutterwave'

describe('flutterwave', () => {
  beforeEach(() => {
    vi.stubEnv('FLUTTERWAVE_SECRET_KEY', 'test-secret-key')
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  describe('createPayment', () => {
    it('returns the payment link on success', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success', data: { link: 'https://checkout.example/abc' } }),
      })

      const link = await createPayment({
        txRef: 'tx-123',
        amount: 50000,
        currency: 'NGN',
        redirectUrl: 'https://example.com/thanks',
        customer: { email: 'donor@example.com' },
        meta: { tier: 'GATE_CHAMPION' },
      })

      expect(link).toBe('https://checkout.example/abc')
      expect(global.fetch).toHaveBeenCalledTimes(1)

      const [url, options] = global.fetch.mock.calls[0]
      expect(url).toBe('https://api.flutterwave.com/v3/payments')
      expect(options.method).toBe('POST')
      expect(options.headers.Authorization).toBe('Bearer test-secret-key')
      expect(options.headers['Content-Type']).toBe('application/json')

      const body = JSON.parse(options.body)
      expect(body.tx_ref).toBe('tx-123')
      expect(body.amount).toBe(50000)
      expect(body.currency).toBe('NGN')
      expect(body.redirect_url).toBe('https://example.com/thanks')
      expect(body.customer).toEqual({ email: 'donor@example.com' })
      expect(body.meta).toEqual({ tier: 'GATE_CHAMPION' })
      expect(body.customizations).toEqual({
        title: 'Destiny Nation — The Gatekeepers Commission',
        description: 'Give to Destiny Nation',
      })
    })

    it('throws when data.status is not success', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'error', message: 'Invalid amount' }),
      })

      await expect(
        createPayment({ txRef: 'tx-1', amount: 100, currency: 'NGN', redirectUrl: 'x', customer: {}, meta: {} })
      ).rejects.toThrow('Invalid amount')
    })

    it('throws when the response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ status: 'error', message: 'Server error' }),
      })

      await expect(
        createPayment({ txRef: 'tx-1', amount: 100, currency: 'NGN', redirectUrl: 'x', customer: {}, meta: {} })
      ).rejects.toThrow('Server error')
    })

    it('throws a default message when !res.ok and no message present', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })

      await expect(
        createPayment({ txRef: 'tx-1', amount: 100, currency: 'NGN', redirectUrl: 'x', customer: {}, meta: {} })
      ).rejects.toThrow('Failed to initialize Flutterwave payment')
    })

    it('rejects when FLUTTERWAVE_SECRET_KEY is not configured', async () => {
      vi.stubEnv('FLUTTERWAVE_SECRET_KEY', '')

      await expect(
        createPayment({ txRef: 'tx-1', amount: 100, currency: 'NGN', redirectUrl: 'x', customer: {}, meta: {} })
      ).rejects.toThrow('FLUTTERWAVE_SECRET_KEY is not configured')
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('verifyPayment', () => {
    it('maps a successful transaction to SUCCESS and returns tx details', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { status: 'successful', tx_ref: 'tx-123', amount: 50000, currency: 'NGN' },
        }),
      })

      const result = await verifyPayment('12345')

      expect(result).toEqual({
        status: 'SUCCESS',
        txRef: 'tx-123',
        amount: 50000,
        currency: 'NGN',
      })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.flutterwave.com/v3/transactions/12345/verify',
        { headers: { Authorization: 'Bearer test-secret-key' } }
      )
    })

    it('maps any non-successful status to FAILED', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { status: 'failed', tx_ref: 'tx-999', amount: 1000, currency: 'NGN' },
        }),
      })

      const result = await verifyPayment('999')
      expect(result.status).toBe('FAILED')
    })

    it('throws when the response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Transaction not found' }),
      })

      await expect(verifyPayment('bad-id')).rejects.toThrow('Transaction not found')
    })

    it('throws a default message when !res.ok and no message present', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })

      await expect(verifyPayment('bad-id')).rejects.toThrow('Failed to verify Flutterwave transaction')
    })

    it('rejects when FLUTTERWAVE_SECRET_KEY is not configured', async () => {
      vi.stubEnv('FLUTTERWAVE_SECRET_KEY', '')

      await expect(verifyPayment('tx-1')).rejects.toThrow('FLUTTERWAVE_SECRET_KEY is not configured')
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})
