import type { ComprobanteCompra, Proveedor } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { TIPO_FACTURA_AFIP } from './libroIvaVentasConstants'
import {
  alicuotaCodeForRate,
  buildAlicuotaLine,
  buildCbtvLine,
  padPuntoVenta,
  type LibroIvaAlicuotaRow,
} from './libroIvaVentasFormat'

export type ComprobanteCompraWithProveedor = ComprobanteCompra & { proveedor: Proveedor }

export type LibroIvaComprasPreviewTotals = {
  alicuotaCode: string
  neto: number
  iva: number
}

export type LibroIvaComprasMapped = {
  cbtuLines: string[]
  alicuotasLines: string[]
  previewTotals: LibroIvaComprasPreviewTotals[]
  recordCountCbtu: number
  recordCountAlicuotas: number
}

function dec(value: Decimal | number | null | undefined): number {
  if (value == null) return 0
  if (value instanceof Decimal) return value.toNumber()
  return Number(value)
}

function resolveTipoAfip(tipo: string): string | null {
  return TIPO_FACTURA_AFIP[tipo.toUpperCase()] ?? null
}

function buildAlicuotaRowsFromComprobante(
  tipoAfip: string,
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
      tipoComprobante: tipoAfip,
      puntoVenta,
      numeroComprobante,
      netoGravado: neto1,
      alicuotaCode: alicuotaCodeForRate(neto1, iva1),
      impuestoLiquidado: iva1,
    })
  }
  if (neto2 !== 0 || iva2 !== 0) {
    rows.push({
      tipoComprobante: tipoAfip,
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
  totals: Map<string, LibroIvaComprasPreviewTotals>,
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
 * @en Maps active purchase vouchers to CBTU/ALICUOTAS lines (#306, ADR-0014).
 * @es Mapea comprobantes de compra vigentes a líneas CBTU/ALICUOTAS (#306, ADR-0014).
 * @pt-BR Mapeia comprovantes de compra ativos para linhas CBTU/ALICUOTAS (#306, ADR-0014).
 */
export function mapLibroIvaCompras(
  comprobantes: ComprobanteCompraWithProveedor[],
): LibroIvaComprasMapped {
  const cbtuLines: string[] = []
  const alicuotasLines: string[] = []
  const previewMap = new Map<string, LibroIvaComprasPreviewTotals>()

  for (const comp of comprobantes) {
    const tipoAfip = resolveTipoAfip(comp.tipo)
    if (!tipoAfip) continue

    const neto1 = dec(comp.neto1)
    const neto2 = dec(comp.neto2)
    const neto3 = dec(comp.neto3)
    const iva1 = dec(comp.iva1)
    const iva2 = dec(comp.iva2)
    const total = dec(comp.total)
    const puntoVenta = padPuntoVenta(comp.prefijo)
    const numero = String(comp.numero)

    const alicuotaRows = buildAlicuotaRowsFromComprobante(
      tipoAfip,
      puntoVenta,
      numero,
      neto1,
      iva1,
      neto2,
      iva2,
    )

    cbtuLines.push(
      buildCbtvLine({
        fecha: comp.fecha,
        tipoComprobante: tipoAfip,
        puntoVenta,
        numeroComprobante: numero,
        buyerName: comp.proveedor.rsocial,
        cuit: comp.proveedor.cuit,
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

  return {
    cbtuLines,
    alicuotasLines,
    previewTotals: [...previewMap.values()].sort((a, b) => a.alicuotaCode.localeCompare(b.alicuotaCode)),
    recordCountCbtu: cbtuLines.length,
    recordCountAlicuotas: alicuotasLines.length,
  }
}
