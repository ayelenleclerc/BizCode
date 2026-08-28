import { describe, expect, it } from 'vitest'
import type { LibroPsicotropicoMovimientoRow } from '@bizcode/types'
import {
  buildLibroPsicotropicoCsv,
  evaluateDispensacionGate,
  isLibroPsicotropicoTipo,
  libroSignedQuantity,
  normalizeLibroInput,
  normalizeRecetaInput,
  normalizeSerialCapture,
  parsePharmacyDateOnly,
} from '../../apps/server/services/farmaciaDispensingMath'

const validReceta = {
  numeroReceta: ' R-0001 ',
  medicoNombre: ' Dra. Ana Pérez ',
  matricula: ' MN 12345 ',
  fechaReceta: '2026-08-28',
}

describe('parsePharmacyDateOnly', () => {
  it('accepts a well-formed date and normalizes it to UTC midnight', () => {
    const parsed = parsePharmacyDateOnly('2026-08-28')
    expect(parsed?.toISOString()).toBe('2026-08-28T00:00:00.000Z')
  })

  it.each(['28/08/2026', '2026-8-28', '2026-02-30', 'not-a-date', ''])(
    'rejects malformed input %s',
    (value) => {
      expect(parsePharmacyDateOnly(value)).toBeNull()
    },
  )
})

