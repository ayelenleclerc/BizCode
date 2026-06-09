import { describe, expect, it } from 'vitest'
import {
  articuloBodySchema,
  clienteBodySchema,
  empresaUpdateBodySchema,
  facturaBodySchema,
  logisticaReportesQuerySchema,
  proveedorBodySchema,
  rubroBodySchema,
  stockAjusteBodySchema,
} from '../../server/schemas/domain'

const validArticuloPayload = {
  codigo: 10,
  descripcion: 'Producto ok',
  rubroId: 1,
  condIva: '1' as const,
  umedida: 'UN',
  precioLista1: 10,
  precioLista2: 9,
  costo: 5,
  stock: 0,
  minimo: 0,
  activo: true,
}

describe('clienteBodySchema', () => {
  it('parses valid payload and trims rsocial', () => {
    const out = clienteBodySchema.parse({
      codigo: 10,
      rsocial: '  ACME SA  ',
      condIva: 'RI',
      activo: true,
    })
    expect(out.rsocial).toBe('ACME SA')
    expect(out.codigo).toBe(10)
  })

  it('strips unknown keys (non-strict object; compatible with legacy clients)', () => {
    const out = clienteBodySchema.parse({
      codigo: 10,
      rsocial: 'ACME SA',
      condIva: 'RI',
      activo: true,
      extraUnknown: 'ignored',
    } as Record<string, unknown>)
    expect('extraUnknown' in out).toBe(false)
  })

  it('rejects invalid CUIT', () => {
    const r = clienteBodySchema.safeParse({
      codigo: 10,
      rsocial: 'ACME SA',
      condIva: 'RI',
      activo: true,
      cuit: '20123456787',
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.errors.some((e) => e.path.includes('cuit'))).toBe(true)
    }
  })

  it('rejects missing required fields', () => {
    const r = clienteBodySchema.safeParse({ codigo: 10, rsocial: 'ACME SA' })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.errors.some((e) => e.path.includes('condIva') || e.path.includes('activo'))).toBe(true)
    }
  })
})

describe('articuloBodySchema', () => {
  it('rejects negative stock', () => {
    const r = articuloBodySchema.safeParse({ ...validArticuloPayload, stock: -1 })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.errors.some((e) => e.path.includes('stock'))).toBe(true)
    }
  })
})

describe('proveedorBodySchema', () => {
  it('parses valid payload', () => {
    const out = proveedorBodySchema.parse({
      codigo: 1,
      rsocial: 'Proveedor SA',
      condIva: 'RI',
      activo: true,
    })
    expect(out.rsocial).toBe('Proveedor SA')
  })

  it('rejects invalid CUIT', () => {
    const r = proveedorBodySchema.safeParse({
      codigo: 1,
      rsocial: 'Proveedor SA',
      condIva: 'RI',
      activo: true,
      cuit: '20123456787',
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.errors.some((e) => e.path.includes('cuit'))).toBe(true)
    }
  })
})

describe('stockAjusteBodySchema', () => {
  it('parses valid adjustment', () => {
    const out = stockAjusteBodySchema.parse({ cantidad: -3, motivo: '  Merma  ' })
    expect(out.cantidad).toBe(-3)
    expect(out.motivo).toBe('Merma')
  })

  it('rejects zero cantidad', () => {
    const r = stockAjusteBodySchema.safeParse({ cantidad: 0, motivo: 'Ok' })
    expect(r.success).toBe(false)
  })

  it('rejects empty motivo', () => {
    const r = stockAjusteBodySchema.safeParse({ cantidad: 1, motivo: '   ' })
    expect(r.success).toBe(false)
  })
})

describe('rubroBodySchema', () => {
  it('rejects empty nombre after trim', () => {
    const r = rubroBodySchema.safeParse({ codigo: 1, nombre: '   ' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.errors.some((e) => e.message.includes('nombre'))).toBe(true)
  })
})

describe('empresaUpdateBodySchema', () => {
  it('parses valid company settings', () => {
    const out = empresaUpdateBodySchema.parse({
      nombre: '  Mi Empresa  ',
      cuit: '20-12345678-6',
      domicilio: 'Calle 1',
      puntoVenta: 12,
      tipoFactura: 'B',
    })
    expect(out.nombre).toBe('Mi Empresa')
    expect(out.puntoVenta).toBe(12)
  })

  it('rejects invalid CUIT', () => {
    const r = empresaUpdateBodySchema.safeParse({
      nombre: 'Co',
      cuit: '20-00000000-0',
      puntoVenta: 1,
      tipoFactura: 'B',
    })
    expect(r.success).toBe(false)
  })

  it('rejects puntoVenta above 9999', () => {
    const r = empresaUpdateBodySchema.safeParse({
      nombre: 'Co',
      cuit: '20-12345678-6',
      puntoVenta: 10000,
      tipoFactura: 'B',
    })
    expect(r.success).toBe(false)
  })
})

describe('logisticaReportesQuerySchema', () => {
  it('parses valid period and optional choferId', () => {
    const out = logisticaReportesQuerySchema.parse({
      from: '2026-05-01',
      to: '2026-05-31',
      choferId: '3',
    })
    expect(out.choferId).toBe(3)
  })

  it('rejects from after to', () => {
    const r = logisticaReportesQuerySchema.safeParse({
      from: '2026-05-31',
      to: '2026-05-01',
    })
    expect(r.success).toBe(false)
  })

  it('rejects invalid choferId', () => {
    const r = logisticaReportesQuerySchema.safeParse({
      from: '2026-05-01',
      to: '2026-05-31',
      choferId: 'abc',
    })
    expect(r.success).toBe(false)
  })
})

describe('facturaBodySchema', () => {
  it('accepts body with unknown keys stripped (backward compatible)', () => {
    const parsed = facturaBodySchema.safeParse({
      fecha: new Date().toISOString(),
      tipo: 'B',
      numero: 1,
      clienteId: 1,
      neto1: 100,
      neto2: 0,
      neto3: 0,
      iva1: 0,
      iva2: 0,
      total: 100,
      estado: 'A',
      items: [{ articuloId: 1, cantidad: 1, precio: 100, dscto: 0, subtotal: 100 }],
    })
    expect(parsed.success).toBe(true)
  })
})
