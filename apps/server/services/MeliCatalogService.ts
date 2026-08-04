import { Prisma, type Articulo, type ArticuloImagen, type MeliPublicacion, type PrismaClient } from '@prisma/client'
import { resolveApiPublicBaseUrl } from '../lib/publicUrls'
import { MeliApiError } from '../integrations/meli/meliOAuthClient'
import {
  fetchMeliCategoryAttributes,
  searchMeliCategories,
  updateMeliItem,
  type MeliAttributeInput,
  type MeliCategorySearchHit,
} from '../integrations/meli/meliItemsClient'
import { MeliConfigService } from './MeliConfigService'
import { EcommerceSyncEngine } from './EcommerceSyncEngine'
import { bootstrapEcommerceConnectors } from '../integrations/ecommerce/bootstrapEcommerceConnectors'
import type { ServiceResult } from './serviceResults'

export type MeliPublicacionStatus = {
  linked: boolean
  meliItemId?: string
  meliCategoryId?: string
  estado?: string
  syncStatus?: string
  syncError?: string | null
  permalink?: string | null
  ultimaSyncAt?: string | null
  hasPhotos: boolean
  photoWarning: boolean
  atributos?: MeliAttributeInput[]
}

export type MeliUpsertPublicacionInput = {
  meliCategoryId: string
  atributos?: MeliAttributeInput[]
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

function parseAtributos(json: Prisma.JsonValue | null | undefined): MeliAttributeInput[] {
  if (!Array.isArray(json)) return []
  const out: MeliAttributeInput[] = []
  for (const row of json) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    const rec = row as Record<string, unknown>
    if (typeof rec.id !== 'string' || !rec.id.trim()) continue
    const attr: MeliAttributeInput = { id: rec.id.trim() }
    if (typeof rec.value_name === 'string') attr.value_name = rec.value_name
    if (typeof rec.value_id === 'string') attr.value_id = rec.value_id
    out.push(attr)
  }
  return out
}

function mapStatus(row: MeliPublicacion, hasPhotos: boolean): MeliPublicacionStatus {
  return {
    linked: true,
    meliItemId: row.meliItemId ?? undefined,
    meliCategoryId: row.meliCategoryId,
    estado: row.estado,
    syncStatus: row.syncStatus,
    syncError: row.syncError,
    permalink: row.permalink,
    ultimaSyncAt: row.ultimaSyncAt?.toISOString() ?? null,
    hasPhotos,
    photoWarning: !hasPhotos,
    atributos: parseAtributos(row.atributosJson),
  }
}

/**
 * @en Mercado Libre catalog listing sync (BizCode → ML) (#184).
 * @es Sync de publicaciones de catálogo Mercado Libre (BizCode → ML) (#184).
 * @pt-BR Sync de anúncios de catálogo Mercado Livre (BizCode → ML) (#184).
 */
export class MeliCatalogService {
  private readonly meliConfig: MeliConfigService
  private readonly syncEngine: EcommerceSyncEngine

  constructor(private readonly prisma: PrismaClient) {
    bootstrapEcommerceConnectors()
    this.meliConfig = new MeliConfigService(prisma)
    this.syncEngine = new EcommerceSyncEngine(prisma)
  }

