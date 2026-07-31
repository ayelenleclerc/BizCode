import { describe, expect, it } from 'vitest'
import {
  amountWithinMpNetBand,
  amountWithinTolerance,
  daysBetween,
  findMatches,
  isLikelyBankFee,
  isMercadoPagoMovement,
  scoreCandidate,
  type MatchCandidate,
  type MovementLike,
} from '../../../../apps/server/services/bancos/matchEngine'

function candidate(overrides: Partial<MatchCandidate> = {}): MatchCandidate {
  return {
    tipo: 'recibo_forma',
    id: 1,
    clienteId: 10,
    fecha: new Date('2026-07-10T00:00:00.000Z'),
    importe: 1000,
    referencia: null,
    banco: null,
    chequeVencimiento: null,
    isMercadoPago: false,
    clienteCbu: null,
    clienteAlias: null,
    ...overrides,
  }
}

function movement(overrides: Partial<MovementLike> = {}): MovementLike {
  return {
    id: 1,
    fecha: new Date('2026-07-10T00:00:00.000Z'),
    descripcion: 'TRANSFERENCIA RECIBIDA',
    importe: 1000,
    tipo: 'credito',
    referencia: null,
    ...overrides,
  }
}

describe('amountWithinTolerance (#191)', () => {
  it('accepts amounts within the configured percentage', () => {
    expect(amountWithinTolerance(1000, 1004, 0.5)).toBe(true)
    expect(amountWithinTolerance(1000, 1004.9, 0.5)).toBe(true)
  })

  it('rejects amounts beyond the configured percentage', () => {
    expect(amountWithinTolerance(1000, 1010, 0.5)).toBe(false)
  })

  it('applies a rounding floor for tiny amounts', () => {
    expect(amountWithinTolerance(0.5, 0.505, 0.5)).toBe(true)
  })
})

describe('amountWithinMpNetBand (#191)', () => {
  it('accepts a bank net within the MP fee band', () => {
    // 5% fee on 1000 => net 950
    expect(amountWithinMpNetBand(1000, 950)).toBe(true)
  })

  it('accepts the band edges (3.99% and 6.99%)', () => {
    expect(amountWithinMpNetBand(1000, 960.1)).toBe(true)
    expect(amountWithinMpNetBand(1000, 930.1)).toBe(true)
  })

  it('rejects a net outside the fee band', () => {
    expect(amountWithinMpNetBand(1000, 800)).toBe(false)
    expect(amountWithinMpNetBand(1000, 999)).toBe(false)
  })

  it('rejects non-positive gross amounts', () => {
    expect(amountWithinMpNetBand(0, 0)).toBe(false)
    expect(amountWithinMpNetBand(-100, -95)).toBe(false)
  })
})

describe('isLikelyBankFee (#191)', () => {
  it('flags common Argentine bank fee wording on debit movements', () => {
    expect(isLikelyBankFee('COMISION MANTENIMIENTO DE CUENTA', 'debito')).toBe(true)
    expect(isLikelyBankFee('IMPUESTO LEY 25413', 'debito')).toBe(true)
    expect(isLikelyBankFee('PERCEPCION IIBB', 'debito')).toBe(true)
  })

  it('does not flag credit movements even with fee-like wording', () => {
    expect(isLikelyBankFee('COMISION MANTENIMIENTO', 'credito')).toBe(false)
  })

  it('does not flag unrelated debit movements', () => {
    expect(isLikelyBankFee('PAGO A PROVEEDOR SA', 'debito')).toBe(false)
  })
})

describe('isMercadoPagoMovement (#191)', () => {
  it('detects Mercado Pago wording case-insensitively', () => {
    expect(isMercadoPagoMovement('PAGO MERCADOPAGO SA')).toBe(true)
    expect(isMercadoPagoMovement('mercadopago liquidacion')).toBe(true)
    expect(isMercadoPagoMovement('TRANSFERENCIA BANCO GALICIA')).toBe(false)
  })
})

describe('daysBetween (#191)', () => {
  it('computes absolute calendar day differences ignoring time-of-day', () => {
    expect(daysBetween(new Date('2026-07-10T23:00:00.000Z'), new Date('2026-07-10T01:00:00.000Z'))).toBe(0)
    expect(daysBetween(new Date('2026-07-10T00:00:00.000Z'), new Date('2026-07-13T00:00:00.000Z'))).toBe(3)
    expect(daysBetween(new Date('2026-07-13T00:00:00.000Z'), new Date('2026-07-10T00:00:00.000Z'))).toBe(3)
  })
})

