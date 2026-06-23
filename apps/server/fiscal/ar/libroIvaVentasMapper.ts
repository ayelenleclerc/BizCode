import type { Cliente, Factura, NotaCredito } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import {
  TIPO_ANULADO_ARCA,
  TIPO_FACTURA_ARCA,
  TIPO_NC_ARCA,
} from './libroIvaVentasConstants'
import {
  alicuotaCodeForRate,
  buildAlicuotaLine,
  buildCbtvLine,
  padPuntoVenta,
  type LibroIvaAlicuotaRow,
} from './libroIvaVentasFormat'

export type FacturaWithCliente = Factura & { cliente: Cliente }

export type NotaCreditoWithOrigen = NotaCredito & {
  facturaOrigen: Factura & { cliente: Cliente }
}

export type LibroIvaVentasPreviewTotals = {
  alicuotaCode: string
  neto: number
  iva: number
}

export type LibroIvaVentasMapped = {
  cbtvLines: string[]
  alicuotasLines: string[]
  previewTotals: LibroIvaVentasPreviewTotals[]
  recordCountCbtv: number
  recordCountAlicuotas: number
}

function dec(value: Decimal | number | null | undefined): number {
  if (value == null) return 0
  if (value instanceof Decimal) return value.toNumber()
  return Number(value)
}

function resolveFacturaTipoArca(tipo: string): string | null {
  return TIPO_FACTURA_ARCA[tipo.toUpperCase()] ?? null
}

function resolveNcTipoArca(tipo: string): string | null {
  return TIPO_NC_ARCA[tipo.toUpperCase()] ?? null
}

function buildAlicuotaRowsFromFactura(
  tipoArca: string,
  puntoVenta: string,
  numeroComprobante: string,
  neto1: number,
  iva1: number,
  neto2: number,
  iva2: number,
): LibroIvaAlicuotaRow[] {
  const rows: LibroIvaAlicuotaRow[] = []
  if (neto1 !== 0 || iva1 !== 0) {
    rows.push({
      tipoComprobante: tipoArca,
      puntoVenta,
      numeroComprobante,
      netoGravado: neto1,
      alicuotaCode: alicuotaCodeForRate(neto1, iva1),
      impuestoLiquidado: iva1,
    })
  }
  if (neto2 !== 0 || iva2 !== 0) {
    rows.push({
      tipoComprobante: tipoArca,
      puntoVenta,
      numeroComprobante,
      netoGravado: neto2,
      alicuotaCode: alicuotaCodeForRate(neto2, iva2),
      impuestoLiquidado: iva2,
    })
  }
  return rows
}

function accumulatePreview(
  totals: Map<string, LibroIvaVentasPreviewTotals>,
  rows: LibroIvaAlicuotaRow[],
): void {
  for (const row of rows) {
    const existing = totals.get(row.alicuotaCode) ?? {
      alicuotaCode: row.alicuotaCode,
      neto: 0,
      iva: 0,
    }
    existing.neto += row.netoGravado
    existing.iva += row.impuestoLiquidado
    totals.set(row.alicuotaCode, existing)
  }
}

/**
 * @en Maps active invoices and credit notes to CBTV/ALICUOTAS lines (#147, ADR-0013).
 * @es Mapea facturas vigentes y notas de crédito a líneas CBTV/ALICUOTAS (#147, ADR-0013).
 * @pt-BR Mapeia faturas ativas e notas de crédito para linhas CBTV/ALICUOTAS (#147, ADR-0013).
 */
export function mapLibroIvaVentas(
  facturas: FacturaWithCliente[],
  notasCredito: NotaCreditoWithOrigen[],
): LibroIvaVentasMapped {
  const cbtvLines: string[] = []
  const alicuotasLines: string[] = []
  const previewMap = new Map<string, LibroIvaVentasPreviewTotals>()

  for (const factura of facturas) {
    const tipoArca = resolveFacturaTipoArca(factura.tipo)
    if (!tipoArca) continue

    const neto1 = dec(factura.neto1)
    const neto2 = dec(factura.neto2)
    const neto3 = dec(factura.neto3)
    const iva1 = dec(factura.iva1)
    const iva2 = dec(factura.iva2)
    const total = dec(factura.total)
    const puntoVenta = padPuntoVenta(factura.prefijo)
    const numero = String(factura.numero)

    const alicuotaRows = buildAlicuotaRowsFromFactura(
      tipoArca,
      puntoVenta,
      numero,
      neto1,
      iva1,
      neto2,
      iva2,
    )

    cbtvLines.push(
      buildCbtvLine({
        fecha: factura.fecha,
        tipoComprobante: tipoArca,
        puntoVenta,
        numeroComprobante: numero,
        buyerName: factura.cliente.rsocial,
        cuit: factura.cliente.cuit,
        importeTotal: total,
        importeExento: neto3,
        cantAlicuotas: alicuotaRows.length,
      }),
    )

    for (const row of alicuotaRows) {
      alicuotasLines.push(buildAlicuotaLine(row))
    }
    accumulatePreview(previewMap, alicuotaRows)
  }

  for (const nc of notasCredito) {
    const origen = nc.facturaOrigen
    const tipoNc = resolveNcTipoArca(origen.tipo)
    if (!tipoNc) continue

    const neto1 = dec(origen.neto1)
    const neto2 = dec(origen.neto2)
    const neto3 = dec(origen.neto3)
    const iva1 = dec(origen.iva1)
    const iva2 = dec(origen.iva2)
    const total = dec(nc.monto)
    const puntoVenta = padPuntoVenta(origen.prefijo)
    const numeroNc = String(nc.id)
    const voidDate = nc.createdAt

    const alicuotaRows = buildAlicuotaRowsFromFactura(
      tipoNc,
      puntoVenta,
      numeroNc,
      neto1,
      iva1,
      neto2,
      iva2,
    )

    cbtvLines.push(
      buildCbtvLine({
        fecha: voidDate,
        tipoComprobante: tipoNc,
        puntoVenta,
        numeroComprobante: numeroNc,
        buyerName: origen.cliente.rsocial,
        cuit: origen.cliente.cuit,
        importeTotal: total,
        importeExento: neto3,
        cantAlicuotas: alicuotaRows.length,
      }),
    )

    for (const row of alicuotaRows) {
      alicuotasLines.push(buildAlicuotaLine(row))
    }
    accumulatePreview(previewMap, alicuotaRows)

    cbtvLines.push(
      buildCbtvLine({
        fecha: voidDate,
        tipoComprobante: TIPO_ANULADO_ARCA,
        puntoVenta,
        numeroComprobante: String(origen.numero),
        buyerName: origen.cliente.rsocial,
        cuit: origen.cliente.cuit,
        importeTotal: dec(origen.total),
        importeExento: neto3,
        cantAlicuotas: 0,
      }),
    )
  }

  return {
    cbtvLines,
    alicuotasLines,
    previewTotals: [...previewMap.values()].sort((a, b) => a.alicuotaCode.localeCompare(b.alicuotaCode)),
    recordCountCbtv: cbtvLines.length,
    recordCountAlicuotas: alicuotasLines.length,
  }
}
