import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { ConflictAppError, NotFoundAppError } from '../errors/AppError'
import type {
  ProveedorArticuloInput,
  ProveedorArticuloUpdateInput,
} from '../schemas/domain'

export type ProveedorArticuloArticuloRef = {
  id: number
  codigo: number
  descripcion: string
}

export type ProveedorCatalogoImportError = {
  row: number
  message: string
}

export type ProveedorCatalogoImportResult = {
  created: number
  updated: number
  skipped: number
  errors: ProveedorCatalogoImportError[]
}

export type ProveedorArticuloRow = {
  id: number
  articuloId: number
  codigoProveedor: string
  descripcion: string | null
  precioLista: string | null
  precioListaFecha: string | null
  unidadCompra: string | null
  multiplo: string
  activo: boolean
  articulo: ProveedorArticuloArticuloRef
}

const articuloSelect = {
  id: true,
  codigo: true,
  descripcion: true,
} as const

function decimalToMoneyString(value: Decimal | null): string | null {
  if (value == null) return null
  return value.toFixed(2)
}

function mapRow(
  row: Prisma.ProveedorArticuloGetPayload<{ include: { articulo: { select: typeof articuloSelect } } }>,
): ProveedorArticuloRow {
  return {
    id: row.id,
    articuloId: row.articuloId,
    codigoProveedor: row.codigoProveedor,
    descripcion: row.descripcion,
    precioLista: decimalToMoneyString(row.precioLista),
    precioListaFecha: row.precioListaFecha?.toISOString() ?? null,
    unidadCompra: row.unidadCompra,
    multiplo: row.multiplo.toFixed(2),
    activo: row.activo,
    articulo: row.articulo,
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err != null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  )
}

/**
 * @en Supplier catalog entries: codes, descriptions and list prices per article (#273).
 * @es Catálogo por proveedor: códigos, descripciones y precios de lista (#273).
 * @pt-BR Catálogo por fornecedor: códigos, descrições e preços de lista (#273).
 */
export class ProveedorCatalogoService {
  constructor(private readonly prisma: PrismaClient) {}

  private async assertProveedor(tenantId: number, proveedorId: number): Promise<boolean> {
    const row = await this.prisma.proveedor.findFirst({
      where: { id: proveedorId, tenantId },
      select: { id: true },
    })
    return row != null
  }

