import type { PrismaClient } from '@prisma/client'
import { endOfDay } from '../reportesPeriodUtils'
import { buildLibroIvaVentasExcel } from '../fiscal/ar/libroIvaVentasExcel'
import {
  mapLibroIvaVentas,
  type FacturaWithCliente,
  type NotaCreditoWithOrigen,
} from '../fiscal/ar/libroIvaVentasMapper'
import { buildLibroIvaVentasZip } from '../fiscal/ar/libroIvaVentasZip'

export type LibroIvaVentasPreview = {
  periodo: string
  recordCountCbtv: number
  recordCountAlicuotas: number
  totalsByAlicuota: { alicuotaCode: string; neto: number; iva: number }[]
  totalNeto: number
  totalIva: number
  totalExento: number
  totalGeneral: number
  cbtvLines: string[]
  alicuotasLines: string[]
  arcaValidationPending: true
}

const PERIODO_RE = /^(\d{4})-(\d{2})$/

/**
 * @en Parses YYYY-MM period to inclusive local date range.
 * @es Parsea período YYYY-MM a rango de fechas local inclusivo.
 * @pt-BR Analisa período YYYY-MM para intervalo de datas local inclusivo.
 */
export function parseLibroIvaPeriodo(periodo: string): { from: Date; to: Date } | null {
  const match = PERIODO_RE.exec(periodo)
  if (!match) return null
  const year = Number.parseInt(match[1], 10)
  const month = Number.parseInt(match[2], 10)
  if (month < 1 || month > 12) return null
  const from = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const to = endOfDay(new Date(year, month, 0))
  if (from.getFullYear() !== year || from.getMonth() !== month - 1) return null
  return { from, to }
}

export class LibroIvaVentasService {
  constructor(private readonly prisma: PrismaClient) {}

  async buildPreview(tenantId: number, periodo: string): Promise<LibroIvaVentasPreview> {
    const range = parseLibroIvaPeriodo(periodo)
    if (!range) {
      throw new Error('INVALID_PERIODO')
    }

    const [facturas, notasCredito] = await Promise.all([
      this.prisma.factura.findMany({
        where: {
          tenantId,
          estado: 'A',
          fecha: { gte: range.from, lte: range.to },
        },
        include: { cliente: true },
        orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
      }) as Promise<FacturaWithCliente[]>,
      this.prisma.notaCredito.findMany({
        where: {
          tenantId,
          createdAt: { gte: range.from, lte: range.to },
        },
        include: {
          facturaOrigen: { include: { cliente: true } },
        },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }) as Promise<NotaCreditoWithOrigen[]>,
    ])

    const mapped = mapLibroIvaVentas(facturas, notasCredito)
    const totalNeto = mapped.previewTotals.reduce((sum, row) => sum + row.neto, 0)
    const totalIva = mapped.previewTotals.reduce((sum, row) => sum + row.iva, 0)
    const totalExento = facturas.reduce((sum, f) => sum + Number(f.neto3), 0)
      + notasCredito.reduce((sum, nc) => sum + Number(nc.facturaOrigen.neto3), 0)
    const totalGeneral = facturas.reduce((sum, f) => sum + Number(f.total), 0)
      + notasCredito.reduce((sum, nc) => sum + Number(nc.monto), 0)

    return {
      periodo,
      recordCountCbtv: mapped.recordCountCbtv,
      recordCountAlicuotas: mapped.recordCountAlicuotas,
      totalsByAlicuota: mapped.previewTotals,
      totalNeto,
      totalIva,
      totalExento,
      totalGeneral,
      cbtvLines: mapped.cbtvLines,
      alicuotasLines: mapped.alicuotasLines,
      arcaValidationPending: true,
    }
  }

  async buildZip(tenantId: number, periodo: string): Promise<Buffer> {
    const preview = await this.buildPreview(tenantId, periodo)
    return buildLibroIvaVentasZip(preview.cbtvLines, preview.alicuotasLines)
  }

  async buildExcel(tenantId: number, periodo: string): Promise<Buffer> {
    const preview = await this.buildPreview(tenantId, periodo)
    return buildLibroIvaVentasExcel(preview)
  }
}