  async getStatus(tenantId: number, articuloId: number): Promise<ServiceResult<MeliPublicacionStatus>> {
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      include: { imagenes: { orderBy: { orden: 'asc' } }, meliPublicacion: true },
    })
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }
    const hasPhotos = articulo.imagenes.length > 0
    if (!articulo.meliPublicacion) {
      return {
        ok: true,
        data: {
          linked: false,
          hasPhotos,
          photoWarning: !hasPhotos,
        },
      }
    }
    return { ok: true, data: mapStatus(articulo.meliPublicacion, hasPhotos) }
  }

  async searchCategories(tenantId: number, query: string): Promise<ServiceResult<MeliCategorySearchHit[]>> {
    const tokens = await this.requireAccessToken(tenantId)
    if (!tokens.ok) return tokens
    const config = await this.prisma.meliConfig.findUnique({
      where: { tenantId },
      select: { sitio: true },
    })
    try {
      const hits = await searchMeliCategories(tokens.data.accessToken, config?.sitio ?? 'MLA', query)
      return { ok: true, data: hits }
    } catch (err: unknown) {
      return this.mapMeliError(err)
    }
  }

  async upsertAndSync(
    tenantId: number,
    articuloId: number,
    input: MeliUpsertPublicacionInput,
  ): Promise<ServiceResult<MeliPublicacionStatus>> {
    const categoryId = input.meliCategoryId?.trim()
    if (!categoryId) {
      return { ok: false, status: 400, error: 'meliCategoryId is required' }
    }

    const articulo = await this.loadArticulo(tenantId, articuloId)
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }
    if (articulo.esPadre) {
      return { ok: false, status: 400, error: 'Parent articles cannot be published; publish a leaf variant instead' }
    }
    if (articulo.tipo === 'servicio') {
      return { ok: false, status: 400, error: 'Service items cannot be published to Mercado Libre' }
    }
    if (articulo.imagenes.length === 0) {
      return {
        ok: false,
        status: 400,
        error: 'Mercado Libre requires at least one product photo before publishing',
      }
    }

    const connected = await this.meliConfig.isConnectedAndActive(tenantId)
    if (!connected) {
      return { ok: false, status: 404, error: 'Mercado Libre is not connected for this tenant' }
    }

    const atributos = input.atributos ?? []
    const attrCheck = await this.validateRequiredAttributes(tenantId, categoryId, atributos)
    if (!attrCheck.ok) return attrCheck
    const atributosFinal = attrCheck.data

    const row = await this.prisma.meliPublicacion.upsert({
      where: { articuloId },
      create: {
        tenantId,
        articuloId,
        meliCategoryId: categoryId,
        ...(atributosFinal.length
          ? { atributosJson: atributosFinal as unknown as Prisma.InputJsonValue }
          : {}),
        estado: 'pending',
        syncStatus: 'pending',
        syncError: null,
      },
      update: {
        meliCategoryId: categoryId,
        atributosJson: atributosFinal.length
          ? (atributosFinal as unknown as Prisma.InputJsonValue)
          : Prisma.DbNull,
        syncStatus: 'pending',
        syncError: null,
      },
    })

    return this.syncPublication(tenantId, row.id)
  }

  async unlink(tenantId: number, articuloId: number): Promise<ServiceResult<{ unlinked: true }>> {
    const row = await this.prisma.meliPublicacion.findFirst({
      where: { tenantId, articuloId },
    })
    if (!row) {
      return { ok: false, status: 404, error: 'Mercado Libre listing is not linked' }
    }

    if (row.meliItemId) {
      const tokens = await this.requireAccessToken(tenantId)
      if (tokens.ok) {
        try {
          await updateMeliItem(tokens.data.accessToken, row.meliItemId, { status: 'paused' })
        } catch {
          // Best-effort pause; still remove local mapping.
        }
      }
    }

    await this.prisma.meliPublicacion.delete({ where: { id: row.id } })
    return { ok: true, data: { unlinked: true } }
  }

  /**
   * @en Syncs one publication by id; used by hooks and the retry job (#184).
   * @es Sincroniza una publicación por id; usado por hooks y el job de reintento (#184).
   * @pt-BR Sincroniza um anúncio por id; usado por hooks e o job de retry (#184).
   */
  async syncPublication(tenantId: number, publicacionId: number): Promise<ServiceResult<MeliPublicacionStatus>> {
    const row = await this.prisma.meliPublicacion.findFirst({
      where: { id: publicacionId, tenantId },
    })
    if (!row) {
      return { ok: false, status: 404, error: 'Mercado Libre listing is not linked' }
    }

    const articulo = await this.loadArticulo(tenantId, row.articuloId)
    if (!articulo) {
      return { ok: false, status: 404, error: 'Articulo not found' }
    }

    const tokens = await this.requireAccessToken(tenantId)
    if (!tokens.ok) {
      await this.markError(row.id, tokens.error)
      return tokens
    }

    const pictures = articulo.imagenes.map((img) => ({ source: absolutePictureUrl(img.pathOriginal) }))
    if (pictures.length === 0) {
      const msg = 'Mercado Libre requires at least one product photo before publishing'
      await this.markError(row.id, msg)
      return { ok: false, status: 400, error: msg }
    }

    const price = decimalToNumber(articulo.precioLista1)
    const qty = Math.max(0, Math.floor(decimalToNumber(articulo.stock)))
    const currency = (articulo.monedaPrecio || 'ARS').toUpperCase()
    const attributes = parseAtributos(row.atributosJson)
    const isCreate = !row.meliItemId
    const operation = isCreate ? 'publish_product' : 'update_product'
    const snapshot = {
      articuloId: articulo.id,
      publicacionId: row.id,
      title: articulo.descripcion.slice(0, 60),
      price,
      currencyId: currency,
      availableQuantity: qty,
      active: articulo.activo && qty > 0,
      categoryId: row.meliCategoryId,
      pictureUrls: pictures.map((p) => p.source),
      attributes: attributes.length ? attributes : undefined,
      ...(row.meliItemId ? { externalId: row.meliItemId } : {}),
    }

    try {
      await this.prisma.meliPublicacion.update({
        where: { id: row.id },
        data: { syncStatus: 'pending', syncError: null },
      })
      const job = await this.syncEngine.enqueue({
        tenantId,
        connectorType: 'meli',
        operation,
        articuloId: articulo.id,
        idempotencyKey: `meli:catalog:${tenantId}:${articulo.id}`,
        payload: snapshot,
      })
      const result = await this.syncEngine.processJobById(job.id)
      const [updated, freshJob] = await Promise.all([
        this.prisma.meliPublicacion.findFirst({ where: { id: row.id, tenantId } }),
        this.prisma.ecommerceSyncJob.findUnique({ where: { id: job.id } }),
      ])
      if (!updated) {
        return { ok: false, status: 404, error: 'Mercado Libre listing is not linked' }
      }
      if (result === 'succeeded' && (updated.meliItemId || !isCreate)) {
        return { ok: true, data: mapStatus(updated, true) }
      }
      const errMsg =
        updated.syncError ?? freshJob?.lastError ?? 'Mercado Libre catalog sync failed'
      if (result === 'failed' || result === 'dead') {
        await this.markError(row.id, errMsg)
        if (/quota|limit/i.test(errMsg)) {
          return {
            ok: false,
            status: 403,
            error: errMsg.includes('quota') || errMsg.toLowerCase().includes('limit')
              ? 'Mercado Libre listing quota exceeded (403)'
              : errMsg,
          }
        }
        if (/invalid or expired|unauthorized/i.test(errMsg)) {
          return { ok: false, status: 401, error: 'Mercado Libre access token is invalid or expired' }
        }
        return { ok: false, status: 502, error: errMsg }
      }
      return { ok: true, data: mapStatus(updated, true) }
    } catch (err: unknown) {
      const mapped = this.mapMeliError(err)
      await this.markError(row.id, mapped.ok ? 'Unknown Mercado Libre error' : mapped.error)
      return mapped
    }
  }

  /**
   * @en Marks publications pending after article updates and syncs immediately (#184).
   * @es Marca publicaciones pendientes tras cambios de artículo y sincroniza al momento (#184).
   * @pt-BR Marca anúncios pendentes após mudanças no artigo e sincroniza imediatamente (#184).
   */
  async syncAfterArticuloChange(tenantId: number, articuloId: number): Promise<void> {
    const row = await this.prisma.meliPublicacion.findFirst({
      where: { tenantId, articuloId },
      select: { id: true },
    })
    if (!row) return
    await this.prisma.meliPublicacion.update({
      where: { id: row.id },
      data: { syncStatus: 'pending', syncError: null },
    })
    await this.syncPublication(tenantId, row.id)
  }

  /**
   * @en Retries pending/error publications across tenants (#184).
   * @es Reintenta publicaciones pending/error entre tenants (#184).
   * @pt-BR Retenta anúncios pending/error entre tenants (#184).
   */
  async retryPendingSyncs(tenantIdFilter?: number): Promise<{ synced: number; errors: number }> {
    const rows = await this.prisma.meliPublicacion.findMany({
      where: {
        ...(tenantIdFilter != null ? { tenantId: tenantIdFilter } : {}),
        syncStatus: { in: ['pending', 'error'] },
      },
      select: { id: true, tenantId: true },
      take: 100,
      orderBy: { updatedAt: 'asc' },
    })
    let synced = 0
    let errors = 0
    for (const row of rows) {
      const result = await this.syncPublication(row.tenantId, row.id)
      if (result.ok) synced += 1
      else errors += 1
    }
    return { synced, errors }
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

  private async requireAccessToken(
    tenantId: number,
  ): Promise<ServiceResult<{ accessToken: string; refreshToken: string; meliUserId: string }>> {
    return this.meliConfig.getDecryptedTokens(tenantId)
  }

  private async validateRequiredAttributes(
    tenantId: number,
    categoryId: string,
    atributos: MeliAttributeInput[],
  ): Promise<ServiceResult<MeliAttributeInput[]>> {
    const tokens = await this.requireAccessToken(tenantId)
    if (!tokens.ok) return tokens
    try {
      const defs = await fetchMeliCategoryAttributes(tokens.data.accessToken, categoryId)
      const provided = new Map(atributos.map((a) => [a.id, a]))
      // ML often requires ITEM_CONDITION even when the item body also has condition.
      if (!provided.has('ITEM_CONDITION')) {
        provided.set('ITEM_CONDITION', { id: 'ITEM_CONDITION', value_id: '2230280', value_name: 'Nuevo' })
      }
      const required = defs.filter((d) => d.tags?.required || d.tags?.catalog_required)
      const missing = required
        .filter((d) => !provided.has(d.id))
        .map((d) => `${d.id} (${d.name})`)
      if (missing.length > 0) {
        return {
          ok: false,
          status: 400,
          error: `Missing required Mercado Libre attributes: ${missing.join(', ')}`,
        }
      }
      return { ok: true, data: [...provided.values()] }
    } catch (err: unknown) {
      return this.mapMeliError(err)
    }
  }

  private async markError(publicacionId: number, message: string): Promise<void> {
    await this.prisma.meliPublicacion.update({
      where: { id: publicacionId },
      data: { syncStatus: 'error', syncError: message.slice(0, 2000) },
    })
  }

  private mapMeliError(err: unknown): ServiceResult<never> {
    if (err instanceof MeliApiError) {
      if (err.status === 403) {
        return {
          ok: false,
          status: 403,
          error: err.message.includes('quota') || err.message.toLowerCase().includes('limit')
            ? 'Mercado Libre listing quota exceeded (403)'
            : err.message,
        }
      }
      if (err.status === 401) {
        return { ok: false, status: 401, error: 'Mercado Libre access token is invalid or expired' }
      }
      return { ok: false, status: err.status >= 400 && err.status < 600 ? err.status : 502, error: err.message }
    }
    const message = err instanceof Error ? err.message : 'Mercado Libre request failed'
    return { ok: false, status: 502, error: message }
  }
}
