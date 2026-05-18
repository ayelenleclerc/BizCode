import { describe, expect, it } from 'vitest'
import { dbfRowToRawRubro } from '@/lib/migration/legacyRubroDbf'

describe('dbfRowToRawRubro', () => {
  it('maps COD_RUBRO and trims NOMBRE to 20 chars', () => {
    const raw = dbfRowToRawRubro({
      COD_RUBRO: 5,
      NOMBRE: '  Ferretería general  ',
    })
    expect(raw).toEqual({
      codigo: 5,
      nombre: 'Ferretería general',
    })
  })

  it('truncates long NOMBRE', () => {
    const raw = dbfRowToRawRubro({
      COD_RUBRO: 1,
      NOMBRE: 'x'.repeat(30),
    })
    expect(raw.nombre).toHaveLength(20)
  })
})
