import { describe, expect, it } from 'vitest'
import {
  dbfRowToRawCliente,
  mapLegacyCondToCondIva,
  parseDbfLogical,
} from '@/lib/migration/legacyClienteDbf'

describe('mapLegacyCondToCondIva', () => {
  it.each([
    ['I', 'RI'],
    ['M', 'Mono'],
    ['E', 'Exento'],
    ['N', 'CF'],
    ['C', 'CF'],
    ['X', 'Exento'],
    ['i', 'RI'],
  ] as const)('maps %s to %s', (legacy, expected) => {
    expect(mapLegacyCondToCondIva(legacy)).toBe(expected)
  })

  it('returns null for unknown or empty COND', () => {
    expect(mapLegacyCondToCondIva('')).toBeNull()
    expect(mapLegacyCondToCondIva(' ')).toBeNull()
    expect(mapLegacyCondToCondIva('Z')).toBeNull()
  })
})

describe('parseDbfLogical', () => {
  it('reads boolean and string logical values', () => {
    expect(parseDbfLogical(true)).toBe(true)
    expect(parseDbfLogical(false)).toBe(false)
    expect(parseDbfLogical('T')).toBe(true)
    expect(parseDbfLogical('F')).toBe(false)
    expect(parseDbfLogical(1)).toBe(true)
    expect(parseDbfLogical(0)).toBe(false)
  })
})

describe('dbfRowToRawCliente', () => {
  it('maps core fields and inverts BAJA into activo', () => {
    const raw = dbfRowToRawCliente({
      CODIG: 42,
      RSOCIAL: '  Cliente Demo SA  ',
      COND: 'I',
      BAJA: true,
      FANTASIA: 'Demo',
      DOMIC: 'Calle 1',
      LOCAL: 'CABA',
      CPOST: '1000',
      TELEF: '1111',
      EMAIL: 'a@b.com',
      CUIT: '20-12345678-6',
      CREDITO: 1500.5,
    })

    expect(raw).toMatchObject({
      codigo: 42,
      rsocial: 'Cliente Demo SA',
      condIva: 'RI',
      activo: false,
      fantasia: 'Demo',
      domicilio: 'Calle 1',
      localidad: 'CABA',
      cpost: '1000',
      telef: '1111',
      email: 'a@b.com',
      cuit: '20-12345678-6',
      creditLimit: 1500.5,
    })
  })

  it('truncates optional strings to Prisma limits', () => {
    const raw = dbfRowToRawCliente({
      CODIG: 1,
      RSOCIAL: 'ABC',
      COND: 'C',
      BAJA: false,
      DOMIC: 'x'.repeat(50),
      EMAIL: 'y'.repeat(60),
    })

    expect(raw.domicilio).toHaveLength(40)
    expect(raw.email).toHaveLength(50)
  })
})
