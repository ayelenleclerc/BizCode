import { describe, expect, it } from 'vitest'
import {
  articuloBodySchema,
  clienteBodySchema,
  proveedorBodySchema,
  rubroBodySchema,
  safeParseBodySchema,
} from '../../apps/server/schemas/domain'

describe('safeParseBodySchema', () => {
  it('accepts cliente raw shaped like csvRowToRawCliente output', () => {
    const raw = {
      codigo: 1001,
      rsocial: '  Acme SA  ',
      condIva: 'RI',
      activo: true,
      fantasia: 'Alias',
    }
    const r = safeParseBodySchema(clienteBodySchema, raw)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.codigo).toBe(1001)
      expect(r.value.rsocial).toBe('Acme SA')
    }
  })

  it('rejects cliente with rsocial too short (same path as CSV import)', () => {
    const r = safeParseBodySchema(clienteBodySchema, {
      codigo: 1,
      rsocial: 'AB',
      condIva: 'RI',
      activo: true,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error).toMatch(/rsocial/i)
    }
  })

  it('accepts articulo body after rubroId resolution', () => {
    const r = safeParseBodySchema(articuloBodySchema, {
      codigo: 10,
      descripcion: 'Producto ok',
      rubroId: 1,
      condIva: '1',
      umedida: 'UN',
      precioLista1: 10,
      precioLista2: 9,
      costo: 5,
      stock: 0,
      minimo: 0,
      activo: true,
    })
    expect(r.ok).toBe(true)
  })

  it('rejects articulo with negative stock', () => {
    const r = safeParseBodySchema(articuloBodySchema, {
      codigo: 10,
      descripcion: 'Producto ok',
      rubroId: 1,
      condIva: '1',
      umedida: 'UN',
      precioLista1: 10,
      precioLista2: 9,
      costo: 5,
      stock: -1,
      minimo: 0,
      activo: true,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error).toMatch(/stock/i)
    }
  })

  it('accepts rubro raw', () => {
    const r = safeParseBodySchema(rubroBodySchema, { codigo: 5, nombre: '  X  ' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.nombre).toBe('X')
    }
  })

  it('accepts proveedor raw', () => {
    const r = safeParseBodySchema(proveedorBodySchema, {
      codigo: 1,
      rsocial: 'Proveedor SL',
      condIva: 'Mono',
      activo: false,
    })
    expect(r.ok).toBe(true)
  })
})
