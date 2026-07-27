import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  FormulaInsumoUnidad,
  OrdenProduccionCompletarInput,
  OrdenProduccionCreateInput,
  OrdenProduccionDisponibilidad,
  OrdenProduccionDisponibilidadLinea,
  OrdenProduccionEstado,
  OrdenProduccionInsumoRow,
  OrdenProduccionRow,
  OrdenProduccionSugerirCompraInput,
  OrdenProduccionSugerirCompraResult,
} from '@bizcode/types'
import { assertNoOpenRecuento } from '../lib/recuentoStockGuard'
import { assertNoControlLoteArticles } from '../lib/controlLoteGuard'
import { CompraService } from './CompraService'
import { proyectarInsumos } from './FormulaProduccionService'
import { parseListPagination } from './listPagination'
import type { ServiceResult } from './serviceResults'
import { applyStockDepositoDelta, getDefaultDepositoId } from './stockDepositoSync'

export const PRODUCTION_CONSUMO_MOTIVO = 'produccion_consumo'
export const PRODUCTION_MERMA_MOTIVO = 'merma_produccion'
export const PRODUCTION_ALTA_MOTIVO = 'produccion_alta'

const SERVICE_TIPO = 'servicio'

const ordenInclude = {
  articulo: {
    select: {
      id: true,
      codigo: true,
      descripcion: true,
      costo: true,
      precioLista1: true,
    },
  },
  deposito: { select: { id: true, codigo: true, nombre: true } },
  formula: { select: { id: true, version: true, rendimiento: true } },
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
    orderBy: [{ linea: 'asc' as const }, { id: 'asc' as const }],
  },
} satisfies Prisma.OrdenProduccionInclude

type OrdenDb = Prisma.OrdenProduccionGetPayload<{ include: typeof ordenInclude }>

function toNumber(value: Decimal | number | string | null): number | null {
  if (value === null) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number.parseFloat(value)
  return Number(value.toString())
}

function toRequiredNumber(value: Decimal | number | string): number {
  return toNumber(value) ?? 0
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function round4(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000
}

/**
 * @en Stock rows are integers, so consumption rounds up to never consume less than the BOM needs.
 * @es El stock es entero, por eso el consumo redondea hacia arriba para no consumir menos que el BOM.
 * @pt-BR O estoque é inteiro, então o consumo arredonda para cima para não consumir menos que o BOM.
 */
export function stockUnitsForConsumption(value: number): number {
  return Math.ceil(round4(value))
}

/**
 * @en Finished-goods credit rounds down so stock never exceeds the produced quantity.
 * @es El alta de producto terminado redondea hacia abajo para no acreditar más de lo producido.
 * @pt-BR A entrada de produto acabado arredonda para baixo para não creditar mais do que produzido.
 */
export function stockUnitsForProduction(value: number): number {
  return Math.floor(round4(value))
}

function mapInsumo(row: OrdenDb['insumos'][number]): OrdenProduccionInsumoRow {
  return {
    id: row.id,
    ordenId: row.ordenId,
    articuloId: row.articuloId,
    cantidadPlan: toRequiredNumber(row.cantidadPlan),
    cantidadReal: toNumber(row.cantidadReal),
    unidad: row.unidad as FormulaInsumoUnidad,
    costo: toNumber(row.costo),
    esOpcional: row.esOpcional,
    linea: row.linea,
    articulo: row.articulo
      ? {
          id: row.articulo.id,
          codigo: row.articulo.codigo,
          descripcion: row.articulo.descripcion,
          costo: toRequiredNumber(row.articulo.costo),
          umedida: row.articulo.umedida,
          tipo: row.articulo.tipo,
        }
      : null,
  }
}

function mapOrden(row: OrdenDb): OrdenProduccionRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    numero: row.numero,
    articuloId: row.articuloId,
    formulaId: row.formulaId,
    depositoId: row.depositoId,
    cantidadPlanif: toRequiredNumber(row.cantidadPlanif),
    cantidadReal: toNumber(row.cantidadReal),
    estado: row.estado as OrdenProduccionEstado,
    fechaPlanif: row.fechaPlanif.toISOString(),
    fechaInicio: row.fechaInicio ? row.fechaInicio.toISOString() : null,
    fechaFin: row.fechaFin ? row.fechaFin.toISOString() : null,
    costoTotal: toNumber(row.costoTotal),
    operadorId: row.operadorId,
    observaciones: row.observaciones,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    articulo: row.articulo
      ? {
          id: row.articulo.id,
          codigo: row.articulo.codigo,
          descripcion: row.articulo.descripcion,
          costo: toRequiredNumber(row.articulo.costo),
          precioLista1: toRequiredNumber(row.articulo.precioLista1),
        }
      : null,
    deposito: row.deposito
      ? { id: row.deposito.id, codigo: row.deposito.codigo, nombre: row.deposito.nombre }
      : null,
    formula: row.formula
      ? {
          id: row.formula.id,
          version: row.formula.version,
          rendimiento: toRequiredNumber(row.formula.rendimiento),
        }
      : null,
    insumos: row.insumos.map(mapInsumo),
  }
}

