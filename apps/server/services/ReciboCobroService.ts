import type { Factura, Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { NotFoundAppError } from '../errors/AppError'
import type { ReciboCobroInput } from '@bizcode/types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'
import { ClienteCuentaCorrienteService } from './ClienteCuentaCorrienteService'
import { RetencionConstanciaService } from './RetencionConstanciaService'
import { validateCobroRetenciones } from './RetencionCobroValidation'
import { computeScoreChange } from './CobroService'

function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}

function formatFacturaRef(factura: Pick<Factura, 'tipo' | 'prefijo' | 'numero'>): string {
  return `${factura.tipo}-${factura.prefijo}-${factura.numero}`
}

const reciboInclude = {
  formas: { include: { cheque: { select: { id: true, numero: true, banco: true } } } },
  imputaciones: {
    include: {
      factura: { select: { id: true, tipo: true, prefijo: true, numero: true } },
    },
  },
  cliente: { select: { id: true, codigo: true, rsocial: true, cuit: true } },
  usuario: { select: { id: true, username: true } },
  retencionesAplicadas: {
    include: { regimen: { select: { nombre: true, tipo: true } } },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.ReciboCobroInclude

type ReciboCobroRow = Prisma.ReciboCobroGetPayload<{ include: typeof reciboInclude }>

export type ReciboCobroFormaDto = {
  id: number
  tipo: string
  importe: string
  chequeId: number | null
  referencia: string | null
  banco: string | null
  chequeNumero: string | null
  chequeBanco: string | null
}

export type ReciboCobroImputacionDto = {
  id: number
  facturaId: number
  facturaRef: string
  importe: string
  saldoPrevio: string
  saldoPostPago: string
}

export type ReciboCobroRetencionDto = {
  id: number
  regimenId: number
  regimenNombre: string
  tipo: string
  baseImponible: string
  alicuota: string
  importe: string
  constanciaNum: string | null
}

export type ReciboCobroDto = {
  id: number
  numero: number
  clienteId: number
  fecha: string
  totalCobrado: string
  totalBruto: string
  concepto: string | null
  estado: string
  anulacionMotivo: string | null
  usuarioId: number
  cliente: { id: number; codigo: number; rsocial: string; cuit: string | null }
  usuario: { id: number; username: string }
  formas: ReciboCobroFormaDto[]
  imputaciones: ReciboCobroImputacionDto[]
  retenciones: ReciboCobroRetencionDto[]
  createdAt: string
}

export type FacturaPendienteClienteDto = {
  facturaId: number
  facturaRef: string
  fecha: string
  total: string
  pagado: string
  pendiente: string
}

export type ReciboCobroPdfData = {
  recibo: ReciboCobroDto
  empresa: {
    nombre: string
    cuit: string
    domicilio: string | null
    logoUrl: string | null
  }
}

function mapRecibo(row: ReciboCobroRow): ReciboCobroDto {
  const retTotal = row.retencionesAplicadas.reduce(
    (sum, r) => sum.add(r.importe),
    new Decimal(0),
  )
  const totalBruto = row.totalCobrado.add(retTotal)
  return {
    id: row.id,
    numero: row.numero,
    clienteId: row.clienteId,
    fecha: row.fecha.toISOString(),
    totalCobrado: decimalToMoneyString(row.totalCobrado),
    totalBruto: decimalToMoneyString(totalBruto),
    concepto: row.concepto,
    estado: row.estado,
    anulacionMotivo: row.anulacionMotivo,
    usuarioId: row.usuarioId,
    cliente: row.cliente,
    usuario: row.usuario,
    formas: row.formas.map((f) => ({
      id: f.id,
      tipo: f.tipo,
      importe: decimalToMoneyString(f.importe),
      chequeId: f.chequeId,
      referencia: f.referencia,
      banco: f.banco,
      chequeNumero: f.cheque?.numero ?? null,
      chequeBanco: f.cheque?.banco ?? null,
    })),
    imputaciones: row.imputaciones.map((imp) => ({
      id: imp.id,
      facturaId: imp.facturaId,
      facturaRef: formatFacturaRef(imp.factura),
      importe: decimalToMoneyString(imp.importe),
      saldoPrevio: decimalToMoneyString(imp.saldoPrevio),
      saldoPostPago: decimalToMoneyString(imp.saldoPostPago),
    })),
    retenciones: row.retencionesAplicadas.map((r) => ({
      id: r.id,
      regimenId: r.regimenId,
      regimenNombre: r.regimen.nombre,
      tipo: r.regimen.tipo,
      baseImponible: decimalToMoneyString(r.baseImponible),
      alicuota: r.alicuota.toString(),
      importe: decimalToMoneyString(r.importe),
      constanciaNum: r.constanciaNum,
    })),
    createdAt: row.createdAt.toISOString(),
  }
}

function allocateFifo(
  pendientes: FacturaPendienteClienteDto[],
  montoDisponible: number,
): Array<{ facturaId: number; importe: number }> {
  let remaining = montoDisponible
  const result: Array<{ facturaId: number; importe: number }> = []
  for (const p of pendientes) {
    if (remaining <= 0.009) break
    const pend = Number.parseFloat(p.pendiente)
    if (pend <= 0.009) continue
    const alloc = Math.min(pend, remaining)
    result.push({ facturaId: p.facturaId, importe: alloc })
    remaining -= alloc
  }
  return result
}

/**
 * @en Customer payment receipt operations (#233).
 * @es Operaciones de recibo de cobro a cliente (#233).
 * @pt-BR Operações de recibo de cobrança de cliente (#233).
 */
export class ReciboCobroService {
  constructor(private readonly prisma: PrismaClient) {}

  private async assertCliente(tenantId: number, clienteId: number): Promise<void> {
    const c = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true },
    })
    if (!c) throw new NotFoundAppError('Cliente not found')
  }

  async list(
    tenantId: number,
    clienteId: number,
    take: number,
    skip: number,
  ): Promise<{ total: number; recibos: ReciboCobroDto[] }> {
    await this.assertCliente(tenantId, clienteId)
    const where = { tenantId, clienteId }
    const [total, rows] = await Promise.all([
      this.prisma.reciboCobro.count({ where }),
      this.prisma.reciboCobro.findMany({
        where,
        include: reciboInclude,
        orderBy: [{ fecha: 'desc' }, { numero: 'desc' }],
        take,
        skip,
      }),
    ])
    return { total, recibos: rows.map(mapRecibo) }
  }

  async getById(tenantId: number, clienteId: number, reciboId: number): Promise<ReciboCobroDto | null> {
    const row = await this.prisma.reciboCobro.findFirst({
      where: { id: reciboId, tenantId, clienteId },
      include: reciboInclude,
    })
    return row ? mapRecibo(row) : null
  }

  async listFacturasPendientes(
    tenantId: number,
    clienteId: number,
  ): Promise<FacturaPendienteClienteDto[]> {
    await this.assertCliente(tenantId, clienteId)
    const facturas = await this.prisma.factura.findMany({
      where: { tenantId, clienteId, estado: 'A' },
      orderBy: { fecha: 'asc' },
    })
    if (facturas.length === 0) return []

    const ids = facturas.map((f) => f.id)
    const allocations = await this.prisma.reciboCobroImputacion.groupBy({
      by: ['facturaId'],
      where: {
        facturaId: { in: ids },
        reciboCobro: { tenantId, clienteId, estado: 'emitido' },
      },
      _sum: { importe: true },
    })
    const paidMap = new Map<number, Decimal>()
    for (const row of allocations) {
      if (row._sum.importe != null) {
        paidMap.set(row.facturaId, row._sum.importe)
      }
    }

    const result: FacturaPendienteClienteDto[] = []
    for (const f of facturas) {
      const pagado = paidMap.get(f.id) ?? new Decimal(0)
      const pendiente = f.total.minus(pagado)
      if (pendiente.lessThanOrEqualTo(0)) continue
      result.push({
        facturaId: f.id,
        facturaRef: formatFacturaRef(f),
        fecha: f.fecha.toISOString(),
        total: decimalToMoneyString(f.total),
        pagado: decimalToMoneyString(pagado),
        pendiente: decimalToMoneyString(pendiente),
      })
    }
    return result
  }

  async create(
    tenantId: number,
    clienteId: number,
    usuarioId: number,
    input: ReciboCobroInput,
  ): Promise<ServiceResult<ReciboCobroDto>> {
    await this.assertCliente(tenantId, clienteId)

    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true, activo: true, suspended: true, score: true, creditDays: true },
    })
    if (!cliente) {
      return { ok: false, status: 404, error: 'Cliente not found' }
    }
    if (!cliente.activo) {
      return { ok: false, status: 422, error: 'CLIENT_INACTIVE' }
    }
    if (cliente.suspended) {
      return { ok: false, status: 422, error: 'CLIENT_SUSPENDED' }
    }

    if (input.formas.length === 0) {
      return { ok: false, status: 400, error: 'At least one payment method is required' }
    }

    const formasTotal = input.formas.reduce((sum, f) => sum + f.importe, 0)
    if (Math.abs(formasTotal - input.totalCobrado) > 0.009) {
      return {
        ok: false,
        status: 400,
        error: 'totalCobrado must equal sum of formas importe',
      }
    }

    const retencionValidation = await validateCobroRetenciones(
      this.prisma,
      tenantId,
      input.totalCobrado,
      input.retenciones,
    )
    if (!retencionValidation.ok) {
      return { ok: false, status: retencionValidation.status, error: retencionValidation.error }
    }

    const montoBruto = retencionValidation.montoBruto
    const validatedRetenciones = retencionValidation.lines

    const pendientes = await this.listFacturasPendientes(tenantId, clienteId)
    let imputacionLines = input.imputaciones ?? []
    if (imputacionLines.length === 0 && input.fifo !== false) {
      imputacionLines = allocateFifo(pendientes, montoBruto)
    }

    const facturaIds = imputacionLines.map((l) => l.facturaId)
    const facturas =
      facturaIds.length > 0
        ? await this.prisma.factura.findMany({
            where: { tenantId, clienteId, id: { in: facturaIds }, estado: 'A' },
          })
        : []
    const facturaById = new Map(facturas.map((f) => [f.id, f]))

    for (const line of imputacionLines) {
      if (line.importe <= 0) {
        return { ok: false, status: 400, error: 'Each imputacion importe must be positive' }
      }
      const factura = facturaById.get(line.facturaId)
      if (!factura) {
        return { ok: false, status: 400, error: `facturaId ${line.facturaId} is invalid` }
      }
      const pend = pendientes.find((p) => p.facturaId === line.facturaId)
      if (pend && line.importe > Number.parseFloat(pend.pendiente) + 0.009) {
        return {
          ok: false,
          status: 400,
          error: `Imputacion exceeds pending balance for ${formatFacturaRef(factura)}`,
        }
      }
    }

    const imputacionTotal = imputacionLines.reduce((sum, l) => sum + l.importe, 0)
    if (imputacionTotal > montoBruto + 0.009) {
      return {
        ok: false,
        status: 400,
        error: 'Sum of imputaciones cannot exceed gross receipt amount',
      }
    }

    for (const forma of input.formas) {
      if (forma.chequeId != null && forma.chequeNuevo) {
        return { ok: false, status: 400, error: 'Cannot specify both chequeId and chequeNuevo' }
      }
      if (forma.tipo === 'cheque' && forma.chequeId != null) {
        const linkedCheque = await this.prisma.cheque.findFirst({
          where: { id: forma.chequeId, tenantId, tipo: 'recibido', estado: 'en_cartera' },
          select: { id: true, clienteId: true },
        })
        if (!linkedCheque) {
          return { ok: false, status: 400, error: 'chequeId is not valid for portfolio linking' }
        }
        if (linkedCheque.clienteId != null && linkedCheque.clienteId !== clienteId) {
          return { ok: false, status: 400, error: 'chequeId does not belong to clienteId' }
        }
      }
    }

    const fecha = facturaFechaToPrismaDate(input.fecha)
    const totalDec = new Decimal(input.totalCobrado)

    const oldestFactura = await this.prisma.factura.findFirst({
      where: { tenantId, clienteId, estado: 'A' },
      orderBy: { fecha: 'asc' },
      select: { fecha: true },
    })
    const scoreChange = computeScoreChange(
      cliente.score,
      fecha,
      cliente.creditDays,
      oldestFactura?.fecha ?? null,
    )

    const created = await this.prisma.$transaction(async (tx) => {
      const last = await tx.reciboCobro.findFirst({
        where: { tenantId },
        orderBy: { numero: 'desc' },
        select: { numero: true },
      })
      const numero = (last?.numero ?? 0) + 1

      const formasCreate: Prisma.ReciboCobroFormaCreateWithoutReciboCobroInput[] = []
      for (const forma of input.formas) {
        let chequeId: number | null = forma.chequeId ?? null
        if (forma.chequeNuevo) {
          const nuevo = forma.chequeNuevo
          const chequeRow = await tx.cheque.create({
            data: {
              tenantId,
              tipo: 'recibido',
              modalidad: nuevo.modalidad,
              numero: nuevo.numero.trim(),
              banco: nuevo.banco.trim(),
              sucursal: nuevo.sucursal?.trim() ?? null,
              cbuOrigen: nuevo.cbuOrigen?.trim() ?? null,
              libradorNombre: nuevo.libradorNombre.trim(),
              libradorCuit: nuevo.libradorCuit?.trim() ?? null,
              monto: new Decimal(nuevo.monto),
              moneda: nuevo.moneda?.trim() || 'ARS',
              fechaEmision: facturaFechaToPrismaDate(nuevo.fechaEmision),
              fechaVencimiento: facturaFechaToPrismaDate(nuevo.fechaVencimiento),
              estado: 'en_cartera',
              clienteId,
              proveedorId: null,
              observaciones: nuevo.observaciones?.trim() ?? null,
            },
          })
          await tx.chequeMov.create({
            data: {
              chequeId: chequeRow.id,
              tipo: 'recepcion',
              monto: new Decimal(nuevo.monto),
              userId: usuarioId,
              nota: nuevo.observaciones?.trim() ?? null,
            },
          })
          chequeId = chequeRow.id
        }
        formasCreate.push({
          tipo: forma.tipo,
          importe: new Decimal(forma.importe),
          ...(chequeId != null ? { cheque: { connect: { id: chequeId } } } : {}),
          referencia: forma.referencia?.trim() ?? null,
          banco: forma.banco?.trim() ?? null,
        })
      }

      const imputacionesCreate: Prisma.ReciboCobroImputacionCreateWithoutReciboCobroInput[] = []
      for (const line of imputacionLines) {
        const factura = facturaById.get(line.facturaId)
        if (!factura) continue
        const pend = pendientes.find((p) => p.facturaId === line.facturaId)
        const saldoPrevio = new Decimal(pend?.pendiente ?? factura.total.toString())
        imputacionesCreate.push({
          factura: { connect: { id: line.facturaId } },
          importe: new Decimal(line.importe),
          saldoPrevio,
          saldoPostPago: saldoPrevio.minus(line.importe),
        })
      }

      const recibo = await tx.reciboCobro.create({
        data: {
          tenantId,
          numero,
          clienteId,
          fecha,
          totalCobrado: totalDec,
          concepto: input.concepto?.trim() ?? null,
          usuarioId,
          formas: { create: formasCreate },
          imputaciones: { create: imputacionesCreate },
        },
        include: reciboInclude,
      })

      if (validatedRetenciones.length > 0) {
        const constanciaService = new RetencionConstanciaService(tx)
        for (const line of validatedRetenciones) {
          const constanciaNum = await constanciaService.nextConstanciaNum(
            tenantId,
            line.tipo,
            line.provincia,
          )
          await tx.retencionAplicada.create({
            data: {
              tenantId,
              regimenId: line.regimenId,
              tipo: line.subtipo,
              entidadTipo: 'cliente',
              entidadId: clienteId,
              reciboCobroId: recibo.id,
              baseImponible: new Decimal(line.baseImponible),
              alicuota: new Decimal(line.alicuota),
              importe: new Decimal(line.importe),
              constanciaNum,
            },
          })
        }
      }

      const ccService = new ClienteCuentaCorrienteService(tx)
      await ccService.recordFromReciboCobro(
        tenantId,
        { id: recibo.id, clienteId, fecha, numero },
        montoBruto,
        usuarioId,
      )

      if (scoreChange.delta !== 0) {
        await tx.cliente.update({
          where: { id: clienteId },
          data: { score: scoreChange.scoreAfter },
        })
      }

      const withRelations = await tx.reciboCobro.findFirstOrThrow({
        where: { id: recibo.id },
        include: reciboInclude,
      })
      return withRelations
    })

    return { ok: true, data: mapRecibo(created) }
  }

  async voidRecibo(
    tenantId: number,
    clienteId: number,
    reciboId: number,
    usuarioId: number,
    anulacionMotivo: string,
  ): Promise<ServiceResult<ReciboCobroDto>> {
    const existing = await this.prisma.reciboCobro.findFirst({
      where: { id: reciboId, tenantId, clienteId },
      include: reciboInclude,
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Recibo not found' }
    }
    if (existing.estado !== 'emitido') {
      return { ok: false, status: 422, error: 'Recibo is already voided' }
    }

    const retTotal = existing.retencionesAplicadas.reduce(
      (sum, r) => sum.add(r.importe),
      new Decimal(0),
    )
    const brutoDec = existing.totalCobrado.add(retTotal)

    const updated = await this.prisma.$transaction(async (tx) => {
      const recibo = await tx.reciboCobro.update({
        where: { id: reciboId },
        data: { estado: 'anulado', anulacionMotivo: anulacionMotivo.trim() },
        include: reciboInclude,
      })

      const ccService = new ClienteCuentaCorrienteService(tx)
      await ccService.recordMovimiento({
        tenantId,
        clienteId,
        tipo: 'cobro',
        monto: brutoDec,
        referencia: `ANUL-RC-${existing.numero}`,
        fecha: new Date(),
        usuarioId,
        notas: `Anulación recibo de cobro #${existing.numero}`,
      })

      return recibo
    })

    return { ok: true, data: mapRecibo(updated) }
  }

  /**
   * @en Records a partial reversal of a receipt payment for MP partial refunds (#344).
   * @es Registra reversión parcial de cobro en recibo para reembolsos MP parciales (#344).
   * @pt-BR Registra reversão parcial de cobrança no recibo para reembolsos MP parciais (#344).
   */
  async recordPartialRefundReversal(
    tenantId: number,
    clienteId: number,
    reciboId: number,
    usuarioId: number,
    monto: Decimal,
    motivo: string,
    refundId: number,
  ): Promise<ServiceResult<ReciboCobroDto>> {
    const existing = await this.prisma.reciboCobro.findFirst({
      where: { id: reciboId, tenantId, clienteId },
      include: reciboInclude,
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Recibo not found' }
    }
    if (existing.estado !== 'emitido') {
      return { ok: false, status: 422, error: 'Recibo is not active' }
    }

    const montoDec = monto instanceof Decimal ? monto : new Decimal(monto)
    if (montoDec.lessThanOrEqualTo(0)) {
      return { ok: false, status: 422, error: 'Reversal amount must be positive' }
    }
    if (montoDec.greaterThan(existing.totalCobrado)) {
      return { ok: false, status: 422, error: 'Reversal amount exceeds receipt total' }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const ccService = new ClienteCuentaCorrienteService(tx)
      await ccService.recordMovimiento({
        tenantId,
        clienteId,
        tipo: 'cobro',
        monto: montoDec,
        referencia: `REEMB-MP-RC-${existing.numero}-${refundId}`,
        fecha: new Date(),
        usuarioId,
        notas: `Reembolso parcial MP: ${motivo.trim()}`.slice(0, 500),
      })

      const recibo = await tx.reciboCobro.findFirstOrThrow({
        where: { id: reciboId },
        include: reciboInclude,
      })
      return recibo
    })

    return { ok: true, data: mapRecibo(updated) }
  }

  async getPdfData(
    tenantId: number,
    clienteId: number,
    reciboId: number,
  ): Promise<ReciboCobroPdfData | null> {
    const recibo = await this.getById(tenantId, clienteId, reciboId)
    if (!recibo) return null

    const empresa = await this.prisma.paramEmpresa.findFirst({
      where: { tenantId },
      select: { nombre: true, cuit: true, domicilio: true, logoUrl: true },
    })

    return {
      recibo,
      empresa: {
        nombre: empresa?.nombre ?? 'Empresa',
        cuit: empresa?.cuit ?? '',
        domicilio: empresa?.domicilio ?? null,
        logoUrl: empresa?.logoUrl ?? null,
      },
    }
  }
}

export function reciboCobroPdfFilename(numero: number): string {
  return `recibo-cobro-${numero}.pdf`
}
