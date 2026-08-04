/**
 * @en Pushes BizCode article stock to Mercado Libre listings (#185) via EcommerceSyncEngine (#189).
 * @es Empuja stock de artículos BizCode a publicaciones Mercado Libre (#185) vía EcommerceSyncEngine (#189).
 * @pt-BR Empurra estoque de artigos BizCode para anúncios Mercado Livre (#185) via EcommerceSyncEngine (#189).
 */

import type { PrismaClient } from '@prisma/client'
import { MeliApiError } from '../integrations/meli/meliOAuthClient'
import { getMeliItem } from '../integrations/meli/meliItemsClient'
import { MeliConfigService } from './MeliConfigService'
import { EcommerceSyncEngine } from './EcommerceSyncEngine'
import { bootstrapEcommerceConnectors } from '../integrations/ecommerce/bootstrapEcommerceConnectors'
import type { ServiceResult } from './serviceResults'

export type MeliStockSyncResult = {
  synced: boolean
  availableQuantity?: number
  status?: string
  queued?: boolean
}

export type MeliStockReconcileSummary = {
  checked: number
  corrected: number
  errors: number
}

/**
 * @en Stock-only sync BizCode → Mercado Libre (pause at qty 0) (#185/#189).
 * @es Sync solo de stock BizCode → Mercado Libre (pausa en qty 0) (#185/#189).
 * @pt-BR Sync só de estoque BizCode → Mercado Livre (pausa em qty 0) (#185/#189).
 */
export class MeliStockSyncService {
  private readonly meliConfig: MeliConfigService
  private readonly syncEngine: EcommerceSyncEngine

  constructor(private readonly prisma: PrismaClient) {
    bootstrapEcommerceConnectors()
    this.meliConfig = new MeliConfigService(prisma)
    this.syncEngine = new EcommerceSyncEngine(prisma)
  }

  /**
   * @en Enqueues stock sync and processes the job immediately (#185/#189).
   * @es Encola sync de stock y procesa el job de inmediato (#185/#189).
   * @pt-BR Enfileira sync de estoque e processa o job imediatamente (#185/#189).
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
      const job = await this.syncEngine.enqueue({
        tenantId,
        connectorType: 'meli',
        operation: 'update_stock',
        articuloId,
        idempotencyKey: `meli:stock:${tenantId}:${articuloId}`,
        payload: {
          articuloId,
          publicacionId: pub.id,
          externalId: pub.meliItemId,
          quantity: qty,
          status,
        },
      })
      const result = await this.syncEngine.processJobById(job.id)
      if (result === 'succeeded') {
        return {
          ok: true,
          data: {
            synced: true,
            availableQuantity: qty,
            status,
          },
        }
      }
      if (result === 'deferred') {
        return {
          ok: true,
          data: { synced: false, queued: true, availableQuantity: qty, status },
        }
      }
      const fresh = await this.prisma.ecommerceSyncJob.findUnique({ where: { id: job.id } })
      return {
        ok: false,
        status: 502,
        error: fresh?.lastError ?? 'Mercado Libre stock sync failed',
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
          select: { stock: true, activo: true },
        })
        if (!articulo) {
          errors += 1
          continue
        }
        const localQty = Math.max(0, Math.floor(Number(articulo.stock)))
        const remote = await getMeliItem(tokens.data.accessToken, row.meliItemId)
        const remoteQty = Math.max(0, Math.floor(Number(remote.available_quantity ?? 0)))
        if (remoteQty === localQty) continue
        const push = await this.syncStockToMeli(row.tenantId, row.articuloId)
        if (push.ok && push.data.synced) corrected += 1
        else if (!push.ok) errors += 1
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
    const message = err instanceof Error ? err.message : 'Mercado Libre request failed'
    return { ok: false, status: 502, error: message }
  }
}
