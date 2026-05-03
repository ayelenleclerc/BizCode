import { describe, expect, it } from 'vitest'
import { clienteBodySchema, facturaBodySchema, rubroBodySchema } from '../../server/schemas/domain'

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
})

describe('rubroBodySchema', () => {
  it('rejects empty nombre after trim', () => {
    const r = rubroBodySchema.safeParse({ codigo: 1, nombre: '   ' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.errors.some((e) => e.message.includes('nombre'))).toBe(true)
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
