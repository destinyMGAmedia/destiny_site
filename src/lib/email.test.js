vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({}) },
  })),
}))

import { Resend } from 'resend'
import {
  sendCredentialEmail,
  sendContributionReceiptEmail,
  sendPledgeNotificationEmail,
  sendManualGivingNotificationEmail,
} from './email'

const sendMock = Resend.mock.results[0].value.emails.send

describe('email', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 'test-resend-key')
    vi.stubEnv('RESEND_FROM_NAME', 'Test Sender')
    vi.stubEnv('RESEND_FROM_EMAIL', 'sender@example.com')
    sendMock.mockClear()
    sendMock.mockResolvedValue({})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  describe('sendCredentialEmail', () => {
    it('sends a new-account email with the expected subject and recipient', async () => {
      await sendCredentialEmail({
        to: 'admin@example.com',
        name: 'Jane Admin',
        username: 'janeadmin',
        password: 'S3cret!',
        role: 'ASSEMBLY_ADMIN',
        assemblyName: 'HQ Assembly',
      })

      expect(sendMock).toHaveBeenCalledTimes(1)
      const arg = sendMock.mock.calls[0][0]
      expect(arg.to).toBe('admin@example.com')
      expect(arg.from).toBe('Test Sender <sender@example.com>')
      expect(arg.subject).toBe('Your DMGA Admin Account Is Ready')
      expect(arg.html).toContain('Jane Admin')
      expect(arg.html).toContain('janeadmin')
      expect(arg.html).toContain('S3cret!')
      expect(arg.html).toContain('HQ Assembly')
      expect(arg.html).toContain('Your admin account has been created')
    })

    it('sends a regenerated-credentials email with a different subject/copy', async () => {
      await sendCredentialEmail({
        to: 'admin@example.com',
        name: 'Jane Admin',
        username: 'janeadmin',
        password: 'NewPass1',
        role: 'GLOBAL_ADMIN',
        isRegenerated: true,
      })

      expect(sendMock).toHaveBeenCalledTimes(1)
      const arg = sendMock.mock.calls[0][0]
      expect(arg.subject).toBe('Your DMGA Admin Credentials Have Been Reset')
      expect(arg.html).toContain('Your login credentials have been regenerated')
      expect(arg.html).toContain('Global Admin')
    })

    it('does not render an assembly row when assemblyName is not provided', async () => {
      await sendCredentialEmail({
        to: 'admin@example.com',
        name: 'Jane Admin',
        username: 'janeadmin',
        password: 'pw',
        role: 'APP_ADMIN',
      })

      const arg = sendMock.mock.calls[0][0]
      expect(arg.html).not.toContain('>Assembly<')
    })

    it('returns early without sending when "to" is falsy', async () => {
      await sendCredentialEmail({
        to: '',
        name: 'Jane Admin',
        username: 'janeadmin',
        password: 'pw',
        role: 'APP_ADMIN',
      })

      expect(sendMock).not.toHaveBeenCalled()
    })

    it('returns early without sending when RESEND_API_KEY is unset', async () => {
      vi.stubEnv('RESEND_API_KEY', '')

      await sendCredentialEmail({
        to: 'admin@example.com',
        name: 'Jane Admin',
        username: 'janeadmin',
        password: 'pw',
        role: 'APP_ADMIN',
      })

      expect(sendMock).not.toHaveBeenCalled()
    })

    it('logs and does not throw when resend.emails.send rejects', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      sendMock.mockRejectedValueOnce(new Error('network down'))

      await expect(
        sendCredentialEmail({
          to: 'admin@example.com',
          name: 'Jane Admin',
          username: 'janeadmin',
          password: 'pw',
          role: 'APP_ADMIN',
        })
      ).resolves.toBeUndefined()

      expect(consoleSpy).toHaveBeenCalledWith('[EMAIL] Failed to send credential email:', 'network down')
    })
  })

  describe('sendContributionReceiptEmail', () => {
    it('sends a receipt email with donor/tier/amount details', async () => {
      await sendContributionReceiptEmail({
        to: 'donor@example.com',
        donorName: 'John Donor',
        tierName: 'Gate Champion',
        packageLabel: 'The Gatekeepers Ladder',
        amount: 10_000_000,
        currency: 'NGN',
      })

      expect(sendMock).toHaveBeenCalledTimes(1)
      const arg = sendMock.mock.calls[0][0]
      expect(arg.to).toBe('donor@example.com')
      expect(arg.subject).toBe('Thank You for Partnering with Destiny Nation')
      expect(arg.html).toContain('John Donor')
      expect(arg.html).toContain('Gate Champion')
      expect(arg.html).toContain('The Gatekeepers Ladder')
      expect(arg.html).toContain('NGN 10,000,000')
    })

    it('returns early without sending when "to" is falsy', async () => {
      await sendContributionReceiptEmail({
        to: '',
        donorName: 'John Donor',
        tierName: 'Gate Champion',
        packageLabel: 'Ladder',
        amount: 1000,
        currency: 'NGN',
      })

      expect(sendMock).not.toHaveBeenCalled()
    })

    it('returns early without sending when RESEND_API_KEY is unset', async () => {
      vi.stubEnv('RESEND_API_KEY', '')

      await sendContributionReceiptEmail({
        to: 'donor@example.com',
        donorName: 'John Donor',
        tierName: 'Gate Champion',
        packageLabel: 'Ladder',
        amount: 1000,
        currency: 'NGN',
      })

      expect(sendMock).not.toHaveBeenCalled()
    })

    it('logs and does not throw when resend.emails.send rejects', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      sendMock.mockRejectedValueOnce(new Error('boom'))

      await expect(
        sendContributionReceiptEmail({
          to: 'donor@example.com',
          donorName: 'John Donor',
          tierName: 'Gate Champion',
          packageLabel: 'Ladder',
          amount: 1000,
          currency: 'NGN',
        })
      ).resolves.toBeUndefined()

      expect(consoleSpy).toHaveBeenCalledWith('[EMAIL] Failed to send contribution receipt:', 'boom')
    })
  })

  describe('sendPledgeNotificationEmail', () => {
    beforeEach(() => {
      vi.stubEnv('DESTINY_NATION_NOTIFY_EMAIL', 'notify@example.com')
    })

    it('sends a pledge notification to the configured notify address', async () => {
      await sendPledgeNotificationEmail({
        donorName: 'Jane Pledge',
        donorEmail: 'jane@example.com',
        donorPhone: '555-1234',
        donorOrg: 'Acme Corp',
        packageLabel: 'Founders Circle',
        tierName: 'Gold',
        amount: 100_000_000,
        currency: 'NGN',
      })

      expect(sendMock).toHaveBeenCalledTimes(1)
      const arg = sendMock.mock.calls[0][0]
      expect(arg.to).toBe('notify@example.com')
      expect(arg.subject).toBe('New Pledge Lead: Founders Circle / Gold')
      expect(arg.html).toContain('Jane Pledge')
      expect(arg.html).toContain('jane@example.com')
      expect(arg.html).toContain('555-1234')
      expect(arg.html).toContain('Acme Corp')
    })

    it('omits optional phone/org when not provided', async () => {
      await sendPledgeNotificationEmail({
        donorName: 'Jane Pledge',
        donorEmail: 'jane@example.com',
        packageLabel: 'Founders Circle',
        tierName: 'Gold',
        amount: 100_000_000,
        currency: 'NGN',
      })

      const arg = sendMock.mock.calls[0][0]
      expect(arg.html).toContain('Jane Pledge')
      expect(arg.html).not.toContain('undefined')
    })

    it('returns early without sending when DESTINY_NATION_NOTIFY_EMAIL is unset', async () => {
      vi.stubEnv('DESTINY_NATION_NOTIFY_EMAIL', '')

      await sendPledgeNotificationEmail({
        donorName: 'Jane Pledge',
        donorEmail: 'jane@example.com',
        packageLabel: 'Founders Circle',
        tierName: 'Gold',
        amount: 100_000_000,
        currency: 'NGN',
      })

      expect(sendMock).not.toHaveBeenCalled()
    })

    it('returns early without sending when RESEND_API_KEY is unset', async () => {
      vi.stubEnv('RESEND_API_KEY', '')

      await sendPledgeNotificationEmail({
        donorName: 'Jane Pledge',
        donorEmail: 'jane@example.com',
        packageLabel: 'Founders Circle',
        tierName: 'Gold',
        amount: 100_000_000,
        currency: 'NGN',
      })

      expect(sendMock).not.toHaveBeenCalled()
    })

    it('logs and does not throw when resend.emails.send rejects', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      sendMock.mockRejectedValueOnce(new Error('smtp fail'))

      await expect(
        sendPledgeNotificationEmail({
          donorName: 'Jane Pledge',
          donorEmail: 'jane@example.com',
          packageLabel: 'Founders Circle',
          tierName: 'Gold',
          amount: 100_000_000,
          currency: 'NGN',
        })
      ).resolves.toBeUndefined()

      expect(consoleSpy).toHaveBeenCalledWith('[EMAIL] Failed to send pledge notification:', 'smtp fail')
    })
  })

  describe('sendManualGivingNotificationEmail', () => {
    beforeEach(() => {
      vi.stubEnv('DESTINY_NATION_NOTIFY_EMAIL', 'notify@example.com')
    })

    it('sends a manual giving notification to the configured notify address', async () => {
      await sendManualGivingNotificationEmail({
        donorName: 'Sam Transfer',
        donorEmail: 'sam@example.com',
        donorPhone: '555-9999',
        packageLabel: 'The Gatekeepers Ladder',
        tierName: 'Kingdom Builder',
        amount: 500_000,
        currency: 'NGN',
      })

      expect(sendMock).toHaveBeenCalledTimes(1)
      const arg = sendMock.mock.calls[0][0]
      expect(arg.to).toBe('notify@example.com')
      expect(arg.subject).toBe('Manual Gift Reported: The Gatekeepers Ladder / Kingdom Builder')
      expect(arg.html).toContain('Sam Transfer')
      expect(arg.html).toContain('555-9999')
      expect(arg.html).toContain('500,000')
    })

    it('returns early without sending when DESTINY_NATION_NOTIFY_EMAIL is unset', async () => {
      vi.stubEnv('DESTINY_NATION_NOTIFY_EMAIL', '')

      await sendManualGivingNotificationEmail({
        donorName: 'Sam Transfer',
        donorEmail: 'sam@example.com',
        packageLabel: 'The Gatekeepers Ladder',
        tierName: 'Kingdom Builder',
        amount: 500_000,
        currency: 'NGN',
      })

      expect(sendMock).not.toHaveBeenCalled()
    })

    it('returns early without sending when RESEND_API_KEY is unset', async () => {
      vi.stubEnv('RESEND_API_KEY', '')

      await sendManualGivingNotificationEmail({
        donorName: 'Sam Transfer',
        donorEmail: 'sam@example.com',
        packageLabel: 'The Gatekeepers Ladder',
        tierName: 'Kingdom Builder',
        amount: 500_000,
        currency: 'NGN',
      })

      expect(sendMock).not.toHaveBeenCalled()
    })

    it('logs and does not throw when resend.emails.send rejects', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      sendMock.mockRejectedValueOnce(new Error('rate limited'))

      await expect(
        sendManualGivingNotificationEmail({
          donorName: 'Sam Transfer',
          donorEmail: 'sam@example.com',
          packageLabel: 'The Gatekeepers Ladder',
          tierName: 'Kingdom Builder',
          amount: 500_000,
          currency: 'NGN',
        })
      ).resolves.toBeUndefined()

      expect(consoleSpy).toHaveBeenCalledWith('[EMAIL] Failed to send manual giving notification:', 'rate limited')
    })
  })
})
