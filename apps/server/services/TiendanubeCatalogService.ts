/**
 * @en Tiendanube catalog listing sync (BizCode → TN) via EcommerceSyncEngine (#187).
 * @es Sync de publicaciones de catálogo Tiendanube (BizCode → TN) vía EcommerceSyncEngine (#187).
 * @pt-BR Sync de anúncios de catálogo Tiendanube (BizCode → TN) via EcommerceSyncEngine (#187).
 */

import { Prisma, type Articulo, type ArticuloImagen, type PrismaClient, type TiendanubePublicacion } from '@prisma/client'
import { resolveApiPublicBaseUrl } from '../lib/publicUrls'
import { TiendanubeApiError } from '../integrations/tiendanube/tiendanubeOAuthClient'
import { updateTiendanubeProduct } from '../integrations/tiendanube/tiendanubeApiClient'
import { bootstrapEcommerceConnectors } from '../integrations/ecommerce/bootstrapEcommerceConnectors'
import { TiendanubeConfigService } from './TiendanubeConfigService'
import { EcommerceSyncEngine } from './EcommerceSyncEngine'
import type { ServiceResult } from './serviceResults'

export type TiendanubePublicacionStatus = {
  linked: boolean
  tnProductId?: string
  tnVariantId?: string
  estado?: string
  syncStatus?: string
  syncError?: string | null
  permalink?: string | null
  ultimaSyncAt?: string | null
  hasPhotos: boolean
  photoWarning: boolean
}

function absolutePictureUrl(relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, '').replace(/^uploads\/articulos\//, '')
  const base = resolveApiPublicBaseUrl()
  return `${base}/uploads/articulos/${normalized}`
}

function decimalToNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0
  if (typeof value === 'number') return value
  return Number(value.toString())
}

function mapStatus(row: TiendanubePublicacion, hasPhotos: boolean): TiendanubePublicacionStatus {
  return {
    linked: true,
    tnProductId: row.tnProductId ?? undefined,
    tnVariantId: row.tnVariantId ?? undefined,
    estado: row.estado,
    syncStatus: row.syncStatus,
    syncError: row.syncError,
    permalink: row.permalink,
    ultimaSyncAt: row.ultimaSyncAt?.toISOString() ?? null,
    hasPhotos,
    photoWarning: !hasPhotos,
  }
}

export class TiendanubeCatalogService {
  private readonly tnConfig: TiendanubeConfigService
  private readonly syncEngine: EcommerceSyncEngine

  constructor(private readonly prisma: PrismaClient) {
    bootstrapEcommerceConnectors()
    this.tnConfig = new TiendanubeConfigService(prisma)
    this.syncEngine = new EcommerceSyncEngine(prisma)
  }

