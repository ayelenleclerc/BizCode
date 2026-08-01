/**
 * @en Pushes BizCode article stock to Mercado Libre listings (#185).
 * @es Empuja stock de artículos BizCode a publicaciones Mercado Libre (#185).
 * @pt-BR Empurra estoque de artigos BizCode para anúncios Mercado Livre (#185).
 */

import type { PrismaClient } from '@prisma/client'
import { MeliApiError } from '../integrations/meli/meliOAuthClient'
import {
  getMeliItem,
  updateMeliItem,
} from '../integrations/meli/meliItemsClient'
import { MeliConfigService } from './MeliConfigService'
import type { ServiceResult } from './serviceResults'

export type MeliStockSyncResult = {
  synced: boolean
  availableQuantity?: number
  status?: string
}

export type MeliStockReconcileSummary = {
  checked: number
  corrected: number
  errors: number
}

/**
 * @en Stock-only sync BizCode → Mercado Libre (pause at qty 0) (#185).
 * @es Sync solo de stock BizCode → Mercado Libre (pausa en qty 0) (#185).
 * @pt-BR Sync só de estoque BizCode → Mercado Livre (pausa em qty 0) (#185).
 */
export class MeliStockSyncService {
  private readonly meliConfig: MeliConfigService

  constructor(private readonly prisma: PrismaClient) {
    this.meliConfig = new MeliConfigService(prisma)
  }

  /**
   * @en Patches `available_quantity` (and pause/active) when a MeLi listing exists (#185).
   * @es Parchea `available_quantity` (y pause/active) si existe publicación MeLi (#185).
   * @pt-BR Atualiza `available_quantity` (e pause/active) se existir anúncio MeLi (#185).
   */
  async syncStockToMeli(
    tenantId: number,
    articuloId: number,
  ): Promise<ServiceResult<MeliStockSyncResult>> {
    const pub = await this.prisma.meliPublicacion.findFirst({
      where: { tenantId, articuloId, meliItemId: { not: null } },
      select: { id: true, meliItemId: true, estado: true },
    })
    if (!pub?.meliItemId) {
      return { ok: true, data: { synced: false } }
    }

    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { stock: true, activo: true },
    })
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }

    const tokens = await this.meliConfig.getDecryptedTokens(tenantId)
    if (!tokens.ok) return tokens

    const qty = Math.max(0, Math.floor(Number(articulo.stock)))
    const status: 'active' | 'paused' =
      qty <= 0 || !articulo.activo ? 'paused' : 'active'

    try {
      const item = await updateMeliItem(tokens.data.accessToken, pub.meliItemId, {
        available_quantity: qty,
        status,
      })
      await this.prisma.meliPublicacion.update({
        where: { id: pub.id },
        data: {
          estado: item.status ?? status,
          ultimaSyncAt: new Date(),
          syncStatus: 'synced',
          syncError: null,
        },
      })
      return {
        ok: true,
        data: {
          synced: true,
          availableQuantity: qty,
          status: item.status ?? status,
        },
      }
    } catch (err: unknown) {
      return this.mapMeliError(err)
    }
  }

  /**
   * @en Hourly reconcile: BizCode stock is source of truth; push to ML when qty differs (#185).
   * @es Reconciliación horaria: stock BizCode es fuente de verdad; empuja a ML si difiere (#185).
   * @pt-BR Reconciliação horária: estoque BizCode é fonte da verdade; empurra ao ML se diferir (#185).
   */
  async reconcileAll(tenantIdFilter?: number): Promise<MeliStockReconcileSummary> {
    const rows = await this.prisma.meliPublicacion.findMany({
      where: {
        ...(tenantIdFilter != null ? { tenantId: tenantIdFilter } : {}),
        meliItemId: { not: null },
      },
      select: { tenantId: true, articuloId: true, meliItemId: true },
      take: 500,
      orderBy: { updatedAt: 'asc' },
    })

    let checked = 0
    let corrected = 0
    let errors = 0

    for (const row of rows) {
      if (!row.meliItemId) continue
      checked += 1
      try {
        const tokens = await this.meliConfig.getDecryptedTokens(row.tenantId)
        if (!tokens.ok) {
          errors += 1
          continue
        }
        const articulo = await this.prisma.articulo.findFirst({
          where: { id: row.articuloId, tenantId: row.tenantId },
          select: { stock: true },
        })
        if (!articulo) {
          errors += 1
          continue
        }
        const bizQty = Math.max(0, Math.floor(Number(articulo.stock)))
        const remote = await getMeliItem(tokens.data.accessToken, row.meliItemId)
        const remoteQty = Math.max(0, Math.floor(Number(remote.available_quantity ?? 0)))
        if (remoteQty === bizQty) continue

        const result = await this.syncStockToMeli(row.tenantId, row.articuloId)
        if (result.ok && result.data.synced) corrected += 1
        else errors += 1
      } catch {
        errors += 1
      }
    }

    return { checked, corrected, errors }
  }

  private mapMeliError(err: unknown): ServiceResult<never> {
    if (err instanceof MeliApiError) {
      if (err.status === 401) {
        return { ok: false, status: 401, error: 'Mercado Libre access token is invalid or expired' }
      }
      return {
        ok: false,
        status: err.status >= 400 && err.status < 600 ? err.status : 502,
        error: err.message,
      }
    }
    const message = err instanceof Error ? err.message : 'Mercado Libre stock sync failed'
    return { ok: false, status: 502, error: message }
  }
}