export type DisponibilidadStockEntry = {
  articuloId: number
  fisico: number
  reservado: number
}

/**
 * @en Compares BOM needs against deposit stock minus active reservations of other orders.
 * @es Compara necesidades BOM contra stock del depósito menos reservas activas de otras órdenes.
 * @pt-BR Compara necessidades BOM com estoque do depósito menos reservas ativas de outras ordens.
 */
export function calcularDisponibilidad(
  orden: OrdenProduccionRow,
  stock: DisponibilidadStockEntry[],
): OrdenProduccionDisponibilidad {
  const stockByArticulo = new Map(stock.map((entry) => [entry.articuloId, entry]))
  const lineas: OrdenProduccionDisponibilidadLinea[] = orden.insumos.map((insumo) => {
    const mueveStock = insumo.articulo?.tipo !== SERVICE_TIPO
    const entry = stockByArticulo.get(insumo.articuloId)
    const disponible = mueveStock ? (entry?.fisico ?? 0) - (entry?.reservado ?? 0) : 0
    const necesario = insumo.cantidadPlan
    const faltante = mueveStock ? Math.max(0, round4(necesario - disponible)) : 0
    return {
      articuloId: insumo.articuloId,
      codigo: insumo.articulo?.codigo ?? 0,
      descripcion: insumo.articulo?.descripcion ?? '',
      unidad: insumo.unidad,
      necesario,
      disponible: round4(disponible),
      faltante,
      esOpcional: insumo.esOpcional,
      mueveStock,
    }
  })
  const suficiente = lineas.every(
    (linea) => linea.esOpcional || !linea.mueveStock || linea.faltante === 0,
  )
  return { ordenId: orden.id, depositoId: orden.depositoId, suficiente, lineas }
}

export type ConsumoLinea = {
  insumoId: number
  articuloId: number
  cantidadPlan: number
  cantidadReal: number
  costoUnitario: number
  mueveStock: boolean
}

/**
 * @en Resolves real consumption per input line: explicit input, else plan for mandatory lines.
 * @es Resuelve el consumo real por línea: valor explícito, o el plan en líneas obligatorias.
 * @pt-BR Resolve o consumo real por linha: valor explícito, ou o plano nas linhas obrigatórias.
 */
export function resolverConsumos(
  orden: OrdenProduccionRow,
  input: OrdenProduccionCompletarInput,
): ConsumoLinea[] {
  const overrides = new Map((input.insumos ?? []).map((row) => [row.articuloId, row.cantidadReal]))
  return orden.insumos.map((insumo) => {
    const override = overrides.get(insumo.articuloId)
    const cantidadReal =
      override !== undefined ? round4(override) : insumo.esOpcional ? 0 : insumo.cantidadPlan
    return {
      insumoId: insumo.id,
      articuloId: insumo.articuloId,
      cantidadPlan: insumo.cantidadPlan,
      cantidadReal,
      costoUnitario: insumo.articulo?.costo ?? 0,
      mueveStock: insumo.articulo?.tipo !== SERVICE_TIPO,
    }
  })
}

/**
 * @en Real production cost: sum of real consumption times the current input cost.
 * @es Costo real de producción: suma del consumo real por el costo vigente del insumo.
 * @pt-BR Custo real de produção: soma do consumo real pelo custo vigente do insumo.
 */
export function calcularCostoProduccion(consumos: ConsumoLinea[]): number {
  return round2(
    consumos.reduce((sum, linea) => sum + round2(linea.cantidadReal * linea.costoUnitario), 0),
  )
}

/**
 * @en Production orders: planning from BOM, soft reservations, real consumption and finished goods (#249).
 * @es Órdenes de producción: planificación desde BOM, reservas blandas, consumo real y producto terminado (#249).
 * @pt-BR Ordens de produção: planejamento a partir do BOM, reservas flexíveis, consumo real e produto acabado (#249).
 */
