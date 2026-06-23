import { describe, expect, it } from 'vitest'
import { parseDocumentoCompraLineItemsFromText } from '../../../../apps/server/fiscal/ar/documentoCompraLineItems'

describe('parseDocumentoCompraLineItemsFromText', () => {
  it('parses line items from multiline invoice text', () => {
    const text =
      'DETALLE\n' +
      'Aceite girasol 1L x 24 $1.250,00 $30.000,00\n' +
      'Aceite oliva 500ml x 12 $2.100,00 $25.200,00\n' +
      'TOTAL $55.200,00'
    const items = parseDocumentoCompraLineItemsFromText(text, 0.8)
    expect(items).toHaveLength(2)
    expect(items[0]?.descripcion).toContain('Aceite girasol')
    expect(items[0]?.cantidad).toBe(24)
    expect(items[0]?.precioUnitario).toBe(1250)
    expect(items[0]?.subtotal).toBe(30000)
    expect(items[0]?.articuloId).toBeNull()
  })

  it('returns empty when no line pattern matches', () => {
    const items = parseDocumentoCompraLineItemsFromText('Factura sin detalle', 0.8)
    expect(items).toHaveLength(0)
  })
})
