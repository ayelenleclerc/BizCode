/**
 * @en Searchable SAT catalog service backed by `SatCatalogEntry` (#210).
 * @es Servicio de catálogo SAT buscable respaldado por `SatCatalogEntry` (#210).
 * @pt-BR Serviço de catálogo SAT pesquisável respaldado por `SatCatalogEntry` (#210).
 */

import type { PrismaClient, SatCatalogEntry } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import {
  SAT_CATALOG_FIXTURES,
  SAT_CATALOG_NAMES,
  SAT_CATALOG_SOURCE_LABEL,
  type SatCatalogName,
} from './satCatalogFixtures'

export type SatCatalogSearchHit = {
  catalog: string
  code: string
  description: string
  sourceLabel: string
}

export class SatCatalogService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @en Upserts the curated fixture set (idempotent). Does not wipe custom imports.
   * @es Upsert del conjunto curado (idempotente). No borra importaciones custom.
   * @pt-BR Upsert do conjunto curado (idempotente). Não apaga importações custom.
   */
  async seedCuratedFixtures(): Promise<ServiceResult<{ upserted: number }>> {
    let upserted = 0
    for (const row of SAT_CATALOG_FIXTURES) {
      await this.prisma.satCatalogEntry.upsert({
        where: { catalog_code: { catalog: row.catalog, code: row.code } },
        create: {
          catalog: row.catalog,
          code: row.code,
          description: row.description,
          sourceLabel: SAT_CATALOG_SOURCE_LABEL,
        },
        update: {
          description: row.description,
          sourceLabel: SAT_CATALOG_SOURCE_LABEL,
        },
      })
      upserted += 1
    }
    return { ok: true, data: { upserted } }
  }

  async search(input: {
    catalog?: string
    q?: string
    limit?: number
  }): Promise<ServiceResult<SatCatalogSearchHit[]>> {
    const catalog = input.catalog?.trim()
    if (catalog && !(SAT_CATALOG_NAMES as readonly string[]).includes(catalog)) {
      return { ok: false, status: 400, error: 'INVALID_SAT_CATALOG' }
    }
    const q = input.q?.trim() ?? ''
    const limit = Math.min(Math.max(input.limit ?? 25, 1), 100)

    const rows: SatCatalogEntry[] = await this.prisma.satCatalogEntry.findMany({
      where: {
        ...(catalog ? { catalog } : {}),
        ...(q
          ? {
              OR: [
                { code: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ catalog: 'asc' }, { code: 'asc' }],
      take: limit,
    })

    return {
      ok: true,
      data: rows.map((r) => ({
        catalog: r.catalog,
        code: r.code,
        description: r.description,
        sourceLabel: r.sourceLabel,
      })),
    }
  }

  async assertClaveProdServExists(code: string): Promise<ServiceResult<{ code: string }>> {
    const normalized = code.trim()
    if (!/^\d{8}$/.test(normalized)) {
      return { ok: false, status: 400, error: 'INVALID_CLAVE_PROD_SERV' }
    }
    const row = await this.prisma.satCatalogEntry.findUnique({
      where: { catalog_code: { catalog: 'ClaveProdServ' satisfies SatCatalogName, code: normalized } },
    })
    if (!row) return { ok: false, status: 404, error: 'CLAVE_PROD_SERV_NOT_FOUND' }
    return { ok: true, data: { code: row.code } }
  }
}
