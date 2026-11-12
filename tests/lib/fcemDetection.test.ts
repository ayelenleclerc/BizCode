/**
 * @en Unit tests for FCEM MiPyME pure detection (#239).
 * @es Tests unitarios de detección pura FCEM MiPyME (#239).
 * @pt-BR Testes unitários da detecção pura FCEM MiPyME (#239).
 */

import { describe, expect, it } from 'vitest'
import {
  evaluateFcemRequirement,
  FCEM_DEFAULT_UMBRAL_ARS,
  FCEM_TIPO_CBTE_BY_LETTER,
} from '@bizcode/types'

const base = {
  esMipyme: true,
  clienteCondIva: 'RI',
  facturaTipo: 'A',
  facturaTotal: FCEM_DEFAULT_UMBRAL_ARS,
  plazoPagoDias: 31,
  umbralMonto: null as number | null,
}

describe('evaluateFcemRequirement', () => {
  it('requires FCEM when all local rules match', () => {
    const result = evaluateFcemRequirement(base)
    expect(result.required).toBe(true)
    expect(result.reasons).toEqual([])
    expect(result.fcemTipoCbte).toBe(FCEM_TIPO_CBTE_BY_LETTER.A)
    expect(result.umbralAplicado).toBe(FCEM_DEFAULT_UMBRAL_ARS)
  })

  it('maps letter B/C to AFIP FCEM codes', () => {
    expect(evaluateFcemRequirement({ ...base, facturaTipo: 'B' }).fcemTipoCbte).toBe(206)
    expect(evaluateFcemRequirement({ ...base, facturaTipo: 'C' }).fcemTipoCbte).toBe(211)
  })

  it('rejects when issuer is not MiPyME', () => {
    const result = evaluateFcemRequirement({ ...base, esMipyme: false })
    expect(result.required).toBe(false)
    expect(result.reasons).toContain('issuer_not_mipyme')
  })

  it('rejects when buyer is not RI', () => {
    const result = evaluateFcemRequirement({ ...base, clienteCondIva: 'CF' })
    expect(result.required).toBe(false)
    expect(result.reasons).toContain('buyer_not_ri')
  })

  it('rejects below threshold and uses custom umbral', () => {
    const result = evaluateFcemRequirement({
      ...base,
      facturaTotal: 100_000,
      umbralMonto: 200_000,
    })
    expect(result.required).toBe(false)
    expect(result.umbralAplicado).toBe(200_000)
    expect(result.reasons).toContain('below_threshold')
  })

  it('rejects plazo under 31 days', () => {
    const result = evaluateFcemRequirement({ ...base, plazoPagoDias: 30 })
    expect(result.required).toBe(false)
    expect(result.reasons).toContain('plazo_too_short')
  })
})
