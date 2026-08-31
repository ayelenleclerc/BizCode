/**
 * @en VAT invoice line aggregation (net, IVA buckets, total) driven by the tenant jurisdiction (#207).
 * @es Agregación de líneas de factura con IVA (netos, IVA, total) según la jurisdicción del tenant (#207).
 * @pt-BR Agregação de linhas de fatura com IVA (líquidos, IVA, total) conforme a jurisdição do tenant (#207).
 */

import { getVatRates, subjectPaysVat } from '@bizcode/types'

export interface InvoiceItem {
  articuloId: number
  cantidad: number
  precio: number
  dscto: number // descuento %
}

export interface InvoiceTotals {
  neto1: number // Neto alícuota general (AR 21%, UY 22%)
  neto2: number // Neto alícuota reducida (AR 10.5%, UY 10%)
  neto3: number // Neto exento
  iva1: number // IVA alícuota general
  iva2: number // IVA alícuota reducida
  total: number
}

/**
 * @en Computes invoice totals from line items and customer VAT category (`clienteIva`: RI, Mono, CF, Exento). Article VAT codes: `1` standard rate, `2` reduced rate, `3` exempt; the rates come from the tenant jurisdiction (#207), defaulting to Argentina.
 * @es Calcula totales según ítems y condición IVA del cliente; `articuloIva` 1/2/3 según alícuota del artículo, con las tasas de la jurisdicción del tenant (#207) y Argentina por defecto.
 * @pt-BR Calcula totais a partir dos itens e da condição de IVA do cliente; `articuloIva` 1/2/3 conforme alíquota, com as taxas da jurisdição do tenant (#207) e Argentina por padrão.
 */
export function calculateInvoice(
  items: Array<{
    cantidad: number
    precio: number
    dscto: number
    articuloIva: '1' | '2' | '3'
  }>,
  clienteIva: string,
  jurisdiccion?: unknown
): InvoiceTotals {
  let neto1 = 0
  let neto2 = 0
  let neto3 = 0

  items.forEach((item) => {
    const subtotal = item.cantidad * item.precio
    const netoItem = subtotal - (subtotal * item.dscto) / 100

    // Clasificar por IVA del artículo
    if (item.articuloIva === '1') {
      neto1 += netoItem
    } else if (item.articuloIva === '2') {
      neto2 += netoItem
    } else if (item.articuloIva === '3') {
      neto3 += netoItem
    }
  })

  // Redondear a 2 decimales
  neto1 = Math.round(neto1 * 100) / 100
  neto2 = Math.round(neto2 * 100) / 100
  neto3 = Math.round(neto3 * 100) / 100

  // Calcular IVA según condición del cliente
  let iva1 = 0
  let iva2 = 0

  // Quién paga IVA lo declara cada país en su conjunto de reglas, no el motor (#440).
  if (subjectPaysVat(clienteIva, jurisdiccion)) {
    const { standard, reduced } = getVatRates(jurisdiccion)
    iva1 = Math.round(((neto1 * standard) / 100) * 100) / 100
    iva2 = Math.round(((neto2 * reduced) / 100) * 100) / 100
  }

  const total = neto1 + neto2 + neto3 + iva1 + iva2

  return {
    neto1,
    neto2,
    neto3,
    iva1,
    iva2,
    total: Math.round(total * 100) / 100,
  }
}

/**
 * @en Line subtotal after discount percentage.
 * @es Subtotal de línea tras descuento porcentual.
 * @pt-BR Subtotal da linha após desconto percentual.
 */
export function calculateItemSubtotal(cantidad: number, precio: number, dscto: number): number {
  const subtotal = cantidad * precio
  const withDiscount = subtotal - (subtotal * dscto) / 100
  return Math.round(withDiscount * 100) / 100
}
