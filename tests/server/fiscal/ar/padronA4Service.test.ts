/**
 * @en Unit tests for PadronA4Service (24h cache, mock lookups, graceful degradation) (#192).
 * @es Tests unitarios de PadronA4Service (caché 24h, consultas mock, degradación) (#192).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { PadronA4Service } from '../../../../apps/server/fiscal/ar/PadronA4Service'
import { encryptFiscalSecret } from '../../../../apps/server/fiscal/ar/fiscalSecrets'
import {
  PADRON_MOCK_KNOWN_CUIT,
  PADRON_MOCK_NOT_FOUND_CUIT,
  PADRON_MOCK_TIMEOUT_CUIT,
} from '../../../../apps/server/fiscal/ar/arcaPadronMock'

type CacheRow = {
  tenantId: number
  cuit: string
  payload: unknown
  fetchedAt: Date
  expiresAt: Date
}

function buildPrisma(options: { fiscalConfig?: Record<string, unknown> | null } = {}): {
  prisma: PrismaClient
  store: Map<string, CacheRow>
} {
  const store = new Map<string, CacheRow>()
  const fiscalConfig =
    options.fiscalConfig === undefined
      ? {
          id: 1,
          cuit: '20123456789',
          ambiente: 'homologacion',
          certEncrypted: encryptFiscalSecret('cert'),
          keyEncrypted: encryptFiscalSecret('key'),
        }
      : options.fiscalConfig

  const prisma = {
    padronA4Cache: {
      findUnique: vi.fn(async ({ where }: { where: { tenantId_cuit: { tenantId: number; cuit: string } } }) => {
        const key = `${where.tenantId_cuit.tenantId}:${where.tenantId_cuit.cuit}`
        return store.get(key) ?? null
      }),
      upsert: vi.fn(
        async ({
          where,
          create,
        }: {
          where: { tenantId_cuit: { tenantId: number; cuit: string } }
          create: CacheRow
        }) => {
          const key = `${where.tenantId_cuit.tenantId}:${where.tenantId_cuit.cuit}`
          store.set(key, { ...create })
          return create
        },
      ),
    },
    tenantFiscalConfig: {
      findUnique: vi.fn().mockResolvedValue(fiscalConfig),
    },
  } as unknown as PrismaClient

  return { prisma, store }
}

describe('PadronA4Service.consulta (#192)', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('returns invalid_cuit without touching cache or fiscal config', async () => {
    const { prisma } = buildPrisma()
    const service = new PadronA4Service(prisma)
    const result = await service.consulta(1, '123')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.reason).toBe('invalid_cuit')
      expect(result.data.verificado).toBe(false)
      expect(result.data.available).toBe(false)
    }
    expect(prisma.padronA4Cache.findUnique).not.toHaveBeenCalled()
    expect(prisma.tenantFiscalConfig.findUnique).not.toHaveBeenCalled()
  })

  it('returns unavailable when moduleEnabled is explicitly false', async () => {
    const { prisma } = buildPrisma()
    const service = new PadronA4Service(prisma)
    const result = await service.consulta(1, PADRON_MOCK_KNOWN_CUIT, { moduleEnabled: false })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.reason).toBe('unavailable')
      expect(result.data.verificado).toBe(false)
    }
    expect(prisma.tenantFiscalConfig.findUnique).not.toHaveBeenCalled()
  })

  it('returns unavailable when the tenant has no fiscal config', async () => {
    const { prisma } = buildPrisma({ fiscalConfig: null })
    const service = new PadronA4Service(prisma)
    const result = await service.consulta(1, PADRON_MOCK_KNOWN_CUIT)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.reason).toBe('unavailable')
      expect(result.data.verificado).toBe(false)
      expect(result.data.fromCache).toBe(false)
    }
  })

  it('returns unavailable when fiscal secrets cannot be decrypted', async () => {
    const { prisma } = buildPrisma({
      fiscalConfig: { id: 1, cuit: '20123456789', certEncrypted: 'not-valid', keyEncrypted: 'not-valid' },
    })
    const service = new PadronA4Service(prisma)
    const result = await service.consulta(1, PADRON_MOCK_KNOWN_CUIT)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.reason).toBe('unavailable')
    }
  })

  it('returns verificado true with truncated razonSocial for the known CUIT', async () => {
    const { prisma } = buildPrisma()
    const service = new PadronA4Service(prisma)
    const result = await service.consulta(1, PADRON_MOCK_KNOWN_CUIT)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.verificado).toBe(true)
    expect(result.data.available).toBe(true)
    expect(result.data.reason).toBe('ok')
    expect(result.data.fromCache).toBe(false)
    expect(result.data.condIva).toBe('RI')
    expect(result.data.razonSocial).toBe('DEMO SA PADRON A4 MOCK LARGO NOMBRE')
    expect(result.data.razonSocialTruncada).toHaveLength(30)
    expect(result.data.razonSocialTruncadaFlag).toBe(true)
    expect(result.data.domicilio).toBe('Av Corrientes 1234')
    expect(result.data.fetchedAt).not.toBeNull()
  })

  it('returns not_found (available, not verified) for the not-found fixture', async () => {
    const { prisma } = buildPrisma()
    const service = new PadronA4Service(prisma)
    const result = await service.consulta(1, PADRON_MOCK_NOT_FOUND_CUIT)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.verificado).toBe(false)
    expect(result.data.available).toBe(true)
    expect(result.data.reason).toBe('not_found')
    expect(result.data.razonSocial).toBeNull()
  })

  it('returns timeout (unavailable) for the timeout fixture without caching', async () => {
    const { prisma, store } = buildPrisma()
    const service = new PadronA4Service(prisma)
    const result = await service.consulta(1, PADRON_MOCK_TIMEOUT_CUIT)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.reason).toBe('timeout')
    expect(result.data.available).toBe(false)
    expect(result.data.verificado).toBe(false)
    expect(store.size).toBe(0)
    expect(prisma.padronA4Cache.upsert).not.toHaveBeenCalled()
  })

  it('caches the result and returns fromCache=true on the second call', async () => {
    const { prisma } = buildPrisma()
    const service = new PadronA4Service(prisma)

    const first = await service.consulta(1, PADRON_MOCK_KNOWN_CUIT)
    expect(first.ok).toBe(true)
    if (first.ok) {
      expect(first.data.fromCache).toBe(false)
    }
    expect(prisma.padronA4Cache.upsert).toHaveBeenCalledTimes(1)

    const second = await service.consulta(1, PADRON_MOCK_KNOWN_CUIT)
    expect(second.ok).toBe(true)
    if (second.ok) {
      expect(second.data.fromCache).toBe(true)
      expect(second.data.verificado).toBe(true)
      expect(second.data.razonSocial).toBe('DEMO SA PADRON A4 MOCK LARGO NOMBRE')
    }
    // Cache hit must not call the fiscal config lookup again.
    expect(prisma.tenantFiscalConfig.findUnique).toHaveBeenCalledTimes(1)
    expect(prisma.padronA4Cache.upsert).toHaveBeenCalledTimes(1)
  })

  it('isolates cache entries per tenant', async () => {
    const { prisma } = buildPrisma()
    const service = new PadronA4Service(prisma)

    await service.consulta(1, PADRON_MOCK_KNOWN_CUIT)
    const otherTenant = await service.consulta(2, PADRON_MOCK_KNOWN_CUIT)

    expect(otherTenant.ok).toBe(true)
    if (otherTenant.ok) {
      expect(otherTenant.data.fromCache).toBe(false)
    }
  })
})
