import { describe, expect, it } from 'vitest'
import {
  buildPresentacionOsCsv,
  computeOsSale,
  coveragePctForTipo,
  isPeriodoYm,
} from '../../apps/server/services/obraSocialMath'
import type { OsTipoProducto } from '@bizcode/types'

describe('obraSocialMath (#252)', () => {
  it('computes 70% coverage copay split', () => {
    const map = new Map<OsTipoProducto, number>([['generico', 70]])
    const result = computeOsSale(
      [
        {
          descripcion: 'Ibuprofeno',
          tipoProducto: 'generico',
          cantidad: 1,
          precioUnitario: 10000,
        },
      ],
      map,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.totalVenta).toBe(10000)
    expect(result.data.creditoOS).toBe(7000)
    expect(result.data.copagoPaciente).toBe(3000)
  })

  it('rejects empty items', () => {
    const result = computeOsSale([], new Map())
    expect(result.ok).toBe(false)
  })

  it('defaults missing coverage to 0%', () => {
    expect(coveragePctForTipo(new Map(), 'marca')).toBe(0)
  })

  it('validates YYYY-MM periods', () => {
    expect(isPeriodoYm('2026-05')).toBe(true)
    expect(isPeriodoYm('2026-13')).toBe(false)
  })

  it('builds CSV with header', () => {
    const csv = buildPresentacionOsCsv([
      {
        ventaId: 1,
        fecha: '2026-05-01',
        nroAfiliado: 'A-1',
        nroReceta: 'R-1',
        totalVenta: 100,
        creditoOS: 70,
        copagoPaciente: 30,
      },
    ])
    expect(csv.split('\n')[0]).toContain('ventaId')
    expect(csv).toContain('A-1')
  })
})
