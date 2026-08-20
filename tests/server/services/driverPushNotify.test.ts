import { describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { notifyDriverForRepartoEvent } from '../../../apps/server/services/driverPushNotify'

describe('driverPushNotify (#165)', () => {
  it('creates reparto_assigned notification for driver', async () => {
    const create = vi.fn().mockResolvedValue({})
    const prisma = {
      notification: { create },
      pushNotificationPreference: { findUnique: vi.fn().mockResolvedValue(null) },
      devicePushToken: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as PrismaClient

    await notifyDriverForRepartoEvent(prisma, 1, 9, 'reparto_assigned', {
      repartoId: 3,
      stopCount: 4,
    })

    expect(create).toHaveBeenCalledWith({
      data: {
        tenantId: 1,
        userId: 9,
        type: 'reparto_assigned',
        payload: { repartoId: 3, stopCount: 4 },
      },
    })
  })
})