  private async assertArticulo(tenantId: number, articuloId: number): Promise<boolean> {
    const row = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { id: true },
    })
    return row != null
  }

  async listCatalogo(tenantId: number, proveedorId: number): Promise<ProveedorArticuloRow[] | null> {
    if (!(await this.assertProveedor(tenantId, proveedorId))) {
      return null
    }
    const rows = await this.prisma.proveedorArticulo.findMany({
      where: { tenantId, proveedorId },
      include: { articulo: { select: articuloSelect } },
      orderBy: [{ activo: 'desc' }, { codigoProveedor: 'asc' }],
    })
    return rows.map(mapRow)
  }

  async findByCodigoProveedor(
    tenantId: number,
    proveedorId: number,
    codigoProveedor: string,
  ): Promise<ProveedorArticuloRow | null> {
    const row = await this.prisma.proveedorArticulo.findFirst({
      where: {
        tenantId,
        proveedorId,
        codigoProveedor: codigoProveedor.trim(),
      },
      include: { articulo: { select: articuloSelect } },
    })
    return row ? mapRow(row) : null
  }

  async findByArticuloId(
    tenantId: number,
    proveedorId: number,
    articuloId: number,
  ): Promise<ProveedorArticuloRow | null> {
    const row = await this.prisma.proveedorArticulo.findFirst({
      where: { tenantId, proveedorId, articuloId },
      include: { articulo: { select: articuloSelect } },
    })
    return row ? mapRow(row) : null
  }

  async createEntry(
    tenantId: number,
    proveedorId: number,
    input: ProveedorArticuloInput,
  ): Promise<ProveedorArticuloRow> {
    if (!(await this.assertProveedor(tenantId, proveedorId))) {
      throw new NotFoundAppError('Proveedor not found')
    }
    if (!(await this.assertArticulo(tenantId, input.articuloId))) {
      throw new NotFoundAppError('Articulo not found')
    }

    const now = new Date()
    const precioLista =
      input.precioLista != null ? new Decimal(input.precioLista) : null

    try {
      const created = await this.prisma.proveedorArticulo.create({
        data: {
          tenantId,
          proveedorId,
          articuloId: input.articuloId,
          codigoProveedor: input.codigoProveedor,
          descripcion: input.descripcion ?? null,
          precioLista,
          precioListaFecha: precioLista != null ? now : null,
          unidadCompra: input.unidadCompra ?? null,
          multiplo: new Decimal(input.multiplo ?? 1),
          activo: input.activo ?? true,
        },
        include: { articulo: { select: articuloSelect } },
      })
      return mapRow(created)
    } catch (err: unknown) {
      if (isUniqueViolation(err)) {
        throw new ConflictAppError(
          'Catalog entry already exists for this supplier article or supplier code',
        )
      }
      throw err
    }
  }

  async updateEntry(
    tenantId: number,
    proveedorId: number,
    articuloId: number,
    input: ProveedorArticuloUpdateInput,
  ): Promise<ProveedorArticuloRow> {
    if (!(await this.assertProveedor(tenantId, proveedorId))) {
      throw new NotFoundAppError('Proveedor not found')
    }

    const existing = await this.prisma.proveedorArticulo.findFirst({
      where: { tenantId, proveedorId, articuloId },
    })
    if (!existing) {
      throw new NotFoundAppError('Catalog entry not found')
    }

    const data: Prisma.ProveedorArticuloUpdateInput = {}
    if (input.codigoProveedor !== undefined) {
      data.codigoProveedor = input.codigoProveedor
    }
    if (input.descripcion !== undefined) {
      data.descripcion = input.descripcion
    }
    if (input.unidadCompra !== undefined) {
      data.unidadCompra = input.unidadCompra
    }
    if (input.multiplo !== undefined) {
      data.multiplo = new Decimal(input.multiplo)
    }
    if (input.activo !== undefined) {
      data.activo = input.activo
    }
    if (input.precioLista !== undefined) {
      if (input.precioLista === null) {
        data.precioLista = null
        data.precioListaFecha = null
      } else {
        data.precioLista = new Decimal(input.precioLista)
        data.precioListaFecha = new Date()
      }
    }

    try {
      const updated = await this.prisma.proveedorArticulo.update({
        where: { id: existing.id },
        data,
        include: { articulo: { select: articuloSelect } },
      })
      return mapRow(updated)
    } catch (err: unknown) {
      if (isUniqueViolation(err)) {
        throw new ConflictAppError('Supplier code already exists for this supplier')
      }
      throw err
    }
  }

  async importRows(
    tenantId: number,
    proveedorId: number,
    rows: Array<{
      row: number
      codigoProveedor: string
      codigoInterno: number
      precioLista?: number | null
      unidadCompra?: string | null
    }>,
  ): Promise<ProveedorCatalogoImportResult | null> {
    if (!(await this.assertProveedor(tenantId, proveedorId))) {
      return null
    }

    let created = 0
    let updated = 0
    let skipped = 0
    const errors: ProveedorCatalogoImportError[] = []

    for (const { row, codigoProveedor, codigoInterno, precioLista, unidadCompra } of rows) {
      const articulo = await this.prisma.articulo.findFirst({
        where: { tenantId, codigo: codigoInterno },
        select: { id: true },
      })
      if (!articulo) {
        errors.push({ row, message: `codigo_interno ${codigoInterno} not found` })
        skipped += 1
        continue
      }

      const payload: ProveedorArticuloInput = {
        articuloId: articulo.id,
        codigoProveedor,
        precioLista,
        unidadCompra,
      }

      const existing = await this.prisma.proveedorArticulo.findFirst({
        where: { tenantId, proveedorId, articuloId: articulo.id },
        select: { id: true },
      })

      try {
        if (existing) {
          await this.updateEntry(tenantId, proveedorId, articulo.id, {
            codigoProveedor: payload.codigoProveedor,
            descripcion: payload.descripcion,
            precioLista: payload.precioLista,
            unidadCompra: payload.unidadCompra,
            multiplo: payload.multiplo,
            activo: payload.activo,
          })
          updated += 1
        } else {
          await this.createEntry(tenantId, proveedorId, payload)
          created += 1
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        errors.push({ row, message })
        skipped += 1
      }
    }

    return { created, updated, skipped, errors }
  }
}
