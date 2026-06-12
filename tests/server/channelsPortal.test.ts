import { describe, expect, it } from 'vitest'
import { sendPortalMagicLinkEmail } from '../../server/channels'

describe('sendPortalMagicLinkEmail (#240)', () => {
  it('no-ops when SMTP is not configured', async () => {
    await expect(
      sendPortalMagicLinkEmail('cliente@example.com', 'Demo', 'https://example.com/verify'),
    ).resolves.toBeUndefined()
  })
})
