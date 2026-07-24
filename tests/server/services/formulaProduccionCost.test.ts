import { describe, expect, it } from 'vitest'
import {
  calcularCostoFormula,
  proyectarInsumos,
} from '../../../apps/server/services/FormulaProduccionService'
import type { FormulaProduccionRow } from '@bizcode/types'

const sampleFormula: FormulaProduccionRow = {
  id: 1,
  tenantId: 1,
  articuloId: 10,
  rendimiento: 12,
  unidadRendimiento: 'unidad',
  version: 1,
  activa: true,
  observaciones: null,
  createdAt: '2026-07-24T00:00:00.000Z',
  updatedAt: '2026-07-24T00:00:00.000Z',
  articulo: {
    id: 10,
    codigo: 100,
    descripcion: 'Facturas x12',
    costo: 0,
    precioLista1: 474.25,
  },
  insumos: [
    {
      id: 1,
      formulaId: 1,
      articuloId: 2,
      cantidad: 0.5,
      unidad: 'kg',
      esOpcional: false,
      orden: 0,
      articulo: {
        id: 2,
        codigo: 2,
        descripcion: 'Harina',
        costo: 1800,
        umedida: 'kg',
        tipo: 'articulo',
      },
    },
    {
      id: 2,
      formulaId: 1,
      articuloId: 3,
      cantidad: 0.2,
      unidad: 'kg',
      esOpcional: false,
      orden: 1,
      articulo: {
        id: 3,
        codigo: 3,
        descripcion: 'Manteca',
        costo: 4500,
        umedida: 'kg',
        tipo: 'articulo',
      },
    },
  ],
}

describe('calcularCostoFormula (#248)', () => {
  it('computes unit cost and margin from Articulo.costo', () => {
    const result = calcularCostoFormula(sampleFormula)
    expect(result.costoInsumos).toBe(1800)
    expect(result.costoUnitario).toBe(150)
    expect(result.precioVenta).toBe(474.25)
    expect(result.margenAbsoluto).toBe(324.25)
    expect(result.margenPorcentaje).toBe(68.37)
    expect(result.lineas).toHaveLength(2)
  })
})

describe('proyectarInsumos (#248)', () => {
  it('scales inputs for N finished units', () => {
    const result = proyectarInsumos(sampleFormula, 1200)
    expect(result.corridas).toBe(100)
    expect(result.lineas[0]?.cantidad).toBe(50)
    expect(result.lineas[1]?.cantidad).toBe(20)
  })
})
