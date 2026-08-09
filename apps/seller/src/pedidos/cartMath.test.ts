import { describe, expect, it } from 'vitest'
import {
  availableCredit,
  buildPedidoBody,
  cartTotal,
  hasStockWarnings,
  lineSubtotal,
} from './cartMath'
import type { SellerCartLine } from './cartTypes'

const baseLine = (over: Partial<SellerCartLine> = {}): SellerCartLine => ({
  articuloId: 1,
  descripcion: 'Cafe',
  precio: 100,
  stock: 10,
  cantidad: 2,
  dscto: 0,
  condIva: '1',
  ...over,
})

describe('cartMath', () => {
  it('computes line subtotal with discount', () => {
    expect(lineSubtotal(baseLine({ cantidad: 2, precio: 100, dscto: 10 }))).toBe(180)
  })

  it('sums cart total', () => {
    expect(cartTotal([baseLine(), baseLine({ articuloId: 2, cantidad: 1, precio: 50 })])).toBe(250)
  })

  it('detects stock warnings', () => {
    expect(hasStockWarnings([baseLine({ cantidad: 5, stock: 10 })])).toBe(false)
    expect(hasStockWarnings([baseLine({ cantidad: 11, stock: 10 })])).toBe(true)
  })

  it('computes available credit', () => {
    expect(availableCredit(200, 1000)).toBe(800)
    expect(availableCredit(null, 1000)).toBeNull()
  })

  it('builds pedido body with plazo', () => {
    const body = buildPedidoBody({
      clienteId: 7,
      lines: [baseLine()],
      observaciones: 'Fondo',
      condicionCobro: 'plazo',
      plazoDias: 15,
    })
    expect(body.clienteId).toBe(7)
    expect(body.observaciones).toBe('Fondo')
    expect(body.condicionCobro).toBe('plazo')
    expect(body.plazoDias).toBe(15)
    expect(body.items).toHaveLength(1)
    expect(body.items[0]?.subtotal).toBe(200)
  })
})
