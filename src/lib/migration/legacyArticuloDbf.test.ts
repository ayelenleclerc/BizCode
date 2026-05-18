import { describe, expect, it } from 'vitest'
import {
  dbfRowToRawArticulo,
  mapLegacyArticuloCondIva,
} from '@/lib/migration/legacyArticuloDbf'

describe('mapLegacyArticuloCondIva', () => {
  it.each([
    [1, '1'],
    [2, '2'],
    [3, '3'],
    ['2', '2'],
  ] as const)('maps %s to %s', (legacy, expected) => {
    expect(mapLegacyArticuloCondIva(legacy)).toBe(expected)
  })

  it('returns null for invalid COND_IVA', () => {
    expect(mapLegacyArticuloCondIva(9)).toBeNull()
    expect(mapLegacyArticuloCondIva('')).toBeNull()
  })
})

describe('dbfRowToRawArticulo', () => {
  it('maps core fields and defaults null stock to 0', () => {
    const raw = dbfRowToRawArticulo({
      COD_ART: 100,
      DESCRIP: '  Tornillo M8  ',
      COD_RUBRO: 2,
      COND_IVA: 1,
      UMEDIDA: ' UN ',
      PRECIO1: 150.5,
      PRECIO2: 140,
      COSTO: 90,
      STOCK: null,
      STOCK_MIN: 3,
      ACTIVO: 'T',
    })

    expect(raw).toMatchObject({
      codigo: 100,
      descripcion: 'Tornillo M8',
      rubroCodigo: 2,
      condIva: '1',
      umedida: 'UN',
      precioLista1: 150.5,
      precioLista2: 140,
      costo: 90,
      stock: 0,
      minimo: 3,
      activo: true,
    })
  })

  it('truncates DESCRIP to 30 characters', () => {
    const raw = dbfRowToRawArticulo({
      COD_ART: 1,
      DESCRIP: 'a'.repeat(40),
      COD_RUBRO: 1,
      COND_IVA: 2,
      UMEDIDA: 'UN',
      PRECIO1: 10,
      PRECIO2: 10,
      COSTO: 5,
      STOCK: 4,
      STOCK_MIN: 0,
      ACTIVO: false,
    })
    expect(raw.descripcion).toHaveLength(30)
    expect(raw.activo).toBe(false)
  })
})
