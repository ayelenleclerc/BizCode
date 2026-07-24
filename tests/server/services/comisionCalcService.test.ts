import { describe, expect, it } from 'vitest'
import {
  computeComision,
  selectConfigForEvent,
} from '../../../apps/server/services/ComisionCalcService'

describe('ComisionCalc helpers (#237)', () => {
  it('computes percentage and fixed amount', () => {
    expect(computeComision('porcentaje_cobrado', 3, 1000)).toBe(30)
    expect(computeComision('porcentaje_facturado', 2.5, 200)).toBe(5)
    expect(computeComision('importe_fijo_por_venta', 50, 999)).toBe(50)
  })

  it('selects most specific vigente config (cliente > categoria > generic)', () => {
    const at = new Date('2026-07-15T00:00:00.000Z')
    const configs = [
      {
        id: 1,
        tipo: 'porcentaje_cobrado' as const,
        alicuota: 2,
        vigenciaDesde: '2026-01-01T00:00:00.000Z',
        vigenciaHasta: null,
        articuloCategoriaId: null,
        clienteId: null,
      },
      {
        id: 2,
        tipo: 'porcentaje_cobrado' as const,
        alicuota: 4,
        vigenciaDesde: '2026-01-01T00:00:00.000Z',
        vigenciaHasta: null,
        articuloCategoriaId: 9,
        clienteId: null,
      },
      {
        id: 3,
        tipo: 'porcentaje_cobrado' as const,
        alicuota: 5,
        vigenciaDesde: '2026-01-01T00:00:00.000Z',
        vigenciaHasta: null,
        articuloCategoriaId: null,
        clienteId: 44,
      },
    ]
    expect(selectConfigForEvent(configs, at, 44, [9])?.id).toBe(3)
    expect(selectConfigForEvent(configs, at, 1, [9])?.id).toBe(2)
    expect(selectConfigForEvent(configs, at, 1, [])?.id).toBe(1)
  })

  it('ignores configs outside vigencia', () => {
    const at = new Date('2026-07-15T00:00:00.000Z')
    const configs = [
      {
        id: 1,
        tipo: 'porcentaje_cobrado' as const,
        alicuota: 2,
        vigenciaDesde: '2026-01-01T00:00:00.000Z',
        vigenciaHasta: '2026-06-30T00:00:00.000Z',
        articuloCategoriaId: null,
        clienteId: null,
      },
    ]
    expect(selectConfigForEvent(configs, at, null, [])).toBeNull()
  })
})
