/**
 * @en Pushes BizCode article stock to Tiendanube listings via EcommerceSyncEngine (#187).
 * @es Empuja stock de artículos BizCode a publicaciones Tiendanube vía EcommerceSyncEngine (#187).
 * @pt-BR Empurra estoque de artigos BizCode para anúncios Tiendanube via EcommerceSyncEngine (#187).
 */

import type { PrismaClient } from '@prisma/client'
import { TiendanubeApiError } from '../integrations/tiendanube/tiendanubeOAuthClient'
import { bootstrapEcommerceConnectors } from '../integrations/ecommerce/bootstrapEcommerceConnectors'
import { TiendanubeConfigService } from './TiendanubeConfigService'
import { EcommerceSyncEngine } from './EcommerceSyncEngine'
import type { ServiceResult } from './serviceResults'

export type TiendanubeStockSyncResult = {
  synced: boolean
  availableQuantity?: number
  status?: string
  queued?: boolean
}

export class TiendanubeStockSyncService {
  private readonly tnConfig: TiendanubeConfigService
  private readonly syncEngine: EcommerceSyncEngine

  constructor(private readonly prisma: PrismaClient) {
    bootstrapEcommerceConnectors()
    this.tnConfig = new TiendanubeConfigService(prisma)
    this.syncEngine = new EcommerceSyncEngine(prisma)
  }

  async syncStockToTiendanube(
    tenantId: number,
    articuloId: number,
  ): Promise<ServiceResult<TiendanubeStockSyncResult>> {
    const pub = await this.prisma.tiendanubePublicacion.findFirst({
      where: { tenantId, articuloId, tnProductId: { not: null } },
      select: { id: true, tnProductId: true, estado: true },
    })
    if (!pub?.tnProductId) {
      return { ok: true, data: { synced: false } }
    }

    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { stock: true, activo: true },
    })
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }

    const tokens = await this.tnConfig.getDecryptedToken(tenantId)
    if (!tokens.ok) return tokens

    const qty = Math.max(0, Math.floor(Number(articulo.stock)))
    const status: 'active' | 'paused' = qty <= 0 || !articulo.activo ? 'paused' : 'active'

    try {
      const job = await this.syncEngine.enqueue({
        tenantId,
        connectorType: 'tiendanube',
        operation: 'update_stock',
        articuloId,
        idempotencyKey: `tn:stock:${tenantId}:${articuloId}`,
        payload: {
          articuloId,
          publicacionId: pub.id,
          externalId: pub.tnProductId,
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
        error: fresh?.lastError ?? 'Tiendanube stock sync failed',
      }
    } catch (err: unknown) {
      if (err instanceof TiendanubeApiError) {
        return {
          ok: false,
          status: err.status >= 400 && err.status < 600 ? err.status : 502,
          error: err.message,
        }
      }
      return {
        ok: false,
        status: 502,
        error: err instanceof Error ? err.message : 'Tiendanube stock sync failed',
      }
    }
  }
}
