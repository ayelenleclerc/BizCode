import { describe, expect, it } from 'vitest'
import { isSupportedFcemTipoCbte, mockRequestFcemCae } from '../../../apps/server/fiscal/ar/arcaWsfecmMock'

describe('arcaWsfecmMock', () => {
  it('issues synthetic CAE for tipo 201', () => {
    const result = mockRequestFcemCae(42, 600_000, 201)
    expect(result.fcemTipoCbte).toBe(201)
    expect(result.cae).toMatch(/^\d{14}$/)
    expect(result.caeVto.getTime()).toBeGreaterThan(Date.now())
  })

  it('rejects unsupported tipo', () => {
    expect(() => mockRequestFcemCae(1, 100, 1)).toThrow('MOCK_WSFECM_UNSUPPORTED_TIPO')
  })

  it('rejects negative total', () => {
    expect(() => mockRequestFcemCae(1, -1, 201)).toThrow('MOCK_WSFECM_REJECT')
  })

  it('reports supported tipos', () => {
    expect(isSupportedFcemTipoCbte(201)).toBe(true)
    expect(isSupportedFcemTipoCbte(999)).toBe(false)
  })
})
