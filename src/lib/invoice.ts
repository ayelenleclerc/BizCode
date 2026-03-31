/**
 * Lógica de cálculo de facturas según IVA argentino
 */

export interface InvoiceItem {
  articuloId: number
  cantidad: number
  precio: number
  dscto: number // descuento %
}

export interface InvoiceTotals {
  neto1: number // Neto IVA 21%
  neto2: number // Neto IVA 10.5%
  neto3: number // Neto exento
  iva1: number // IVA 21%
  iva2: number // IVA 10.5%
  total: number
}

/**
 * Calcula los totales de una factura según IVA de cliente y artículos
 * clienteIva: RI, Mono, CF, Exento
 * items: con datos de cantidad, precio, descuento e iva del articulo (1=21%, 2=10.5%, 3=exento)
 */
export function calculateInvoice(
  items: Array<{
    cantidad: number
    precio: number
    dscto: number
    articuloIva: '1' | '2' | '3'
  }>,
  clienteIva: string
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

  if (clienteIva !== 'CF' && clienteIva !== 'Exento') {
    // RI y Monotributista pagan IVA
    iva1 = Math.round(neto1 * 0.21 * 100) / 100
    iva2 = Math.round(neto2 * 0.105 * 100) / 100
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
 * Calcula subtotal de un item
 */
export function calculateItemSubtotal(cantidad: number, precio: number, dscto: number): number {
  const subtotal = cantidad * precio
  const withDiscount = subtotal - (subtotal * dscto) / 100
  return Math.round(withDiscount * 100) / 100
}
