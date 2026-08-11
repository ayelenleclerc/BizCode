import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../default-client', () => ({
  api: {
    post: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}))

import { api } from '../default-client'
import { createPushNotificationsAPI } from './pushNotifications'

describe('createPushNotificationsAPI (#172)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registerToken posts token', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: { token: 'ExponentPushToken[x]', platform: 'ios' } },
    })
    const client = createPushNotificationsAPI(api as never)
    const result = await client.registerToken({ token: 'ExponentPushToken[x]', platform: 'ios' })
    expect(result.token).toBe('ExponentPushToken[x]')
    expect(api.post).toHaveBeenCalledWith('/users/me/push-token', {
      token: 'ExponentPushToken[x]',
      platform: 'ios',
    })
  })

  it('updatePreferences puts mutedTypes', async () => {
    vi.mocked(api.put).mockResolvedValue({
      data: {
        success: true,
        data: { mutedTypes: ['chat_message'], muteableTypes: ['chat_message'] },
      },
    })
    const client = createPushNotificationsAPI(api as never)
    const result = await client.updatePreferences(['chat_message'])
    expect(result.mutedTypes).toEqual(['chat_message'])
  })
})
