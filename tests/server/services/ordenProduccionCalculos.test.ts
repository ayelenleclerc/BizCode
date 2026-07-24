import { describe, expect, it } from 'vitest'
import type { OrdenProduccionRow } from '@bizcode/types'
import {
  calcularCostoProduccion,
  calcularDisponibilidad,
  resolverConsumos,
  stockUnitsForConsumption,
  stockUnitsForProduction,
} from '../../../apps/server/services/OrdenProduccionService'

function buildOrden(): OrdenProduccionRow {
  return {
    id: 5,
    tenantId: 1,
    numero: 1,
    articuloId: 100,
    formulaId: 10,
    depositoId: 3,
    cantidadPlanif: 500,
    cantidadReal: null,
    estado: 'planificada',
    fechaPlanif: '2026-07-24T12:00:00.000Z',
    fechaInicio: null,
    fechaFin: null,
    costoTotal: null,
    operadorId: null,
    observaciones: null,
    createdAt: '2026-07-24T12:00:00.000Z',
    updatedAt: '2026-07-24T12:00:00.000Z',
    articulo: { id: 100, codigo: 100, descripcion: 'Producto', costo: 0, precioLista1: 120 },
    deposito: { id: 3, codigo: 'CEN', nombre: 'Central' },
    formula: { id: 10, version: 1, rendimiento: 12 },
    insumos: [
      {
        id: 1,
        ordenId: 5,
        articuloId: 200,
        cantidadPlan: 250,
        cantidadReal: null,
        unidad: 'kg',
        costo: null,
        esOpcional: false,
        linea: 0,
        articulo: {
          id: 200,
          codigo: 200,
          descripcion: 'Harina',
          costo: 1800,
          umedida: 'kg',
          tipo: 'articulo',
        },
      },
      {
        id: 2,
        ordenId: 5,
        articuloId: 201,
        cantidadPlan: 4,
        cantidadReal: null,
        unidad: 'hora',
        costo: null,
        esOpcional: false,
        linea: 1,
        articulo: {
          id: 201,
          codigo: 201,
          descripcion: 'Mano de obra',
          costo: 5000,
          umedida: 'hora',
          tipo: 'servicio',
        },
      },
      {
        id: 3,
        ordenId: 5,
        articuloId: 202,
        cantidadPlan: 2,
        cantidadReal: null,
        unidad: 'kg',
        costo: null,
        esOpcional: true,
        linea: 2,
        articulo: {
          id: 202,
          codigo: 202,
          descripcion: 'Semillas',
          costo: 900,
          umedida: 'kg',
          tipo: 'articulo',
        },
      },
    ],
  }
}

describe('OrdenProduccion stock rounding (#249)', () => {
  it('rounds consumption up and production down to integer stock units', () => {
    expect(stockUnitsForConsumption(250.2)).toBe(251)
    expect(stockUnitsForConsumption(250)).toBe(250)
    expect(stockUnitsForProduction(499.9)).toBe(499)
    expect(stockUnitsForProduction(500)).toBe(500)
  })
})

describe('calcularDisponibilidad (#249)', () => {
  it('flags shortfalls using physical stock minus active reservations', () => {
    const result = calcularDisponibilidad(buildOrden(), [
      { articuloId: 200, fisico: 300, reservado: 65 },
      { articuloId: 201, fisico: 0, reservado: 0 },
      { articuloId: 202, fisico: 5, reservado: 0 },
    ])

    expect(result.suficiente).toBe(false)
    const harina = result.lineas.find((linea) => linea.articuloId === 200)
    expect(harina).toMatchObject({ necesario: 250, disponible: 235, faltante: 15, mueveStock: true })
  })

  it('ignores service lines and optional lines when deciding sufficiency', () => {
    const result = calcularDisponibilidad(buildOrden(), [
      { articuloId: 200, fisico: 250, reservado: 0 },
      { articuloId: 201, fisico: 0, reservado: 0 },
      { articuloId: 202, fisico: 0, reservado: 0 },
    ])

    expect(result.suficiente).toBe(true)
    expect(result.lineas.find((linea) => linea.articuloId === 201)).toMatchObject({
      mueveStock: false,
      faltante: 0,
    })
    expect(result.lineas.find((linea) => linea.articuloId === 202)).toMatchObject({
      esOpcional: true,
      faltante: 2,
    })
  })
})

describe('resolverConsumos and calcularCostoProduccion (#249)', () => {
  it('defaults mandatory lines to plan and optional lines to zero', () => {
    const consumos = resolverConsumos(buildOrden(), { cantidadReal: 500 })

    expect(consumos.map((linea) => linea.cantidadReal)).toEqual([250, 4, 0])
  })

  it('applies explicit overrides including waste above plan', () => {
    const consumos = resolverConsumos(buildOrden(), {
      cantidadReal: 480,
      insumos: [
        { articuloId: 200, cantidadReal: 260 },
        { articuloId: 202, cantidadReal: 1.5 },
      ],
    })

    expect(consumos.find((linea) => linea.articuloId === 200)?.cantidadReal).toBe(260)
    expect(consumos.find((linea) => linea.articuloId === 202)?.cantidadReal).toBe(1.5)
    expect(calcularCostoProduccion(consumos)).toBe(260 * 1800 + 4 * 5000 + 1.5 * 900)
  })
})
