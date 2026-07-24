import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  FormulaCostoResult,
  FormulaInsumoInput,
  FormulaInsumoUnidad,
  FormulaProduccionCreateInput,
  FormulaProduccionRow,
  FormulaProduccionUpdateInput,
  FormulaProyeccionResult,
} from '@bizcode/types'
import { parseListPagination } from './listPagination'
import type { ServiceResult } from './serviceResults'

const formulaInclude = {
  articulo: {
    select: {
      id: true,
      codigo: true,
      descripcion: true,
      costo: true,
      precioLista1: true,
    },
  },
  insumos: {
    include: {
      articulo: {
        select: {
          id: true,
          codigo: true,
          descripcion: true,
          costo: true,
          umedida: true,
          tipo: true,
        },
      },
    },
    orderBy: [{ orden: 'asc' as const }, { id: 'asc' as const }],
  },
} satisfies Prisma.FormulaProduccionInclude

type FormulaDb = Prisma.FormulaProduccionGetPayload<{ include: typeof formulaInclude }>

function toNumber(value: Decimal | number | string): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number.parseFloat(value)
  return Number(value.toString())
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function round4(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000
}

function mapFormula(row: FormulaDb): FormulaProduccionRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    articuloId: row.articuloId,
    rendimiento: toNumber(row.rendimiento),
    unidadRendimiento: row.unidadRendimiento,
    version: row.version,
    activa: row.activa,
    observaciones: row.observaciones,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    articulo: row.articulo
      ? {
          id: row.articulo.id,
          codigo: row.articulo.codigo,
          descripcion: row.articulo.descripcion,
          costo: toNumber(row.articulo.costo),
          precioLista1: toNumber(row.articulo.precioLista1),
        }
      : null,
    insumos: row.insumos.map((insumo) => ({
      id: insumo.id,
      formulaId: insumo.formulaId,
      articuloId: insumo.articuloId,
      cantidad: toNumber(insumo.cantidad),
      unidad: insumo.unidad as FormulaInsumoUnidad,
      esOpcional: insumo.esOpcional,
      orden: insumo.orden,
      articulo: insumo.articulo
        ? {
            id: insumo.articulo.id,
            codigo: insumo.articulo.codigo,
            descripcion: insumo.articulo.descripcion,
            costo: toNumber(insumo.articulo.costo),
            umedida: insumo.articulo.umedida,
            tipo: insumo.articulo.tipo,
          }
        : null,
    })),
  }
}

/**
 * @en Computes BOM unit cost and margin from formula lines and article costs.
 * @es Calcula costo unitario BOM y margen desde líneas e Articulo.costo.
 * @pt-BR Calcula custo unitário BOM e margem a partir das linhas e Articulo.costo.
 */
export function calcularCostoFormula(formula: FormulaProduccionRow): FormulaCostoResult {
  const lineas = formula.insumos.map((insumo) => {
    const costoUnitario = insumo.articulo?.costo ?? 0
    const costoLinea = round2(insumo.cantidad * costoUnitario)
    return {
      articuloId: insumo.articuloId,
      descripcion: insumo.articulo?.descripcion ?? '',
      cantidad: insumo.cantidad,
      unidad: insumo.unidad,
      costoUnitario,
      costoLinea,
      esOpcional: insumo.esOpcional,
    }
  })
  const costoInsumos = round2(lineas.reduce((sum, line) => sum + line.costoLinea, 0))
  const rendimiento = formula.rendimiento > 0 ? formula.rendimiento : 1
  const costoUnitario = round2(costoInsumos / rendimiento)
  const precioVenta = formula.articulo?.precioLista1 ?? 0
  const margenAbsoluto = round2(precioVenta - costoUnitario)
  const margenPorcentaje =
    precioVenta > 0 ? round2((margenAbsoluto / precioVenta) * 100) : 0
  return {
    formulaId: formula.id,
    articuloId: formula.articuloId,
    rendimiento,
    costoInsumos,
    costoUnitario,
    precioVenta,
    margenAbsoluto,
    margenPorcentaje,
    lineas,
  }
}

/**
 * @en Projects raw-material quantities needed to produce N finished units.
 * @es Proyecta cantidades de insumos para producir N unidades terminadas.
 * @pt-BR Projeta quantidades de insumos para produzir N unidades acabadas.
 */
