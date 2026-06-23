import { describe, expect, it } from 'vitest'
import {
  buildSicoreLine,
  buildSicoreRetencionesExport,
  parseSicoreLine,
  SICORE_FIELD_LENGTHS,
  type SicoreRetencionExportRow,
} from '../../../../apps/server/fiscal/ar/sicoreRetencionesExport'

const ROWS: SicoreRetencionExportRow[] = [
  {
    fecha: new Date(2026, 5, 10),
    cuitRetenido: '30712345674',
    denominacion: 'Proveedor Alfa SA',
    regimenTipo: 'ganancias',
    regimenNombre: 'Retencion Ganancias',
    operacionTipo: 'retencion',
    baseImponible: 10000,
    importe: 350,
  },
  {
    fecha: new Date(2026, 5, 15),
    cuitRetenido: '20123456786',
    denominacion: 'Cliente Beta SRL',
    regimenTipo: 'iva',
    regimenNombre: 'Percepcion IVA',
    operacionTipo: 'percepcion',
    baseImponible: 5000.5,
    importe: 150.25,
  },
  {
    fecha: new Date(2026, 5, 20),
    cuitRetenido: '27123456780',
    denominacion: 'Operacion Cero',
    regimenTipo: 'ganancias',
    operacionTipo: 'retencion',
    baseImponible: 100,
    importe: 0,
  },
]

describe('buildSicoreRetencionesExport', () => {
  it('produces two lines when one row has zero importe', () => {
    const txt = buildSicoreRetencionesExport(ROWS)
    expect(txt.split('\n')).toHaveLength(2)
  })

  it('validates field-by-field for three operations (excluding zero)', () => {
    const lines = buildSicoreRetencionesExport(ROWS).split('\n')
    expect(lines).toHaveLength(2)

    const line1 = parseSicoreLine(lines[0])
    expect(line1.impuesto).toBe('217')
    expect(line1.regimen).toBe('217')
    expect(line1.operacion).toBe('R')
    expect(line1.fecha).toBe('10062026')
    expect(line1.cuit).toBe('30712345674')
    expect(line1.denominacion).toBe('PROVEEDOR ALFA SA'.padEnd(30, ' '))
    expect(line1.base).toBe('000000010000.00')
    expect(line1.importe).toBe('000000000350.00')

    const line2 = parseSicoreLine(lines[1])
    expect(line2.impuesto).toBe('767')
    expect(line2.regimen).toBe('767')
    expect(line2.operacion).toBe('P')
    expect(line2.fecha).toBe('15062026')
    expect(line2.cuit).toBe('20123456786')
    expect(line2.base).toBe('000000005000.50')
    expect(line2.importe).toBe('000000000150.25')
  })

  it('each line matches total fixed width', () => {
    for (const row of ROWS.filter((r) => r.importe !== 0)) {
      const line = buildSicoreLine(row)
      const expectedWidth = SICORE_FIELD_LENGTHS.reduce((a, b) => a + b, 0)
      expect(line.length).toBe(expectedWidth)
    }
  })
})
