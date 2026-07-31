/**
 * @en Unit tests for the AFIP Padrón A4 homologación mock and mapper (#192).
 * @es Tests unitarios del mock de homologación y mapper del Padrón A4 AFIP (#192).
 */
import { describe, expect, it } from 'vitest'
import {
  PADRON_MOCK_KNOWN_CUIT,
  PADRON_MOCK_NOT_FOUND_CUIT,
  PADRON_MOCK_TIMEOUT_CUIT,
  mapAfipImpuestoToCondIva,
  mockConsultaPadronA4,
  normalizeCuitDigits,
} from '../../../../apps/server/fiscal/ar/arcaPadronMock'

describe('normalizeCuitDigits (#192)', () => {
  it('strips non-digit characters', () => {
    expect(normalizeCuitDigits('20-11111111-2')).toBe('20111111112')
  })

  it('returns empty string when input has no digits', () => {
    expect(normalizeCuitDigits('abc')).toBe('')
  })
})

describe('mapAfipImpuestoToCondIva (#192)', () => {
  it.each([
    ['MONO', 'Mono'],
    ['monotributo', 'Mono'],
    ['6', 'Mono'],
    ['13', 'Mono'],
    ['CF', 'CF'],
    ['consumidor final', 'CF'],
    ['5', 'CF'],
    ['EXENTO', 'Exento'],
    ['ex', 'Exento'],
    ['4', 'Exento'],
  ] as const)('maps %s to %s', (code, expected) => {
    expect(mapAfipImpuestoToCondIva(code)).toBe(expected)
  })

  it('defaults to RI for unknown or missing codes', () => {
    expect(mapAfipImpuestoToCondIva('unknown-code')).toBe('RI')
    expect(mapAfipImpuestoToCondIva(null)).toBe('RI')
    expect(mapAfipImpuestoToCondIva(undefined)).toBe('RI')
    expect(mapAfipImpuestoToCondIva(1)).toBe('RI')
  })
})

describe('mockConsultaPadronA4 (#192)', () => {
  it('returns ok with full persona data for the known CUIT', () => {
    const result = mockConsultaPadronA4(PADRON_MOCK_KNOWN_CUIT)
    expect(result.status).toBe('ok')
    if (result.status === 'ok') {
      expect(result.persona.cuit).toBe(PADRON_MOCK_KNOWN_CUIT)
      expect(result.persona.condIva).toBe('RI')
      expect(result.persona.estado).toBe('activo')
    }
  })

  it('accepts CUIT with hyphens for the known fixture', () => {
    const result = mockConsultaPadronA4('20-11111111-2')
    expect(result.status).toBe('ok')
  })

  it('returns not_found for the dedicated not-found fixture', () => {
    expect(mockConsultaPadronA4(PADRON_MOCK_NOT_FOUND_CUIT)).toEqual({ status: 'not_found' })
  })

  it('returns not_found for any other unknown valid CUIT', () => {
    expect(mockConsultaPadronA4('20444444445')).toEqual({ status: 'not_found' })
  })

  it('returns timeout for the dedicated timeout fixture', () => {
    expect(mockConsultaPadronA4(PADRON_MOCK_TIMEOUT_CUIT)).toEqual({ status: 'timeout' })
  })

  it('forces timeout via options regardless of CUIT', () => {
    const result = mockConsultaPadronA4(PADRON_MOCK_KNOWN_CUIT, { forceTimeout: true })
    expect(result).toEqual({ status: 'timeout' })
  })

  it('does not leak a reference to the internal fixture object', () => {
    const first = mockConsultaPadronA4(PADRON_MOCK_KNOWN_CUIT)
    const second = mockConsultaPadronA4(PADRON_MOCK_KNOWN_CUIT)
    expect(first).not.toBe(second)
    if (first.status === 'ok' && second.status === 'ok') {
      expect(first.persona).not.toBe(second.persona)
      expect(first.persona).toEqual(second.persona)
    }
  })
})