export class OrdenProduccionService {
  private readonly compras: CompraService

  constructor(
    private readonly prisma: PrismaClient,
    compras?: CompraService,
  ) {
    this.compras = compras ?? new CompraService(prisma)
  }

  async list(
    tenantId: number,
    reqLike: { query: Record<string, unknown> },
  ): Promise<{ items: OrdenProduccionRow[]; total: number; limit: number; offset: number }> {
    const { take, skip } = parseListPagination(reqLike as Parameters<typeof parseListPagination>[0])
    const estadoRaw = reqLike.query.estado
    const articuloIdRaw = reqLike.query.articuloId
    const desdeRaw = reqLike.query.desde
    const hastaRaw = reqLike.query.hasta
    const articuloId =
      typeof articuloIdRaw === 'string' ? Number.parseInt(articuloIdRaw, 10) : undefined
    const fechaPlanif: Prisma.DateTimeFilter = {}
    if (typeof desdeRaw === 'string' && desdeRaw.length > 0) {
      fechaPlanif.gte = new Date(desdeRaw)
    }
    if (typeof hastaRaw === 'string' && hastaRaw.length > 0) {
      fechaPlanif.lte = new Date(hastaRaw)
    }
    const where: Prisma.OrdenProduccionWhereInput = {
      tenantId,
      ...(typeof estadoRaw === 'string' && estadoRaw.length > 0 ? { estado: estadoRaw } : {}),
      ...(Number.isInteger(articuloId) && (articuloId ?? 0) > 0 ? { articuloId } : {}),
      ...(Object.keys(fechaPlanif).length > 0 ? { fechaPlanif } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.ordenProduccion.count({ where }),
      this.prisma.ordenProduccion.findMany({
        where,
        include: ordenInclude,
        orderBy: [{ fechaPlanif: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
    ])
    return { items: rows.map(mapOrden), total, limit: take, offset: skip }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<OrdenProduccionRow>> {
    const row = await this.prisma.ordenProduccion.findFirst({
      where: { id, tenantId },
      include: ordenInclude,
    })
    if (!row) return { ok: false, status: 404, error: 'OrdenProduccion not found' }
    return { ok: true, data: mapOrden(row) }
  }

  async create(
    tenantId: number,
    input: OrdenProduccionCreateInput,
  ): Promise<ServiceResult<OrdenProduccionRow>> {
    if (!(input.cantidadPlanif > 0)) {
      return { ok: false, status: 400, error: 'cantidadPlanif must be positive' }
    }
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: input.articuloId, tenantId },
      select: { id: true, tipo: true },
    })
    if (!articulo) {
      return { ok: false, status: 400, error: 'articuloId is not valid for this tenant' }
    }
    if (articulo.tipo === SERVICE_TIPO) {
      return { ok: false, status: 422, error: 'SERVICE_NO_STOCK' }
    }

    const formula = await this.prisma.formulaProduccion.findFirst({
      where: { tenantId, articuloId: input.articuloId, activa: true },
      include: {
        articulo: {
          select: { id: true, codigo: true, descripcion: true, costo: true, precioLista1: true },
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
          orderBy: [{ orden: 'asc' }, { id: 'asc' }],
        },
      },
    })
    if (!formula) {
      return { ok: false, status: 422, error: 'ACTIVE_FORMULA_REQUIRED' }
    }

    const depositoId =
      input.depositoId != null
        ? input.depositoId
        : await getDefaultDepositoId(this.prisma, tenantId)
    if (depositoId == null) {
      return { ok: false, status: 400, error: 'depositoId is required' }
    }
    const deposito = await this.prisma.deposito.findFirst({
      where: { id: depositoId, tenantId, activo: true },
      select: { id: true },
    })
    if (!deposito) {
      return { ok: false, status: 400, error: 'depositoId is not valid for this tenant' }
    }

    if (input.operadorId != null) {
      const operador = await this.prisma.appUser.findFirst({
        where: { id: input.operadorId, tenantId },
        select: { id: true },
      })
      if (!operador) {
        return { ok: false, status: 400, error: 'operadorId is not valid for this tenant' }
      }
    }

    const proyeccion = proyectarInsumos(
      {
        id: formula.id,
        tenantId: formula.tenantId,
        articuloId: formula.articuloId,
        rendimiento: toRequiredNumber(formula.rendimiento),
        unidadRendimiento: formula.unidadRendimiento,
        version: formula.version,
        activa: formula.activa,
        observaciones: formula.observaciones,
        createdAt: formula.createdAt.toISOString(),
        updatedAt: formula.updatedAt.toISOString(),
        articulo: {
          id: formula.articulo.id,
          codigo: formula.articulo.codigo,
          descripcion: formula.articulo.descripcion,
          costo: toRequiredNumber(formula.articulo.costo),
          precioLista1: toRequiredNumber(formula.articulo.precioLista1),
        },
        insumos: formula.insumos.map((insumo) => ({
          id: insumo.id,
          formulaId: insumo.formulaId,
          articuloId: insumo.articuloId,
          cantidad: toRequiredNumber(insumo.cantidad),
          unidad: insumo.unidad as FormulaInsumoUnidad,
          esOpcional: insumo.esOpcional,
          orden: insumo.orden,
          articulo: insumo.articulo
            ? {
                id: insumo.articulo.id,
                codigo: insumo.articulo.codigo,
                descripcion: insumo.articulo.descripcion,
                costo: toRequiredNumber(insumo.articulo.costo),
                umedida: insumo.articulo.umedida,
                tipo: insumo.articulo.tipo,
              }
            : null,
        })),
      },
      input.cantidadPlanif,
    )

    const lastNumero = await this.prisma.ordenProduccion.aggregate({
      where: { tenantId },
      _max: { numero: true },
    })
    const numero = (lastNumero._max.numero ?? 0) + 1

    const created = await this.prisma.ordenProduccion.create({
      data: {
        tenantId,
        numero,
        articuloId: input.articuloId,
        formulaId: formula.id,
        depositoId,
        cantidadPlanif: new Decimal(input.cantidadPlanif),
        estado: 'planificada',
        ...(input.fechaPlanif ? { fechaPlanif: new Date(input.fechaPlanif) } : {}),
        ...(input.operadorId != null ? { operadorId: input.operadorId } : {}),
        observaciones: input.observaciones ?? null,
        insumos: {
          create: proyeccion.lineas.map((linea, index) => ({
            articuloId: linea.articuloId,
            cantidadPlan: new Decimal(linea.cantidad),
            unidad: linea.unidad,
            esOpcional: linea.esOpcional,
            linea: index,
          })),
        },
      },
      include: ordenInclude,
    })
    return { ok: true, data: mapOrden(created) }
  }

  async getDisponibilidad(
    tenantId: number,
    id: number,
  ): Promise<ServiceResult<OrdenProduccionDisponibilidad>> {
    const orden = await this.getById(tenantId, id)
    if (!orden.ok) return orden
    const stock = await this.loadStockEntries(tenantId, orden.data)
    return { ok: true, data: calcularDisponibilidad(orden.data, stock) }
  }

  /**
   * @en Moves the order to en_proceso and creates soft reservations for mandatory stock inputs.
   * @es Pasa la orden a en_proceso y crea reservas blandas de los insumos obligatorios con stock.
   * @pt-BR Move a ordem para en_proceso e cria reservas flexíveis dos insumos obrigatórios com estoque.
   */
  async iniciar(tenantId: number, id: number): Promise<ServiceResult<OrdenProduccionRow>> {
    const orden = await this.getById(tenantId, id)
    if (!orden.ok) return orden
    if (orden.data.estado !== 'planificada') {
      return { ok: false, status: 422, error: 'ORDER_NOT_PLANNED' }
    }
    const stock = await this.loadStockEntries(tenantId, orden.data)
    const disponibilidad = calcularDisponibilidad(orden.data, stock)
    if (!disponibilidad.suficiente) {
      return { ok: false, status: 422, error: 'INSUFFICIENT_STOCK' }
    }

    const lotArticleIds = [
      orden.data.articuloId,
      ...orden.data.insumos.map((insumo) => insumo.articuloId),
    ]
    const lotBlock = await assertNoControlLoteArticles(this.prisma, tenantId, lotArticleIds)
    if (!lotBlock.ok) {
      return lotBlock
    }

    const reservables = orden.data.insumos.filter(
      (insumo) => !insumo.esOpcional && insumo.articulo?.tipo !== SERVICE_TIPO,
    )
    const updated = await this.prisma.$transaction(async (tx) => {
      for (const insumo of reservables) {
        await tx.stockReservaProduccion.create({
          data: {
            tenantId,
            ordenId: orden.data.id,
            articuloId: insumo.articuloId,
            depositoId: orden.data.depositoId,
            cantidad: new Decimal(insumo.cantidadPlan),
            activa: true,
          },
        })
      }
      return tx.ordenProduccion.update({
        where: { id: orden.data.id },
        data: { estado: 'en_proceso', fechaInicio: new Date() },
        include: ordenInclude,
      })
    })
    return { ok: true, data: mapOrden(updated) }
  }

  /**
   * @en Completes the order: releases reservations, consumes inputs, credits finished goods and costs it.
   * @es Completa la orden: libera reservas, consume insumos, acredita producto terminado y calcula costo.
   * @pt-BR Conclui a ordem: libera reservas, consome insumos, credita produto acabado e calcula custo.
   */
  async completar(
    tenantId: number,
    id: number,
    userId: number,
    input: OrdenProduccionCompletarInput,
  ): Promise<ServiceResult<OrdenProduccionRow>> {
    const orden = await this.getById(tenantId, id)
    if (!orden.ok) return orden
    if (orden.data.estado !== 'en_proceso') {
      return { ok: false, status: 422, error: 'ORDER_NOT_IN_PROGRESS' }
    }
    if (!(input.cantidadReal > 0)) {
      return { ok: false, status: 400, error: 'cantidadReal must be positive' }
    }
    const knownIds = new Set(orden.data.insumos.map((insumo) => insumo.articuloId))
    for (const linea of input.insumos ?? []) {
      if (!knownIds.has(linea.articuloId)) {
        return { ok: false, status: 400, error: 'INVALID_INSUMO' }
      }
    }

    const recuentoBlock = await assertNoOpenRecuento(this.prisma, tenantId, orden.data.depositoId)
    if (!recuentoBlock.ok) {
      return recuentoBlock
    }

    const lotArticleIds = [
      orden.data.articuloId,
      ...orden.data.insumos.map((insumo) => insumo.articuloId),
    ]
    const lotBlock = await assertNoControlLoteArticles(this.prisma, tenantId, lotArticleIds)
    if (!lotBlock.ok) {
      return lotBlock
    }

    const consumos = resolverConsumos(orden.data, input)
    const costoTotal = calcularCostoProduccion(consumos)
    const producidas = stockUnitsForProduction(input.cantidadReal)

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.stockReservaProduccion.updateMany({
          where: { tenantId, ordenId: orden.data.id, activa: true },
          data: { activa: false, releasedAt: new Date() },
        })

        for (const consumo of consumos) {
          await tx.ordenProduccionInsumo.update({
            where: { id: consumo.insumoId },
            data: {
              cantidadReal: new Decimal(consumo.cantidadReal),
              costo: new Decimal(consumo.costoUnitario),
            },
          })
          if (!consumo.mueveStock || consumo.cantidadReal <= 0) continue

          const totalUnidades = stockUnitsForConsumption(consumo.cantidadReal)
          await applyStockDepositoDelta(tx, {
            tenantId,
            articuloId: consumo.articuloId,
            depositoId: orden.data.depositoId,
            delta: -totalUnidades,
          })
          const planUnidades = Math.min(
            totalUnidades,
            stockUnitsForConsumption(consumo.cantidadPlan),
          )
          const mermaUnidades = totalUnidades - planUnidades
          if (planUnidades > 0) {
            await tx.stockAjuste.create({
              data: {
                tenantId,
                articuloId: consumo.articuloId,
                cantidad: -planUnidades,
                motivo: PRODUCTION_CONSUMO_MOTIVO,
                userId,
                depositoId: orden.data.depositoId,
              },
            })
          }
          if (mermaUnidades > 0) {
            await tx.stockAjuste.create({
              data: {
                tenantId,
                articuloId: consumo.articuloId,
                cantidad: -mermaUnidades,
                motivo: PRODUCTION_MERMA_MOTIVO,
                userId,
                depositoId: orden.data.depositoId,
              },
            })
          }
        }

        if (producidas > 0) {
          await applyStockDepositoDelta(tx, {
            tenantId,
            articuloId: orden.data.articuloId,
            depositoId: orden.data.depositoId,
            delta: producidas,
          })
          await tx.stockAjuste.create({
            data: {
              tenantId,
              articuloId: orden.data.articuloId,
              cantidad: producidas,
              motivo: PRODUCTION_ALTA_MOTIVO,
              userId,
              depositoId: orden.data.depositoId,
            },
          })
        }

        return tx.ordenProduccion.update({
          where: { id: orden.data.id },
          data: {
            estado: 'completada',
            cantidadReal: new Decimal(input.cantidadReal),
            costoTotal: new Decimal(costoTotal),
            fechaFin: new Date(),
          },
          include: ordenInclude,
        })
      })
      return { ok: true, data: mapOrden(updated) }
    } catch (err) {
      if (err instanceof Error && err.message === 'INSUFFICIENT_DEPOSIT_STOCK') {
        return { ok: false, status: 422, error: 'INSUFFICIENT_STOCK' }
      }
      throw err
    }
  }

  async cancelar(tenantId: number, id: number): Promise<ServiceResult<OrdenProduccionRow>> {
    const orden = await this.getById(tenantId, id)
    if (!orden.ok) return orden
    if (orden.data.estado === 'completada' || orden.data.estado === 'cancelada') {
      return { ok: false, status: 422, error: 'ORDER_NOT_CANCELLABLE' }
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.stockReservaProduccion.updateMany({
        where: { tenantId, ordenId: orden.data.id, activa: true },
        data: { activa: false, releasedAt: new Date() },
      })
      return tx.ordenProduccion.update({
        where: { id: orden.data.id },
        data: { estado: 'cancelada', fechaFin: new Date() },
        include: ordenInclude,
      })
    })
    return { ok: true, data: mapOrden(updated) }
  }

  /**
   * @en Creates a draft purchase order for the missing inputs of a production order (#135 reuse).
   * @es Crea una orden de compra borrador con los insumos faltantes de la orden (reutiliza #135).
   * @pt-BR Cria uma ordem de compra rascunho com os insumos faltantes da ordem (reutiliza #135).
   */
  async sugerirCompra(
    tenantId: number,
    id: number,
    input: OrdenProduccionSugerirCompraInput,
  ): Promise<ServiceResult<OrdenProduccionSugerirCompraResult>> {
    const orden = await this.getById(tenantId, id)
    if (!orden.ok) return orden
    const stock = await this.loadStockEntries(tenantId, orden.data)
    const disponibilidad = calcularDisponibilidad(orden.data, stock)
    const faltantes = disponibilidad.lineas.filter((linea) => linea.faltante > 0)
    if (faltantes.length === 0) {
      return { ok: false, status: 422, error: 'NO_MISSING_INPUTS' }
    }
    const costoByArticulo = new Map(
      orden.data.insumos.map((insumo) => [insumo.articuloId, insumo.articulo?.costo ?? 0]),
    )
    const items = faltantes.map((linea) => ({
      articuloId: linea.articuloId,
      cantidad: stockUnitsForConsumption(linea.faltante),
      costoUnitario: costoByArticulo.get(linea.articuloId) ?? 0,
    }))
    const created = await this.compras.create(tenantId, {
      proveedorId: input.proveedorId,
      items,
      nota: `OP-${String(orden.data.numero).padStart(5, '0')}`,
      depositoId: orden.data.depositoId,
    })
    if (!created.ok) return created
    return { ok: true, data: { ordenCompraId: created.data.id, items } }
  }

  private async loadStockEntries(
    tenantId: number,
    orden: OrdenProduccionRow,
  ): Promise<DisponibilidadStockEntry[]> {
    const articuloIds = orden.insumos.map((insumo) => insumo.articuloId)
    if (articuloIds.length === 0) return []
    const [stockRows, reservas] = await Promise.all([
      this.prisma.stockDeposito.findMany({
        where: { tenantId, depositoId: orden.depositoId, articuloId: { in: articuloIds } },
        select: { articuloId: true, cantidad: true },
      }),
      this.prisma.stockReservaProduccion.findMany({
        where: {
          tenantId,
          depositoId: orden.depositoId,
          articuloId: { in: articuloIds },
          activa: true,
          ordenId: { not: orden.id },
        },
        select: { articuloId: true, cantidad: true },
      }),
    ])
    const fisicoByArticulo = new Map(
      stockRows.map((row) => [row.articuloId, toRequiredNumber(row.cantidad)]),
    )
    const reservadoByArticulo = new Map<number, number>()
    for (const reserva of reservas) {
      const current = reservadoByArticulo.get(reserva.articuloId) ?? 0
      reservadoByArticulo.set(reserva.articuloId, current + toRequiredNumber(reserva.cantidad))
    }
    return articuloIds.map((articuloId) => ({
      articuloId,
      fisico: fisicoByArticulo.get(articuloId) ?? 0,
      reservado: round4(reservadoByArticulo.get(articuloId) ?? 0),
    }))
  }
}
