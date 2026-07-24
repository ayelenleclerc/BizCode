import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  ComisionTipo,
  ConfigComisionCreateInput,
  ConfigComisionPatchInput,
  ConfigComisionRow,
} from '@bizcode/types'
import { COMISION_TIPOS } from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

function dec(value: Decimal | number | string): number {
  return Number(value)
}

function mapConfig(row: {
  id: number
  tenantId: number
  vendedorId: number
  tipo: string
  alicuota: Decimal
  vigenciaDesde: Date
  vigenciaHasta: Date | null
  articuloCategoriaId: number | null
  clienteId: number | null
  createdAt: Date
  updatedAt: Date
  vendedor?: { username: string } | null
}): ConfigComisionRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    vendedorId: row.vendedorId,
    tipo: row.tipo as ComisionTipo,
    alicuota: dec(row.alicuota),
    vigenciaDesde: row.vigenciaDesde.toISOString(),
    vigenciaHasta: row.vigenciaHasta?.toISOString() ?? null,
    articuloCategoriaId: row.articuloCategoriaId,
    clienteId: row.clienteId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    vendedorUsername: row.vendedor?.username,
  }
}

function isComisionTipo(value: string): value is ComisionTipo {
  return (COMISION_TIPOS as readonly string[]).includes(value)
}

/**
 * @en CRUD for seller commission rate configurations (#237).
 * @es CRUD de configuraciones de alícuota de comisión de vendedores (#237).
 * @pt-BR CRUD de configurações de alíquota de comissão de vendedores (#237).
 */
export class ComisionConfigService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    take: number,
    skip: number,
    filters?: { vendedorId?: number | null },
  ): Promise<{ total: number; rows: ConfigComisionRow[] }> {
    const where = {
      tenantId,
      ...(filters?.vendedorId != null ? { vendedorId: filters.vendedorId } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.configComision.count({ where }),
      this.prisma.configComision.findMany({
        where,
        include: { vendedor: { select: { username: true } } },
        orderBy: [{ vendedorId: 'asc' }, { vigenciaDesde: 'desc' }],
        take,
        skip,
      }),
    ])
    return { total, rows: rows.map(mapConfig) }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<ConfigComisionRow>> {
    const row = await this.prisma.configComision.findFirst({
      where: { id, tenantId },
      include: { vendedor: { select: { username: true } } },
    })
    if (!row) return { ok: false, status: 404, error: 'ConfigComision not found' }
    return { ok: true, data: mapConfig(row) }
  }

  async create(
    tenantId: number,
    input: ConfigComisionCreateInput,
  ): Promise<ServiceResult<ConfigComisionRow>> {
    if (!isComisionTipo(input.tipo)) {
      return { ok: false, status: 400, error: 'INVALID_COMISION_TIPO' }
    }
    if (!(input.alicuota >= 0)) {
      return { ok: false, status: 400, error: 'INVALID_ALICUOTA' }
    }
    const vendedor = await this.prisma.appUser.findFirst({
      where: { id: input.vendedorId, tenantId, active: true },
      select: { id: true },
    })
    if (!vendedor) return { ok: false, status: 404, error: 'Vendedor not found' }

    const row = await this.prisma.configComision.create({
      data: {
        tenantId,
        vendedorId: input.vendedorId,
        tipo: input.tipo,
        alicuota: input.alicuota,
        vigenciaDesde: new Date(input.vigenciaDesde),
        vigenciaHasta: input.vigenciaHasta ? new Date(input.vigenciaHasta) : null,
        articuloCategoriaId: input.articuloCategoriaId ?? null,
        clienteId: input.clienteId ?? null,
      },
      include: { vendedor: { select: { username: true } } },
    })
    return { ok: true, data: mapConfig(row) }
  }

  async update(
    tenantId: number,
    id: number,
    input: ConfigComisionPatchInput,
  ): Promise<ServiceResult<ConfigComisionRow>> {
    const existing = await this.prisma.configComision.findFirst({ where: { id, tenantId } })
    if (!existing) return { ok: false, status: 404, error: 'ConfigComision not found' }
    if (input.tipo != null && !isComisionTipo(input.tipo)) {
      return { ok: false, status: 400, error: 'INVALID_COMISION_TIPO' }
    }
    if (input.alicuota != null && !(input.alicuota >= 0)) {
      return { ok: false, status: 400, error: 'INVALID_ALICUOTA' }
    }
    if (input.vendedorId != null) {
      const vendedor = await this.prisma.appUser.findFirst({
        where: { id: input.vendedorId, tenantId, active: true },
        select: { id: true },
      })
      if (!vendedor) return { ok: false, status: 404, error: 'Vendedor not found' }
    }

    const row = await this.prisma.configComision.update({
      where: { id },
      data: {
        ...(input.vendedorId !== undefined ? { vendedorId: input.vendedorId } : {}),
        ...(input.tipo !== undefined ? { tipo: input.tipo } : {}),
        ...(input.alicuota !== undefined ? { alicuota: input.alicuota } : {}),
        ...(input.vigenciaDesde !== undefined
          ? { vigenciaDesde: new Date(input.vigenciaDesde) }
          : {}),
        ...(input.vigenciaHasta !== undefined
          ? { vigenciaHasta: input.vigenciaHasta ? new Date(input.vigenciaHasta) : null }
          : {}),
        ...(input.articuloCategoriaId !== undefined
          ? { articuloCategoriaId: input.articuloCategoriaId }
          : {}),
        ...(input.clienteId !== undefined ? { clienteId: input.clienteId } : {}),
      },
      include: { vendedor: { select: { username: true } } },
    })
    return { ok: true, data: mapConfig(row) }
  }

  async remove(tenantId: number, id: number): Promise<ServiceResult<{ success: true }>> {
    const existing = await this.prisma.configComision.findFirst({ where: { id, tenantId } })
    if (!existing) return { ok: false, status: 404, error: 'ConfigComision not found' }
    await this.prisma.configComision.delete({ where: { id } })
    return { ok: true, data: { success: true } }
  }

  async getModoDevengo(tenantId: number): Promise<ComisionTipo> {
    const cfg = await this.prisma.tenantConfig.findUnique({
      where: { tenantId },
      select: { comisionesModoDevengo: true },
    })
    const raw = cfg?.comisionesModoDevengo ?? 'porcentaje_cobrado'
    return isComisionTipo(raw) ? raw : 'porcentaje_cobrado'
  }

  async setModoDevengo(
    tenantId: number,
    modo: ComisionTipo,
  ): Promise<ServiceResult<{ modoDevengo: ComisionTipo }>> {
    if (!isComisionTipo(modo)) {
      return { ok: false, status: 400, error: 'INVALID_COMISION_TIPO' }
    }
    const existing = await this.prisma.tenantConfig.findUnique({ where: { tenantId } })
    if (!existing) {
      return { ok: false, status: 404, error: 'TenantConfig not found' }
    }
    await this.prisma.tenantConfig.update({
      where: { tenantId },
      data: { comisionesModoDevengo: modo },
    })
    return { ok: true, data: { modoDevengo: modo } }
  }
}
