/**
 * @en eCheq is not a generic receipt method: it requires `fiscal.cheques` (#440).
 * @es eCheq no es un método genérico de recibo: exige `fiscal.cheques` (#440).
 * @pt-BR eCheq não é um método genérico de recibo: exige `fiscal.cheques` (#440).
 */

import { describe, expect, it } from 'vitest'
import { buildReciboPagoBodySchema } from '../../apps/server/schemas/domain'

const validBase = {
  fecha: '2026-05-01',
  total: 100,
  metodoPago: 'transferencia' as const,
  facturas: [{ facturaRef: 'A-0001-1', monto: 100 }],
}

describe('buildReciboPagoBodySchema (#440)', () => {
  it('rejects echeq when the cheques module is off', () => {
    const parsed = buildReciboPagoBodySchema(false).safeParse({
      ...validBase,
      metodoPago: 'echeq',
    })
    expect(parsed.success).toBe(false)
  })

  it('accepts echeq when the cheques module is on', () => {
    const parsed = buildReciboPagoBodySchema(true).safeParse({
      ...validBase,
      metodoPago: 'echeq',
    })
    expect(parsed.success).toBe(true)
  })

  it('always accepts the generic methods', () => {
    for (const metodoPago of ['transferencia', 'cheque', 'efectivo'] as const) {
      expect(buildReciboPagoBodySchema(false).safeParse({ ...validBase, metodoPago }).success).toBe(
        true,
      )
    }
  })
})
