/**
 * @en SAT catalog search service tests (#210).
 * @es Tests del servicio de búsqueda de catálogo SAT (#210).
 * @pt-BR Testes do serviço de busca de catálogo SAT (#210).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { SatCatalogService } from '../../../../apps/server/fiscal/mx/SatCatalogService'
import { SAT_CATALOG_FIXTURES } from '../../../../apps/server/fiscal/mx/satCatalogFixtures'

describe('SatCatalogService (#210)', () => {
  const upsert = vi.fn()
  const findMany = vi.fn()
  const findUnique = vi.fn()
  let service: SatCatalogService

  beforeEach(() => {
    upsert.mockReset()
    findMany.mockReset()
    findUnique.mockReset()
    upsert.mockResolvedValue({})
    service = new SatCatalogService({
      satCatalogEntry: { upsert, findMany, findUnique },
    } as unknown as PrismaClient)
  })

  it('seeds every curated fixture row', async () => {
    const result = await service.seedCuratedFixtures()
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.upserted).toBe(SAT_CATALOG_FIXTURES.length)
    expect(upsert).toHaveBeenCalledTimes(SAT_CATALOG_FIXTURES.length)
  })

  it('rejects unknown catalog names', async () => {
    await expect(service.search({ catalog: 'Nope' })).resolves.toEqual({
      ok: false,
      status: 400,
      error: 'INVALID_SAT_CATALOG',
    })
  })

  it('searches by query', async () => {
    findMany.mockResolvedValue([
      {
        catalog: 'ClaveProdServ',
        code: '51101500',
        description: 'Medicamentos',
        sourceLabel: 'sat-cfdi-4.0-curated-2026-09',
      },
    ])
    const result = await service.search({ catalog: 'ClaveProdServ', q: 'Medic' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0]?.code).toBe('51101500')
    }
  })
})
