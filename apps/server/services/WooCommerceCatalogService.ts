/**
 * @en WooCommerce catalog listing sync (BizCode → WC) via EcommerceSyncEngine (#188).
 * @es Sync de publicaciones de catálogo WooCommerce (BizCode → WC) vía EcommerceSyncEngine (#188).
 * @pt-BR Sync de anúncios de catálogo WooCommerce (BizCode → WC) via EcommerceSyncEngine (#188).
 */

import { Prisma, type Articulo, type ArticuloImagen, type PrismaClient, type WooCommercePublicacion } from '@prisma/client'
import { resolveApiPublicBaseUrl } from '../lib/publicUrls'
import { WooCommerceApiError, updateWooCommerceProduct } from '../integrations/woocommerce/woocommerceApiClient'
import { bootstrapEcommerceConnectors } from '../integrations/ecommerce/bootstrapEcommerceConnectors'
import { WooCommerceConfigService } from './WooCommerceConfigService'
import { EcommerceSyncEngine } from './EcommerceSyncEngine'
import type { ServiceResult } from './serviceResults'

export type WooCommercePublicacionStatus = {
  linked: boolean
  wcProductId?: string
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

function mapStatus(row: WooCommercePublicacion, hasPhotos: boolean): WooCommercePublicacionStatus {
  return {
    linked: true,
    wcProductId: row.wcProductId ?? undefined,
    estado: row.estado,
    syncStatus: row.syncStatus,
    syncError: row.syncError,
    permalink: row.permalink,
    ultimaSyncAt: row.ultimaSyncAt?.toISOString() ?? null,
    hasPhotos,
    photoWarning: !hasPhotos,
  }
}

export class WooCommerceCatalogService {
  private readonly wcConfig: WooCommerceConfigService
  private readonly syncEngine: EcommerceSyncEngine

  constructor(private readonly prisma: PrismaClient) {
    bootstrapEcommerceConnectors()
    this.wcConfig = new WooCommerceConfigService(prisma)
    this.syncEngine = new EcommerceSyncEngine(prisma)
  }

  async getStatus(
    tenantId: number,
    articuloId: number,
  ): Promise<ServiceResult<WooCommercePublicacionStatus>> {
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      include: { imagenes: { orderBy: { orden: 'asc' } }, wooCommercePublicacion: true },
    })
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }
    const hasPhotos = articulo.imagenes.length > 0
    if (!articulo.wooCommercePublicacion) {
      return { ok: true, data: { linked: false, hasPhotos, photoWarning: !hasPhotos } }
    }
    return { ok: true, data: mapStatus(articulo.wooCommercePublicacion, hasPhotos) }
  }

  async upsertAndSync(
    tenantId: number,
    articuloId: number,
  ): Promise<ServiceResult<WooCommercePublicacionStatus>> {
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
      return { ok: false, status: 400, error: 'Service items cannot be published to WooCommerce' }
    }

    const connected = await this.wcConfig.isConnectedAndActive(tenantId)
    if (!connected) {
      return { ok: false, status: 404, error: 'WooCommerce is not connected for this tenant' }
    }

    const row = await this.prisma.wooCommercePublicacion.upsert({
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
    const row = await this.prisma.wooCommercePublicacion.findFirst({
      where: { tenantId, articuloId },
    })
    if (!row) {
      return { ok: false, status: 404, error: 'WooCommerce listing is not linked' }
    }

    if (row.wcProductId) {
      const creds = await this.wcConfig.getDecryptedCredentials(tenantId)
      if (creds.ok) {
        try {
          await updateWooCommerceProduct(
            creds.data.storeUrl,
            creds.data.consumerKey,
            creds.data.consumerSecret,
            row.wcProductId,
            { status: 'draft' },
          )
        } catch {
          // Best-effort pause.
        }
      }
    }

    await this.prisma.wooCommercePublicacion.delete({ where: { id: row.id } })
    return { ok: true, data: { unlinked: true } }
  }

  async syncPublication(
    tenantId: number,
    publicacionId: number,
  ): Promise<ServiceResult<WooCommercePublicacionStatus>> {
    const row = await this.prisma.wooCommercePublicacion.findFirst({
      where: { id: publicacionId, tenantId },
    })
    if (!row) {
      return { ok: false, status: 404, error: 'WooCommerce listing is not linked' }
    }

    const articulo = await this.loadArticulo(tenantId, row.articuloId)
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }

    const creds = await this.wcConfig.getDecryptedCredentials(tenantId)
    if (!creds.ok) {
      await this.markError(row.id, creds.error)
      return creds
    }

    const pictures = articulo.imagenes.map((img) => absolutePictureUrl(img.pathOriginal))
    const price = decimalToNumber(articulo.precioLista1)
    const qty = Math.max(0, Math.floor(decimalToNumber(articulo.stock)))
    const currency = (articulo.monedaPrecio || 'ARS').toUpperCase()
    const isCreate = !row.wcProductId
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
      ...(row.wcProductId ? { externalId: row.wcProductId } : {}),
    }

    try {
      await this.prisma.wooCommercePublicacion.update({
        where: { id: row.id },
        data: { syncStatus: 'pending', syncError: null },
      })
      const job = await this.syncEngine.enqueue({
        tenantId,
        connectorType: 'woocommerce',
        operation,
        articuloId: articulo.id,
        idempotencyKey: `wc:catalog:${tenantId}:${articulo.id}`,
        payload: snapshot,
      })
      const result = await this.syncEngine.processJobById(job.id)
      const [updated, freshJob] = await Promise.all([
        this.prisma.wooCommercePublicacion.findFirst({ where: { id: row.id, tenantId } }),
        this.prisma.ecommerceSyncJob.findUnique({ where: { id: job.id } }),
      ])
      if (!updated) {
        return { ok: false, status: 404, error: 'WooCommerce listing is not linked' }
      }
      if (result === 'succeeded' && (updated.wcProductId || !isCreate)) {
        return { ok: true, data: mapStatus(updated, pictures.length > 0) }
      }
      const errMsg = updated.syncError ?? freshJob?.lastError ?? 'WooCommerce catalog sync failed'
      if (result === 'failed' || result === 'dead') {
        await this.markError(row.id, errMsg)
        if (/invalid|unauthorized|consumer/i.test(errMsg)) {
          return { ok: false, status: 401, error: 'WooCommerce credentials are invalid' }
        }
        return { ok: false, status: 502, error: errMsg }
      }
      return { ok: true, data: mapStatus(updated, pictures.length > 0) }
    } catch (err: unknown) {
      const mapped = this.mapError(err)
      await this.markError(row.id, mapped.ok ? 'Unknown WooCommerce error' : mapped.error)
      return mapped
    }
  }

  async syncAfterArticuloChange(tenantId: number, articuloId: number): Promise<void> {
    const row = await this.prisma.wooCommercePublicacion.findFirst({
      where: { tenantId, articuloId },
      select: { id: true },
    })
    if (!row) return
    await this.prisma.wooCommercePublicacion.update({
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
    await this.prisma.wooCommercePublicacion.update({
      where: { id: publicacionId },
      data: { syncStatus: 'error', syncError: message.slice(0, 2000) },
    })
  }

  private mapError(err: unknown): ServiceResult<never> {
    if (err instanceof WooCommerceApiError) {
      if (err.status === 401) {
        return { ok: false, status: 401, error: 'WooCommerce credentials are invalid' }
      }
      return {
        ok: false,
        status: err.status >= 400 && err.status < 600 ? err.status : 502,
        error: err.message,
      }
    }
    const message = err instanceof Error ? err.message : 'WooCommerce request failed'
    return { ok: false, status: 502, error: message }
  }
}
