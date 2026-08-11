import { describe, expect, it, vi } from 'vitest'
import {
  buildPushContent,
  deliverMobilePush,
} from '../../apps/server/services/mobilePushDelivery'
import { sendExpoPushMessages, EXPO_PUSH_URL } from '../../apps/server/services/ExpoPushService'
import type { PrismaClient } from '@prisma/client'

describe('ExpoPushService (#172)', () => {
  it('returns empty when no messages', async () => {
    const fetchImpl = vi.fn()
    const result = await sendExpoPushMessages([], fetchImpl as unknown as typeof fetch)
    expect(result.tickets).toEqual([])
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('posts to Expo and collects DeviceNotRegistered tokens', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ status: 'error', details: { error: 'DeviceNotRegistered' } }],
      }),
    })
    const result = await sendExpoPushMessages(
      [{ to: 'ExponentPushToken[bad]', title: 't', body: 'b' }],
      fetchImpl as unknown as typeof fetch,
    )
    expect(fetchImpl).toHaveBeenCalledWith(
      EXPO_PUSH_URL,
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result.invalidTokens).toEqual(['ExponentPushToken[bad]'])
  })
})

describe('mobilePushDelivery (#172)', () => {
  it('buildPushContent for pedido_confirmed', () => {
    const content = buildPushContent('pedido_confirmed', {
      pedidoId: 9,
      rsocial: 'Acme',
      clienteId: 2,
    })
    expect(content.body).toContain('Pedido #9')
    expect(content.data.pedidoId).toBe(9)
  })

  it('skips muted types', async () => {
    const deleteMany = vi.fn()
    const prisma = {
      pushNotificationPreference: {
        findUnique: vi.fn().mockResolvedValue({ mutedTypes: ['chat_message'] }),
      },
      devicePushToken: {
        findMany: vi.fn(),
        deleteMany,
      },
    } as unknown as PrismaClient

    await deliverMobilePush(prisma, 1, 5, 'chat_message', { preview: 'hola' })
    expect(prisma.devicePushToken.findMany).not.toHaveBeenCalled()
  })

  it('sends when unmuted and cleans invalid tokens', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ status: 'error', details: { error: 'DeviceNotRegistered' } }],
      }),
    } as Response)

    const deleteMany = vi.fn().mockResolvedValue({ count: 1 })
    const prisma = {
      pushNotificationPreference: {
        findUnique: vi.fn().mockResolvedValue({ mutedTypes: [] }),
      },
      devicePushToken: {
        findMany: vi.fn().mockResolvedValue([{ token: 'ExponentPushToken[x]' }]),
        deleteMany,
      },
    } as unknown as PrismaClient

    await deliverMobilePush(prisma, 1, 5, 'pedido_confirmed', {
      pedidoId: 1,
      rsocial: 'Acme',
    })
    expect(fetchSpy).toHaveBeenCalled()
    expect(deleteMany).toHaveBeenCalledWith({
      where: { token: { in: ['ExponentPushToken[x]'] } },
    })
    fetchSpy.mockRestore()
  })
})