describe('normalizeRecetaInput', () => {
  it('trims fields and defaults optional relations to null', () => {
    const result = normalizeRecetaInput(validReceta)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toMatchObject({
      numeroReceta: 'R-0001',
      medicoNombre: 'Dra. Ana Pérez',
      matricula: 'MN 12345',
      facturaId: null,
      clienteId: null,
      observaciones: null,
    })
    expect(result.data.fechaReceta.toISOString().slice(0, 10)).toBe('2026-08-28')
  })

  it('keeps valid optional relations and observations', () => {
    const result = normalizeRecetaInput({
      ...validReceta,
      facturaId: 7,
      clienteId: 3,
      observaciones: '  Duplicado archivado  ',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toMatchObject({
      facturaId: 7,
      clienteId: 3,
      observaciones: 'Duplicado archivado',
    })
  })

  it.each([
    [{ ...validReceta, numeroReceta: '   ' }, 'numeroReceta is required'],
    [{ ...validReceta, numeroReceta: 'x'.repeat(41) }, 'numeroReceta must be at most 40 characters'],
    [{ ...validReceta, medicoNombre: '' }, 'medicoNombre is required'],
    [
      { ...validReceta, medicoNombre: 'x'.repeat(121) },
      'medicoNombre must be at most 120 characters',
    ],
    [{ ...validReceta, matricula: '' }, 'matricula is required'],
    [{ ...validReceta, matricula: 'x'.repeat(41) }, 'matricula must be at most 40 characters'],
    [{ ...validReceta, fechaReceta: '31/12/2026' }, 'fechaReceta must be a valid YYYY-MM-DD date'],
    [{ ...validReceta, facturaId: 0 }, 'facturaId must be a positive integer'],
    [{ ...validReceta, clienteId: -2 }, 'clienteId must be a positive integer'],
    [
      { ...validReceta, observaciones: 'x'.repeat(501) },
      'observaciones must be at most 500 characters',
    ],
  ])('rejects invalid payload (%#)', (input, error) => {
    const result = normalizeRecetaInput(input)
    expect(result).toMatchObject({ ok: false, status: 400, error })
  })
})

describe('normalizeLibroInput', () => {
  it('normalizes an ingreso entry', () => {
    const result = normalizeLibroInput({
      articuloId: 5,
      tipo: 'ingreso',
      cantidad: 10,
      referencia: ' compra:12 ',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toMatchObject({
      articuloId: 5,
      tipo: 'ingreso',
      cantidad: 10,
      referencia: 'compra:12',
      loteId: null,
      recetaId: null,
      observaciones: null,
    })
  })

  it('allows a negative cantidad only for ajuste', () => {
    expect(normalizeLibroInput({ articuloId: 1, tipo: 'ajuste', cantidad: -3 }).ok).toBe(true)
    expect(normalizeLibroInput({ articuloId: 1, tipo: 'egreso', cantidad: -3 })).toMatchObject({
      ok: false,
      error: 'cantidad must be positive for ingreso and egreso entries',
    })
  })

  it.each([
    [{ articuloId: 0, tipo: 'ingreso' as const, cantidad: 1 }, 'articuloId must be a positive integer'],
    [
      { articuloId: 1, tipo: 'devolucion' as never, cantidad: 1 },
      'tipo must be one of ingreso | egreso | ajuste',
    ],
    [{ articuloId: 1, tipo: 'ingreso' as const, cantidad: 0 }, 'cantidad must be a non-zero finite number'],
    [
      { articuloId: 1, tipo: 'ingreso' as const, cantidad: Number.NaN },
      'cantidad must be a non-zero finite number',
    ],
    [
      { articuloId: 1, tipo: 'ingreso' as const, cantidad: 1, loteId: 0 },
      'loteId must be a positive integer',
    ],
    [
      { articuloId: 1, tipo: 'ingreso' as const, cantidad: 1, recetaId: 1.5 },
      'recetaId must be a positive integer',
    ],
    [
      { articuloId: 1, tipo: 'ingreso' as const, cantidad: 1, referencia: 'x'.repeat(61) },
      'referencia must be at most 60 characters',
    ],
    [
      { articuloId: 1, tipo: 'ingreso' as const, cantidad: 1, observaciones: 'x'.repeat(301) },
      'observaciones must be at most 300 characters',
    ],
  ])('rejects invalid payload (%#)', (input, error) => {
    expect(normalizeLibroInput(input)).toMatchObject({ ok: false, status: 400, error })
  })

  it('narrows known book entry kinds', () => {
    expect(isLibroPsicotropicoTipo('egreso')).toBe(true)
    expect(isLibroPsicotropicoTipo('venta')).toBe(false)
  })
})

describe('libroSignedQuantity', () => {
  it('applies the sign implied by the entry kind', () => {
    expect(libroSignedQuantity('ingreso', 5)).toBe(5)
    expect(libroSignedQuantity('ingreso', -5)).toBe(5)
    expect(libroSignedQuantity('egreso', 5)).toBe(-5)
    expect(libroSignedQuantity('egreso', -5)).toBe(-5)
    expect(libroSignedQuantity('ajuste', -4)).toBe(-4)
    expect(libroSignedQuantity('ajuste', 4)).toBe(4)
  })
})

describe('evaluateDispensacionGate', () => {
  it('allows sales without controlled articles', () => {
    expect(
      evaluateDispensacionGate(
        [
          { articuloId: 1, requiereReceta: false },
          { articuloId: 2, requiereReceta: false },
        ],
        0,
      ),
    ).toEqual({ ok: true })
  })

  it('allows controlled articles when a prescription is linked', () => {
    expect(
      evaluateDispensacionGate([{ articuloId: 9, requiereReceta: true }], 1),
    ).toEqual({ ok: true })
  })

  it('blocks controlled articles without prescription and lists deduplicated ids', () => {
    expect(
      evaluateDispensacionGate(
        [
          { articuloId: 9, requiereReceta: true },
          { articuloId: 3, requiereReceta: true },
          { articuloId: 9, requiereReceta: true },
          { articuloId: 1, requiereReceta: false },
        ],
        0,
      ),
    ).toEqual({ ok: false, error: 'PRESCRIPTION_REQUIRED', articuloIds: [3, 9] })
  })

  it('allows an empty sale', () => {
    expect(evaluateDispensacionGate([], 0)).toEqual({ ok: true })
  })
})

describe('normalizeSerialCapture', () => {
  it('trims values and maps blanks to null', () => {
    expect(normalizeSerialCapture({ serialUnidad: '  AB-1  ', codigoDatamatrix: '   ' })).toEqual({
      ok: true,
      data: { serialUnidad: 'AB-1', codigoDatamatrix: null },
    })
  })

  it('defaults both fields to null when absent', () => {
    expect(normalizeSerialCapture({})).toEqual({
      ok: true,
      data: { serialUnidad: null, codigoDatamatrix: null },
    })
  })

  it.each([
    [{ serialUnidad: 'x'.repeat(61) }, 'serialUnidad must be at most 60 characters'],
    [{ codigoDatamatrix: 'x'.repeat(201) }, 'codigoDatamatrix must be at most 200 characters'],
  ])('rejects oversized values (%#)', (input, error) => {
    expect(normalizeSerialCapture(input)).toMatchObject({ ok: false, status: 400, error })
  })
})

describe('buildLibroPsicotropicoCsv', () => {
  const row: LibroPsicotropicoMovimientoRow = {
    id: 1,
    tenantId: 1,
    articuloId: 5,
    loteId: 8,
    recetaId: null,
    tipo: 'egreso',
    cantidad: 2,
    referencia: 'factura:31',
    observaciones: null,
    createdAt: '2026-08-28T10:00:00.000Z',
    articulo: { id: 5, codigo: 900, descripcion: 'Clonazepam 2mg' },
    lote: { id: 8, nroLote: 'L-77' },
  }

  it('emits only the header when there are no rows', () => {
    expect(buildLibroPsicotropicoCsv([])).toBe(
      '"fecha","tipo","articuloCodigo","articuloDescripcion","lote","cantidad","referencia","observaciones"',
    )
  })

  it('quotes every cell and maps missing relations to empty strings', () => {
    const csv = buildLibroPsicotropicoCsv([row, { ...row, articulo: null, lote: null }])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toBe(
      '"2026-08-28T10:00:00.000Z","egreso","900","Clonazepam 2mg","L-77","2","factura:31",""',
    )
    expect(lines[2]).toBe('"2026-08-28T10:00:00.000Z","egreso","","","","2","factura:31",""')
  })

  it('escapes embedded double quotes', () => {
    const csv = buildLibroPsicotropicoCsv([{ ...row, observaciones: 'lote "A"' }])
    expect(csv.split('\n')[1]).toContain('"lote ""A"""')
  })
})
