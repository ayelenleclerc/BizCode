import { describe, expect, it } from 'vitest'
import { daysSince, prefillToCartLines } from './repeatLines'
import type { PedidoPrefill } from '@bizcode/types'

describe('repeatLines (#253)', () => {
  it('maps prefill lines to cart lines', () => {
    const prefill: PedidoPrefill = {
      source: 'last_pedido',
      pedidoId: 9,
      plantillaId: null,
      total: '200.00',
      createdAt: '2026-08-01T00:00:00.000Z',
      lines: [
        {
          articuloId: 10,
          descripcion: 'Leche',
          precio: 100,
          stock: 50,
          cantidad: 2,
          condIva: '1',
        },
      ],
      omitted: [{ articuloId: 11, descripcion: 'Azucar', reason: 'inactive' }],
      omittedCount: 1,
    }
    expect(prefillToCartLines(prefill)).toEqual([
      {
        articuloId: 10,
        descripcion: 'Leche',
        precio: 100,
        stock: 50,
        cantidad: 2,
        dscto: 0,
        condIva: '1',
      },
    ])
  })

  it('computes whole days since ISO', () => {
    const now = new Date('2026-08-12T12:00:00.000Z')
    expect(daysSince('2026-08-01T12:00:00.000Z', now)).toBe(11)
    expect(daysSince('not-a-date', now)).toBe(0)
  })
})
