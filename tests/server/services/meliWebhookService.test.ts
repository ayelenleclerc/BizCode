/**
 * @en Mercado Libre webhook service tests — orders_v2 → import (#186).
 * @es Tests del servicio webhook ML — orders_v2 → import (#186).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MeliWebhookService } from '../../../apps/server/services/MeliWebhookService'

const processOrderNotification = vi.fn().mockResolvedValue(undefined)

vi.mock('../../../apps/server/services/MeliOrderImportService', () => ({
  extractMeliResourceId: (resource: string) => {
    const parts = resource.trim().replace(/^\//, '').split('/').filter(Boolean)
    return parts[parts.length - 1] ?? null
  },
  MeliOrderImportService: class {
    processOrderNotification = processOrderNotification
  },
}))

const fixtureDir = dirname(fileURLToPath(import.meta.url))
const webhookFixture = JSON.parse(
  readFileSync(join(fixtureDir, '../../fixtures/meli-webhook-orders-v2.json'), 'utf8'),
) as { resource: string; topic: string; user_id: number }

function buildPrisma(): PrismaClient {
  const eventStore = new Set<string>()
  return {
    meliWebhookEvent: {
      create: vi.fn().mockImplementation(async ({ data }: { data: { topic: string; resource: string } }) => {
        const key = `${data.topic}|${data.resource}`
        if (eventStore.has(key)) {
          const err = new Error('Unique constraint') as Error & { code: string }
          err.code = 'P2002'
          throw err
        }
        eventStore.add(key)
        return { id: eventStore.size }
      }),
    },
    meliConfig: {
      findFirst: vi.fn().mockResolvedValue({ tenantId: 1 }),
    },
  } as unknown as PrismaClient
}

describe('MeliWebhookService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    processOrderNotification.mockResolvedValue(undefined)
  })

  it('orders_v2 delegates to import and re-enters on duplicate webhook event', async () => {
    const prisma = buildPrisma()
    const service = new MeliWebhookService(prisma)

    await service.processNotification(webhookFixture)
    await service.processNotification(webhookFixture)

    expect(processOrderNotification).toHaveBeenCalledTimes(2)
    expect(processOrderNotification).toHaveBeenCalledWith(1, webhookFixture.resource)
  })
})
