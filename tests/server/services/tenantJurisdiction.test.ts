/**
 * @en `getTenantJurisdiction` tests (#207): cache hit, DB read and fallback to Argentina.
 * @es Tests de `getTenantJurisdiction` (#207): acierto de caché, lectura de BD y fallback a Argentina.
 * @pt-BR Testes de `getTenantJurisdiction` (#207): acerto de cache, leitura do BD e fallback para a Argentina.
 */

import type { PrismaClient } from '@prisma/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearTenantFeaturesCache,
  setCachedTenantFeatures,
} from '../../../apps/server/services/tenantConfigCache'
import { getTenantJurisdiction } from '../../../apps/server/services/tenantJurisdiction'

function buildPrisma(row: { jurisdiccionFiscal: string } | null) {
  const findUnique = vi.fn().mockResolvedValue(row)
  return {
    prisma: { tenantConfig: { findUnique } } as unknown as PrismaClient,
    findUnique,
  }
}

describe('getTenantJurisdiction (#207)', () => {
  afterEach(() => {
    clearTenantFeaturesCache()
  })

  it('serves the cached jurisdiction without hitting the database', async () => {
    setCachedTenantFeatures(7, ['core.auth'], [], 'UY')
    const { prisma, findUnique } = buildPrisma(null)

    await expect(getTenantJurisdiction(prisma, 7)).resolves.toBe('UY')
    expect(findUnique).not.toHaveBeenCalled()
  })

  it('reads the tenant configuration on a cache miss', async () => {
    const { prisma, findUnique } = buildPrisma({ jurisdiccionFiscal: 'UY' })

    await expect(getTenantJurisdiction(prisma, 7)).resolves.toBe('UY')
    expect(findUnique).toHaveBeenCalledWith({
      where: { tenantId: 7 },
      select: { jurisdiccionFiscal: true },
    })
  })

  it('falls back to Argentina when the tenant has no configuration row', async () => {
    const { prisma } = buildPrisma(null)
    await expect(getTenantJurisdiction(prisma, 7)).resolves.toBe('AR')
  })

  it('falls back to Argentina for an unknown persisted value', async () => {
    const { prisma } = buildPrisma({ jurisdiccionFiscal: 'ZZ' })
    await expect(getTenantJurisdiction(prisma, 7)).resolves.toBe('AR')
  })
})