describe('scoreCandidate (#191)', () => {
  it('returns 0 when amount is outside tolerance', () => {
    const score = scoreCandidate(movement({ importe: 1000 }), candidate({ importe: 1100 }))
    expect(score).toBe(0)
  })

  it('returns 0 when date is outside tolerance window', () => {
    const score = scoreCandidate(
      movement({ fecha: new Date('2026-07-20T00:00:00.000Z') }),
      candidate({ fecha: new Date('2026-07-10T00:00:00.000Z') }),
    )
    expect(score).toBe(0)
  })

  it('scores higher for exact same-day amount match than a match 3 days apart', () => {
    const exact = scoreCandidate(movement(), candidate())
    const distant = scoreCandidate(
      movement({ fecha: new Date('2026-07-13T00:00:00.000Z') }),
      candidate({ fecha: new Date('2026-07-10T00:00:00.000Z') }),
    )
    expect(exact).toBeGreaterThan(distant)
  })

  it('boosts score when client CBU appears in the movement description', () => {
    const withoutCbu = scoreCandidate(movement(), candidate())
    const withCbu = scoreCandidate(
      movement({ descripcion: 'TRANSFERENCIA DE 0110599520000012345678 RECIBIDA' }),
      candidate({ clienteCbu: '0110599520000012345678' }),
    )
    expect(withCbu).toBeGreaterThan(withoutCbu)
  })

  it('boosts score when client alias appears in the movement referencia', () => {
    const withAlias = scoreCandidate(
      movement({ referencia: 'juan.perez.mp' }),
      candidate({ clienteAlias: 'juan.perez.mp' }),
    )
    const withoutAlias = scoreCandidate(movement(), candidate())
    expect(withAlias).toBeGreaterThan(withoutAlias)
  })

  it('scores a cheque candidate using the cheque due-date window instead of emission date', () => {
    const score = scoreCandidate(
      movement({ fecha: new Date('2026-08-01T00:00:00.000Z') }),
      candidate({
        fecha: new Date('2026-06-01T00:00:00.000Z'),
        chequeVencimiento: new Date('2026-08-02T00:00:00.000Z'),
      }),
    )
    expect(score).toBeGreaterThan(0)
  })

  it('rejects a cheque candidate outside the tighter cheque tolerance window', () => {
    const score = scoreCandidate(
      movement({ fecha: new Date('2026-08-05T00:00:00.000Z') }),
      candidate({
        fecha: new Date('2026-06-01T00:00:00.000Z'),
        chequeVencimiento: new Date('2026-08-01T00:00:00.000Z'),
      }),
    )
    expect(score).toBe(0)
  })

  it('scores Mercado Pago candidates using the net fee band, not raw amount tolerance', () => {
    const score = scoreCandidate(
      movement({ importe: 950, descripcion: 'ACREDITAMIENTO MERCADOPAGO' }),
      candidate({ importe: 1000, isMercadoPago: true }),
    )
    expect(score).toBeGreaterThan(0)
  })

  it('prioritizes recibo_forma over cobro on otherwise identical candidates', () => {
    const forma = scoreCandidate(movement(), candidate({ tipo: 'recibo_forma' }))
    const cobro = scoreCandidate(movement(), candidate({ tipo: 'cobro' }))
    expect(forma).toBeGreaterThan(cobro)
  })
})

describe('findMatches (#191)', () => {
  it('routes bank-fee-looking debit movements to bank_fee without inspecting candidates', () => {
    const result = findMatches(
      movement({ tipo: 'debito', descripcion: 'COMISION MANTENIMIENTO DE CUENTA', importe: -500 }),
      [candidate({ importe: -500 })],
      new Set(),
    )
    expect(result.status).toBe('bank_fee')
    expect(result.winners).toHaveLength(0)
  })

  it('returns none for unrelated debit movements', () => {
    const result = findMatches(
      movement({ tipo: 'debito', descripcion: 'PAGO PROVEEDOR', importe: -500 }),
      [candidate({ importe: -500 })],
      new Set(),
    )
    expect(result.status).toBe('none')
  })

  it('auto-matches a unique high-confidence candidate', () => {
    const result = findMatches(
      movement(),
      [
        candidate({ id: 1, importe: 1000, fecha: new Date('2026-07-10T00:00:00.000Z') }),
        candidate({ id: 2, importe: 5000, fecha: new Date('2026-01-01T00:00:00.000Z') }),
      ],
      new Set(),
    )
    expect(result.status).toBe('auto')
    expect(result.winners).toHaveLength(1)
    expect(result.winners[0]?.id).toBe(1)
  })

  it('suggests when multiple candidates score closely', () => {
    const result = findMatches(
      movement(),
      [
        candidate({ id: 1, tipo: 'recibo_forma', importe: 1000, fecha: new Date('2026-07-10T00:00:00.000Z') }),
        candidate({ id: 2, tipo: 'cobro', importe: 1000, fecha: new Date('2026-07-10T00:00:00.000Z') }),
      ],
      new Set(),
    )
    expect(result.status).toBe('suggested')
    expect(result.winners.length).toBeGreaterThanOrEqual(2)
  })

  it('returns none when no candidate passes the hard filters', () => {
    const result = findMatches(
      movement(),
      [candidate({ importe: 50 }), candidate({ id: 2, fecha: new Date('2026-01-01T00:00:00.000Z') })],
      new Set(),
    )
    expect(result.status).toBe('none')
  })

  it('excludes candidates already present in usedIds', () => {
    const result = findMatches(
      movement(),
      [candidate({ id: 1, importe: 1000, fecha: new Date('2026-07-10T00:00:00.000Z') })],
      new Set(['recibo_forma:1']),
    )
    expect(result.status).toBe('none')
  })
})
