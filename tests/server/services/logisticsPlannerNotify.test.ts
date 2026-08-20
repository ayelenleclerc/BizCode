import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { notifyLogisticsPlannersForRepartoConflict } from '../../../apps/server/services/logisticsPlannerNotify'

vi.mock('../../../apps/server/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../apps/server/notifications', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}))

import { writeAuditEvent } from '../../../apps/server/audit'
import { createNotification } from '../../../apps/server/notifications'

describe('notifyLogisticsPlannersForRepartoConflict (#164)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('notifies owner/manager/logistics_planner and writes audit', async () => {
    const prisma = {
      appUser: {
        findMany: vi.fn().mockResolvedValue([{ id: 11 }, { id: 12 }]),
      },
    } as unknown as PrismaClient

    await notifyLogisticsPlannersForRepartoConflict(prisma, 1, {
      repartoId: 9,
      itemId: 3,
      code: 'REPARTO_ITEM_INVALID_STATE',
      actorUserId: 5,
    })

    expect(prisma.appUser.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 1,
          active: true,
        }),
      }),
    )
    expect(createNotification).toHaveBeenCalledTimes(2)
    expect(writeAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'reparto_sync_conflict',
        resource: 'reparto',
        resourceId: '9',
      }),
    )
  })
})
