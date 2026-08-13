import { describe, expect, it } from 'vitest'
import type { ArticuloListItem } from '@bizcode/api-client'
import { buildCatalogGridRows } from './groupByRubro'

const item = (over: Partial<ArticuloListItem> & Pick<ArticuloListItem, 'id' | 'descripcion'>): ArticuloListItem =>
  ({
    codigo: over.id,
    rubroId: 1,
    condIva: '1',
    umedida: 'UN',
    precioLista1: 10,
    precioLista2: 10,
    costo: 1,
    stock: 5,
    minimo: 0,
    activo: true,
    ...over,
  }) as ArticuloListItem

describe('buildCatalogGridRows (#257)', () => {
  it('pairs items when a rubro filter is active', () => {
    const rows = buildCatalogGridRows(
      [item({ id: 1, descripcion: 'A' }), item({ id: 2, descripcion: 'B' }), item({ id: 3, descripcion: 'C' })],
      1,
      'Todos',
    )
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ kind: 'pair', items: [{ id: 1 }, { id: 2 }] })
    expect(rows[1]).toMatchObject({ kind: 'pair', items: [{ id: 3 }] })
  })

  it('chunks three columns when requested', () => {
    const rows = buildCatalogGridRows(
      [item({ id: 1, descripcion: 'A' }), item({ id: 2, descripcion: 'B' }), item({ id: 3, descripcion: 'C' })],
      1,
      'Todos',
      3,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ kind: 'pair', items: [{ id: 1 }, { id: 2 }, { id: 3 }] })
  })

  it('inserts rubro headers when showing all', () => {
    const rows = buildCatalogGridRows(
      [
        item({ id: 1, descripcion: 'Leche', rubroId: 1, rubro: { id: 1, codigo: 1, nombre: 'Lacteos' } }),
        item({ id: 2, descripcion: 'Aceite', rubroId: 2, rubro: { id: 2, codigo: 2, nombre: 'Aceites' } }),
      ],
      null,
      'Todos',
    )
    expect(rows.map((r) => r.kind)).toEqual(['header', 'pair', 'header', 'pair'])
    expect(rows[0]).toMatchObject({ kind: 'header', title: 'Lacteos' })
    expect(rows[2]).toMatchObject({ kind: 'header', title: 'Aceites' })
  })
})