export function proyectarInsumos(
  formula: FormulaProduccionRow,
  unidades: number,
): FormulaProyeccionResult {
  const rendimiento = formula.rendimiento > 0 ? formula.rendimiento : 1
  const corridas = unidades / rendimiento
  return {
    formulaId: formula.id,
    articuloId: formula.articuloId,
    unidadesObjetivo: unidades,
    corridas: round4(corridas),
    lineas: formula.insumos.map((insumo) => ({
      articuloId: insumo.articuloId,
      codigo: insumo.articulo?.codigo ?? 0,
      descripcion: insumo.articulo?.descripcion ?? '',
      cantidad: round4(insumo.cantidad * corridas),
      unidad: insumo.unidad,
      esOpcional: insumo.esOpcional,
    })),
  }
}

/**
 * @en Production BOM formula CRUD, versioning, costing and projection (#248).
 * @es CRUD de fórmulas BOM, versionado, costeo y proyección (#248).
 * @pt-BR CRUD de fórmulas BOM, versionamento, custeio e projeção (#248).
 */
export class FormulaProduccionService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    reqLike: { query: Record<string, unknown> },
  ): Promise<{ items: FormulaProduccionRow[]; total: number; limit: number; offset: number }> {
    const { take, skip } = parseListPagination(reqLike as Parameters<typeof parseListPagination>[0])
    const articuloIdRaw = reqLike.query.articuloId
    const articuloId =
      typeof articuloIdRaw === 'string' ? Number.parseInt(articuloIdRaw, 10) : undefined
    const onlyActive = reqLike.query.activa === 'true' || reqLike.query.activa === true
    const where: Prisma.FormulaProduccionWhereInput = {
      tenantId,
      ...(Number.isInteger(articuloId) && (articuloId ?? 0) > 0 ? { articuloId } : {}),
      ...(onlyActive ? { activa: true } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.formulaProduccion.count({ where }),
      this.prisma.formulaProduccion.findMany({
        where,
        include: formulaInclude,
        orderBy: [{ articuloId: 'asc' }, { version: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
    ])
    return { items: rows.map(mapFormula), total, limit: take, offset: skip }
  }

  async getById(
    tenantId: number,
    id: number,
  ): Promise<ServiceResult<FormulaProduccionRow>> {
    const row = await this.prisma.formulaProduccion.findFirst({
      where: { id, tenantId },
      include: formulaInclude,
    })
    if (!row) return { ok: false, status: 404, error: 'Formula not found' }
    return { ok: true, data: mapFormula(row) }
  }

  async create(
    tenantId: number,
    input: FormulaProduccionCreateInput,
  ): Promise<ServiceResult<FormulaProduccionRow>> {
    const validated = await this.validateFormulaPayload(tenantId, input.articuloId, input.insumos)
    if (!validated.ok) return validated

    const existingActive = await this.prisma.formulaProduccion.findFirst({
      where: { tenantId, articuloId: input.articuloId, activa: true },
      select: { id: true },
    })
    if (existingActive) {
      return {
        ok: false,
        status: 409,
        error: 'An active formula already exists for this article; update it to create a new version',
      }
    }

    const created = await this.prisma.formulaProduccion.create({
      data: {
        tenantId,
        articuloId: input.articuloId,
        rendimiento: new Decimal(input.rendimiento),
        unidadRendimiento: input.unidadRendimiento ?? 'unidad',
        version: 1,
        activa: true,
        observaciones: input.observaciones ?? null,
        insumos: {
          create: input.insumos.map((insumo, index) => ({
            articuloId: insumo.articuloId,
            cantidad: new Decimal(insumo.cantidad),
            unidad: insumo.unidad,
            esOpcional: insumo.esOpcional ?? false,
            orden: insumo.orden ?? index,
          })),
        },
      },
      include: formulaInclude,
    })
    return { ok: true, data: mapFormula(created) }
  }

  /**
   * @en Updates by versioning: deactivates current active formula and inserts next version.
   * @es Actualiza versionando: desactiva la fórmula activa e inserta la siguiente versión.
   * @pt-BR Atualiza versionando: desativa a fórmula ativa e insere a próxima versão.
   */
  async update(
    tenantId: number,
    id: number,
    input: FormulaProduccionUpdateInput,
  ): Promise<ServiceResult<FormulaProduccionRow>> {
    const current = await this.prisma.formulaProduccion.findFirst({
      where: { id, tenantId },
      include: formulaInclude,
    })
    if (!current) return { ok: false, status: 404, error: 'Formula not found' }
    if (!current.activa) {
      return { ok: false, status: 422, error: 'Only the active formula version can be updated' }
    }

    const validated = await this.validateFormulaPayload(
      tenantId,
      current.articuloId,
      input.insumos,
    )
    if (!validated.ok) return validated

    const nextVersion = current.version + 1
    const created = await this.prisma.$transaction(async (tx) => {
      await tx.formulaProduccion.update({
        where: { id: current.id },
        data: { activa: false },
      })
      return tx.formulaProduccion.create({
        data: {
          tenantId,
          articuloId: current.articuloId,
          rendimiento: new Decimal(input.rendimiento),
          unidadRendimiento: input.unidadRendimiento ?? current.unidadRendimiento,
          version: nextVersion,
          activa: true,
          observaciones:
            input.observaciones === undefined ? current.observaciones : input.observaciones,
          insumos: {
            create: input.insumos.map((insumo, index) => ({
              articuloId: insumo.articuloId,
              cantidad: new Decimal(insumo.cantidad),
              unidad: insumo.unidad,
              esOpcional: insumo.esOpcional ?? false,
              orden: insumo.orden ?? index,
            })),
          },
        },
        include: formulaInclude,
      })
    })
    return { ok: true, data: mapFormula(created) }
  }

  async deactivate(tenantId: number, id: number): Promise<ServiceResult<FormulaProduccionRow>> {
    const current = await this.prisma.formulaProduccion.findFirst({
      where: { id, tenantId },
      include: formulaInclude,
    })
    if (!current) return { ok: false, status: 404, error: 'Formula not found' }
    if (!current.activa) return { ok: true, data: mapFormula(current) }
    const updated = await this.prisma.formulaProduccion.update({
      where: { id },
      data: { activa: false },
      include: formulaInclude,
    })
    return { ok: true, data: mapFormula(updated) }
  }

  async getCosto(tenantId: number, id: number): Promise<ServiceResult<FormulaCostoResult>> {
    const formula = await this.getById(tenantId, id)
    if (!formula.ok) return formula
    return { ok: true, data: calcularCostoFormula(formula.data) }
  }

  async proyectar(
    tenantId: number,
    id: number,
    unidades: number,
  ): Promise<ServiceResult<FormulaProyeccionResult>> {
    if (!(unidades > 0)) return { ok: false, status: 400, error: 'unidades must be positive' }
    const formula = await this.getById(tenantId, id)
    if (!formula.ok) return formula
    return { ok: true, data: proyectarInsumos(formula.data, unidades) }
  }

  private async validateFormulaPayload(
    tenantId: number,
    articuloId: number,
    insumos: FormulaInsumoInput[],
  ): Promise<ServiceResult<null>> {
    if (insumos.length < 1) {
      return { ok: false, status: 400, error: 'At least one input line is required' }
    }
    const finished = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { id: true, esPadre: true },
    })
    if (!finished) {
      return { ok: false, status: 400, error: 'articuloId is not valid for this tenant' }
    }
    if (finished.esPadre) {
      return { ok: false, status: 400, error: 'Parent articles cannot have a BOM formula' }
    }

    const inputIds = insumos.map((row) => row.articuloId)
    if (inputIds.includes(articuloId)) {
      return { ok: false, status: 400, error: 'A formula cannot include itself as an input' }
    }
    if (new Set(inputIds).size !== inputIds.length) {
      return { ok: false, status: 400, error: 'Duplicate input articles are not allowed' }
    }

    const found = await this.prisma.articulo.findMany({
      where: { tenantId, id: { in: inputIds } },
      select: { id: true },
    })
    if (found.length !== inputIds.length) {
      return { ok: false, status: 400, error: 'One or more input articuloId values are invalid' }
    }
    for (const insumo of insumos) {
      if (!(insumo.cantidad > 0)) {
        return { ok: false, status: 400, error: 'Input cantidad must be positive' }
      }
    }
    return { ok: true, data: null }
  }
}
