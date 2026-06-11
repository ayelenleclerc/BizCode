import { describe, expect, it } from 'vitest'
import {
  buildSifereLine,
  buildSifereRetencionesExport,
  parseSifereLine,
  SIFERE_FIELD_LENGTHS,
  type SifereRetencionExportRow,
} from '../../../../server/fiscal/ar/sifereRetencionesExport'

const ROWS: SifereRetencionExportRow[] = [
  {
    fecha: new Date(2026, 4, 5),
    cuitRetenido: '30712345674',
    provincia: 'CABA',
    baseImponible: 8000,
    alicuota: 3.5,
    importe: 280,
  },
  {
    fecha: new Date(2026, 4, 12),
    cuitRetenido: '20123456786',
    provincia: 'Buenos Aires',
    baseImponible: 12000,
    alicuota: 2.5,
    importe: 300,
  },
  {
    fecha: new Date(2026, 4, 18),
    cuitRetenido: '27123456780',
    provincia: 'CABA',
    baseImponible: 500,
    alicuota: 1,
    importe: 0,
  },
]

describe('buildSifereRetencionesExport', () => {
  it('produces two lines excluding zero importe', () => {
    const txt = buildSifereRetencionesExport(ROWS)
    expect(txt.split('\n')).toHaveLength(2)
  })

  it('validates field-by-field for CABA and PBA', () => {
    const lines = buildSifereRetencionesExport(ROWS).split('\n')
    const caba = parseSifereLine(lines[0])
    expect(caba.provincia).toBe('902')
    expect(caba.cuit).toBe('30712345674')
    expect(caba.fecha).toBe('05052026')
    expect(caba.base).toBe('000000008000.00')
    expect(caba.alicuota).toBe('003.5000')
    expect(caba.importe).toBe('000000000280.00')

    const pba = parseSifereLine(lines[1])
    expect(pba.provincia).toBe('901')
    expect(pba.cuit).toBe('20123456786')
    expect(pba.fecha).toBe('12052026')
    expect(pba.base).toBe('000000012000.00')
    expect(pba.importe).toBe('000000000300.00')
  })

  it('each line matches total fixed width', () => {
    for (const row of ROWS.filter((r) => r.importe !== 0)) {
      const line = buildSifereLine(row)
      const expectedWidth = SIFERE_FIELD_LENGTHS.reduce((a, b) => a + b, 0)
      expect(line.length).toBe(expectedWidth)
    }
  })
})
