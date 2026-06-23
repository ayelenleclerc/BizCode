import type { PrismaClient } from '@prisma/client'
import { buildLibroIvaComprasExcel } from '../fiscal/ar/libroIvaComprasExcel'
import {
  mapLibroIvaCompras,
  type ComprobanteCompraWithProveedor,
} from '../fiscal/ar/libroIvaComprasMapper'
import { buildLibroIvaComprasZip } from '../fiscal/ar/libroIvaComprasZip'
import { parseLibroIvaPeriodo } from './LibroIvaVentasService'

export type LibroIvaComprasPreview = {
  periodo: string
  recordCountCbtu: number
  recordCountAlicuotas: number
  totalsByAlicuota: { alicuotaCode: string; neto: number; iva: number }[]
  totalNeto: number
  totalIva: number
  totalExento: number
  totalGeneral: number
  cbtuLines: string[]
  alicuotasLines: string[]
  arcaValidationPending: true
}

export class LibroIvaComprasService {
  constructor(private readonly prisma: PrismaClient) {}

  async buildPreview(tenantId: number, periodo: string): Promise<LibroIvaComprasPreview> {
    const range = parseLibroIvaPeriodo(periodo)
    if (!range) {
      throw new Error('INVALID_PERIODO')
    }

    const comprobantes = (await this.prisma.comprobanteCompra.findMany({
      where: {
        tenantId,
        estado: 'A',
        fecha: { gte: range.from, lte: range.to },
      },
      include: { proveedor: true },
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
    })) as ComprobanteCompraWithProveedor[]

    const mapped = mapLibroIvaCompras(comprobantes)
    const totalNeto = mapped.previewTotals.reduce((sum, row) => sum + row.neto, 0)
    const totalIva = mapped.previewTotals.reduce((sum, row) => sum + row.iva, 0)
    const totalExento = comprobantes.reduce((sum, c) => sum + Number(c.neto3), 0)
    const totalGeneral = comprobantes.reduce((sum, c) => sum + Number(c.total), 0)

    return {
      periodo,
      recordCountCbtu: mapped.recordCountCbtu,
      recordCountAlicuotas: mapped.recordCountAlicuotas,
      totalsByAlicuota: mapped.previewTotals,
      totalNeto,
      totalIva,
      totalExento,
      totalGeneral,
      cbtuLines: mapped.cbtuLines,
      alicuotasLines: mapped.alicuotasLines,
      arcaValidationPending: true,
    }
  }

  async buildZip(tenantId: number, periodo: string): Promise<Buffer> {
    const preview = await this.buildPreview(tenantId, periodo)
    return buildLibroIvaComprasZip(preview.cbtuLines, preview.alicuotasLines)
  }

  async buildExcel(tenantId: number, periodo: string): Promise<Buffer> {
    const preview = await this.buildPreview(tenantId, periodo)
    return buildLibroIvaComprasExcel(preview)
  }
}