  async getStatus(
    tenantId: number,
    articuloId: number,
  ): Promise<ServiceResult<TiendanubePublicacionStatus>> {
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      include: { imagenes: { orderBy: { orden: 'asc' } }, tiendanubePublicacion: true },
    })
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }
    const hasPhotos = articulo.imagenes.length > 0
    if (!articulo.tiendanubePublicacion) {
      return { ok: true, data: { linked: false, hasPhotos, photoWarning: !hasPhotos } }
    }
    return { ok: true, data: mapStatus(articulo.tiendanubePublicacion, hasPhotos) }
  }

  async upsertAndSync(
    tenantId: number,
    articuloId: number,
  ): Promise<ServiceResult<TiendanubePublicacionStatus>> {
    const articulo = await this.loadArticulo(tenantId, articuloId)
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }
    if (articulo.esPadre) {
      return {
        ok: false,
        status: 400,
        error: 'Parent articles cannot be published; publish a leaf variant instead',
      }
    }
    if (articulo.tipo === 'servicio') {
      return { ok: false, status: 400, error: 'Service items cannot be published to Tiendanube' }
    }

    const connected = await this.tnConfig.isConnectedAndActive(tenantId)
    if (!connected) {
      return { ok: false, status: 404, error: 'Tiendanube is not connected for this tenant' }
    }

    const row = await this.prisma.tiendanubePublicacion.upsert({
      where: { articuloId },
      create: {
        tenantId,
        articuloId,
        estado: 'pending',
        syncStatus: 'pending',
        syncError: null,
      },
      update: {
        syncStatus: 'pending',
        syncError: null,
      },
    })

    return this.syncPublication(tenantId, row.id)
  }

  async unlink(tenantId: number, articuloId: number): Promise<ServiceResult<{ unlinked: true }>> {
    const row = await this.prisma.tiendanubePublicacion.findFirst({
      where: { tenantId, articuloId },
    })
    if (!row) {
      return { ok: false, status: 404, error: 'Tiendanube listing is not linked' }
    }

    if (row.tnProductId) {
      const tokens = await this.tnConfig.getDecryptedToken(tenantId)
      if (tokens.ok) {
        try {
          await updateTiendanubeProduct(
            tokens.data.storeId,
            tokens.data.accessToken,
            row.tnProductId,
            { published: false },
          )
        } catch {
          // Best-effort pause.
        }
      }
    }

    await this.prisma.tiendanubePublicacion.delete({ where: { id: row.id } })
    return { ok: true, data: { unlinked: true } }
  }

  async syncPublication(
    tenantId: number,
    publicacionId: number,
  ): Promise<ServiceResult<TiendanubePublicacionStatus>> {
    const row = await this.prisma.tiendanubePublicacion.findFirst({
      where: { id: publicacionId, tenantId },
    })
    if (!row) {
      return { ok: false, status: 404, error: 'Tiendanube listing is not linked' }
    }

    const articulo = await this.loadArticulo(tenantId, row.articuloId)
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }

    const tokens = await this.tnConfig.getDecryptedToken(tenantId)
    if (!tokens.ok) {
      await this.markError(row.id, tokens.error)
      return tokens
    }

    const pictures = articulo.imagenes.map((img) => absolutePictureUrl(img.pathOriginal))
    const price = decimalToNumber(articulo.precioLista1)
    const qty = Math.max(0, Math.floor(decimalToNumber(articulo.stock)))
    const currency = (articulo.monedaPrecio || 'ARS').toUpperCase()
    const isCreate = !row.tnProductId
    const operation = isCreate ? 'publish_product' : 'update_product'
    const snapshot = {
      articuloId: articulo.id,
      publicacionId: row.id,
      title: articulo.descripcion.slice(0, 200),
      description: articulo.descripcion,
      sku: articulo.codigo != null ? String(articulo.codigo) : undefined,
      price,
      currencyId: currency,
      availableQuantity: qty,
      active: articulo.activo && qty > 0,
      pictureUrls: pictures.length ? pictures : undefined,
      ...(row.tnProductId ? { externalId: row.tnProductId } : {}),
    }

    try {
      await this.prisma.tiendanubePublicacion.update({
        where: { id: row.id },
        data: { syncStatus: 'pending', syncError: null },
      })
      const job = await this.syncEngine.enqueue({
        tenantId,
        connectorType: 'tiendanube',
        operation,
        articuloId: articulo.id,
        idempotencyKey: `tn:catalog:${tenantId}:${articulo.id}`,
        payload: snapshot,
      })
      const result = await this.syncEngine.processJobById(job.id)
      const [updated, freshJob] = await Promise.all([
        this.prisma.tiendanubePublicacion.findFirst({ where: { id: row.id, tenantId } }),
        this.prisma.ecommerceSyncJob.findUnique({ where: { id: job.id } }),
      ])
      if (!updated) {
        return { ok: false, status: 404, error: 'Tiendanube listing is not linked' }
      }
      if (result === 'succeeded' && (updated.tnProductId || !isCreate)) {
        return { ok: true, data: mapStatus(updated, pictures.length > 0) }
      }
      const errMsg = updated.syncError ?? freshJob?.lastError ?? 'Tiendanube catalog sync failed'
      if (result === 'failed' || result === 'dead') {
        await this.markError(row.id, errMsg)
        if (/invalid|unauthorized|token/i.test(errMsg)) {
          return { ok: false, status: 401, error: 'Tiendanube access token is invalid' }
        }
        return { ok: false, status: 502, error: errMsg }
      }
      return { ok: true, data: mapStatus(updated, pictures.length > 0) }
    } catch (err: unknown) {
      const mapped = this.mapError(err)
      await this.markError(row.id, mapped.ok ? 'Unknown Tiendanube error' : mapped.error)
      return mapped
    }
  }

  async syncAfterArticuloChange(tenantId: number, articuloId: number): Promise<void> {
    const row = await this.prisma.tiendanubePublicacion.findFirst({
      where: { tenantId, articuloId },
      select: { id: true },
    })
    if (!row) return
    await this.prisma.tiendanubePublicacion.update({
      where: { id: row.id },
      data: { syncStatus: 'pending', syncError: null },
    })
    await this.syncPublication(tenantId, row.id)
  }

  private async loadArticulo(
    tenantId: number,
    articuloId: number,
  ): Promise<(Articulo & { imagenes: ArticuloImagen[] }) | null> {
    return this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      include: { imagenes: { orderBy: [{ esPrincipal: 'desc' }, { orden: 'asc' }] } },
    })
  }

  private async markError(publicacionId: number, message: string): Promise<void> {
    await this.prisma.tiendanubePublicacion.update({
      where: { id: publicacionId },
      data: { syncStatus: 'error', syncError: message.slice(0, 2000) },
    })
  }

  private mapError(err: unknown): ServiceResult<never> {
    if (err instanceof TiendanubeApiError) {
      if (err.status === 401) {
        return { ok: false, status: 401, error: 'Tiendanube access token is invalid' }
      }
      return {
        ok: false,
        status: err.status >= 400 && err.status < 600 ? err.status : 502,
        error: err.message,
      }
    }
    const message = err instanceof Error ? err.message : 'Tiendanube request failed'
    return { ok: false, status: 502, error: message }
  }
}
