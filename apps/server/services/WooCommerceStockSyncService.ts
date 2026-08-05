/**
 * @en Pushes BizCode article stock to WooCommerce listings via EcommerceSyncEngine (#188).
 * @es Empuja stock de artículos BizCode a publicaciones WooCommerce vía EcommerceSyncEngine (#188).
 * @pt-BR Empurra estoque de artigos BizCode para anúncios WooCommerce via EcommerceSyncEngine (#188).
 */

import type { PrismaClient } from '@prisma/client'
import { WooCommerceApiError } from '../integrations/woocommerce/woocommerceApiClient'
import { bootstrapEcommerceConnectors } from '../integrations/ecommerce/bootstrapEcommerceConnectors'
import { WooCommerceConfigService } from './WooCommerceConfigService'
import { EcommerceSyncEngine } from './EcommerceSyncEngine'
import type { ServiceResult } from './serviceResults'

export type WooCommerceStockSyncResult = {
  synced: boolean
  availableQuantity?: number
  status?: string
  queued?: boolean
}

export class WooCommerceStockSyncService {
  private readonly wcConfig: WooCommerceConfigService
  private readonly syncEngine: EcommerceSyncEngine

  constructor(private readonly prisma: PrismaClient) {
    bootstrapEcommerceConnectors()
    this.wcConfig = new WooCommerceConfigService(prisma)
    this.syncEngine = new EcommerceSyncEngine(prisma)
  }

  async syncStockToWooCommerce(
    tenantId: number,
    articuloId: number,
  ): Promise<ServiceResult<WooCommerceStockSyncResult>> {
    const pub = await this.prisma.wooCommercePublicacion.findFirst({
      where: { tenantId, articuloId, wcProductId: { not: null } },
      select: { id: true, wcProductId: true, estado: true },
    })
    if (!pub?.wcProductId) {
      return { ok: true, data: { synced: false } }
    }

    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { stock: true, activo: true },
    })
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }

    const creds = await this.wcConfig.getDecryptedCredentials(tenantId)
    if (!creds.ok) return creds

    const qty = Math.max(0, Math.floor(Number(articulo.stock)))
    const status: 'active' | 'paused' = qty <= 0 || !articulo.activo ? 'paused' : 'active'

    try {
      const job = await this.syncEngine.enqueue({
        tenantId,
        connectorType: 'woocommerce',
        operation: 'update_stock',
        articuloId,
        idempotencyKey: `wc:stock:${tenantId}:${articuloId}`,
        payload: {
          articuloId,
          publicacionId: pub.id,
          externalId: pub.wcProductId,
          quantity: qty,
          status,
        },
      })
      const result = await this.syncEngine.processJobById(job.id)
      if (result === 'succeeded') {
        return { ok: true, data: { synced: true, availableQuantity: qty, status } }
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
        error: fresh?.lastError ?? 'WooCommerce stock sync failed',
      }
    } catch (err: unknown) {
      if (err instanceof WooCommerceApiError) {
        return {
          ok: false,
          status: err.status >= 400 && err.status < 600 ? err.status : 502,
          error: err.message,
        }
      }
      return {
        ok: false,
        status: 502,
        error: err instanceof Error ? err.message : 'WooCommerce stock sync failed',
      }
    }
  }
}
