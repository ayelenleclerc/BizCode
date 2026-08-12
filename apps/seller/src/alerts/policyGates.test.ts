import { describe, expect, it } from 'vitest'
import { capQtyToStock, isCreditBlocked, isStockZeroBlocked } from './policyGates'
import type { SellerCartLine } from '../pedidos/cartTypes'

describe('policyGates (#256)', () => {
  it('blocks credit by nivel + action', () => {
    const policies = {
      sellerCreditOverLimitAction: 'block' as const,
      sellerCreditOverdueAction: 'warn' as const,
    }
    expect(isCreditBlocked('rojo', policies)).toBe(true)
    expect(isCreditBlocked('naranja', policies)).toBe(false)
    expect(isCreditBlocked('amarillo', policies)).toBe(false)
    expect(isCreditBlocked('naranja', { ...policies, sellerCreditOverdueAction: 'block' })).toBe(true)
  })

  it('caps qty and detects zero-stock block', () => {
    expect(capQtyToStock(5, 3, true)).toBe(3)
    expect(capQtyToStock(5, 3, false)).toBe(5)
    expect(capQtyToStock(2, 0, true)).toBe(0)
    const lines: SellerCartLine[] = [
      {
        articuloId: 1,
        descripcion: 'A',
        precio: 1,
        stock: 0,
        cantidad: 1,
        dscto: 0,
        condIva: '1',
      },
    ]
    expect(isStockZeroBlocked(lines, 'block')).toBe(true)
    expect(isStockZeroBlocked(lines, 'warn')).toBe(false)
  })
})
