import { describe, expect, it } from 'vitest'
import {
  DESPACHANTE_EMAIL_MAX,
  DESPACHANTE_NOMBRE_MAX,
  buildDespachanteEmailBody,
  convertToLocal,
  groupSaldosByMoneda,
  isIncoterm,
  isOperationCurrency,
  normalizeCountryCode,
  normalizeDespachanteInput,
  normalizeExportFields,
} from '../../apps/server/services/exportOperationMath'

describe('isIncoterm', () => {
  it('accepts the 11 Incoterms 2020 rules', () => {
    for (const code of ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']) {
      expect(isIncoterm(code)).toBe(true)
    }
  })

  it('rejects removed or unknown terms', () => {
    expect(isIncoterm('DAT')).toBe(false)
    expect(isIncoterm('')).toBe(false)
    expect(isIncoterm('fob')).toBe(false)
  })
})

describe('isOperationCurrency', () => {
  it('accepts the supported currencies', () => {
    expect(isOperationCurrency('ARS')).toBe(true)
    expect(isOperationCurrency('USD')).toBe(true)
    expect(isOperationCurrency('EUR')).toBe(true)
  })

  it('rejects currencies outside the FX catalog (#243)', () => {
    expect(isOperationCurrency('BRL')).toBe(false)
    expect(isOperationCurrency('CLP')).toBe(false)
    expect(isOperationCurrency('usd')).toBe(false)
  })
})

describe('normalizeCountryCode', () => {
  it('returns null for empty input', () => {
    expect(normalizeCountryCode(null)).toBeNull()
    expect(normalizeCountryCode(undefined)).toBeNull()
    expect(normalizeCountryCode('   ')).toBeNull()
  })

  it('uppercases and trims valid codes', () => {
    expect(normalizeCountryCode(' br ')).toBe('BR')
    expect(normalizeCountryCode('us')).toBe('US')
  })

  it('flags malformed codes', () => {
    expect(normalizeCountryCode('ARG')).toBe('invalid')
    expect(normalizeCountryCode('A')).toBe('invalid')
    expect(normalizeCountryCode('A1')).toBe('invalid')
  })
})

describe('convertToLocal', () => {
  it('multiplies by the rate and rounds to two decimals', () => {
    expect(convertToLocal(100, 1050.5)).toBe(105050)
    expect(convertToLocal(10.55, 3.333)).toBe(35.16)
  })
})

describe('normalizeExportFields', () => {
  it('returns empty fields when nothing is provided', () => {
    const result = normalizeExportFields({})
    expect(result).toEqual({
      ok: true,
      data: {
        monedaOperacion: null,
        totalMonedaOperacion: null,
        tipoCambioValor: null,
        incoterm: null,
        paisDestino: null,
      },
    })
  })

  it('normalizes incoterm and country without currency', () => {
    const result = normalizeExportFields({ incoterm: ' fob ', paisDestino: 'br' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.incoterm).toBe('FOB')
    expect(result.data.paisDestino).toBe('BR')
    expect(result.data.monedaOperacion).toBeNull()
  })

  it('rejects an unknown incoterm with 422', () => {
    const result = normalizeExportFields({ incoterm: 'DAT' })
    expect(result).toMatchObject({ ok: false, status: 422 })
  })

  it('rejects a malformed destination country with 422', () => {
    const result = normalizeExportFields({ paisDestino: 'ARG' })
    expect(result).toMatchObject({ ok: false, status: 422 })
  })

  it('requires monedaOperacion when a total is provided', () => {
    const result = normalizeExportFields({ totalMonedaOperacion: 100 })
    expect(result).toMatchObject({ ok: false, status: 422 })
  })

  it('rejects an unsupported currency', () => {
    const result = normalizeExportFields({ monedaOperacion: 'CLP', totalMonedaOperacion: 100 })
    expect(result).toMatchObject({ ok: false, status: 422 })
  })

  it('requires a positive operation total', () => {
    expect(normalizeExportFields({ monedaOperacion: 'USD' })).toMatchObject({ ok: false })
    expect(
      normalizeExportFields({ monedaOperacion: 'USD', totalMonedaOperacion: 0 }),
    ).toMatchObject({ ok: false })
    expect(
      normalizeExportFields({ monedaOperacion: 'USD', totalMonedaOperacion: -5 }),
    ).toMatchObject({ ok: false })
    expect(
      normalizeExportFields({ monedaOperacion: 'USD', totalMonedaOperacion: Number.NaN }),
    ).toMatchObject({ ok: false })
    expect(
      normalizeExportFields({ monedaOperacion: 'USD', totalMonedaOperacion: 1e15 }),
    ).toMatchObject({ ok: false })
  })

  it('does not require a rate for the local currency', () => {
    const result = normalizeExportFields({ monedaOperacion: 'ars', totalMonedaOperacion: 250 })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.monedaOperacion).toBe('ARS')
    expect(result.data.tipoCambioValor).toBeNull()
  })

  it('requires a positive rate for a foreign currency', () => {
    expect(
      normalizeExportFields({ monedaOperacion: 'USD', totalMonedaOperacion: 100 }),
    ).toMatchObject({ ok: false, status: 422 })
    expect(
      normalizeExportFields({
        monedaOperacion: 'USD',
        totalMonedaOperacion: 100,
        tipoCambioValor: 0,
      }),
    ).toMatchObject({ ok: false, status: 422 })
  })

  it('accepts a complete export operation', () => {
    const result = normalizeExportFields({
      monedaOperacion: 'usd',
      totalMonedaOperacion: 1500,
      tipoCambioValor: 1010.25,
      incoterm: 'cif',
      paisDestino: 'us',
    })
    expect(result).toEqual({
      ok: true,
      data: {
        monedaOperacion: 'USD',
        totalMonedaOperacion: 1500,
        tipoCambioValor: 1010.25,
        incoterm: 'CIF',
        paisDestino: 'US',
      },
    })
  })
})

describe('normalizeDespachanteInput', () => {
  it('returns nulls when nothing is provided', () => {
    expect(normalizeDespachanteInput({})).toEqual({
      ok: true,
      data: { despachanteNombre: null, despachanteEmail: null },
    })
  })

  it('trims and lowercases the email', () => {
    const result = normalizeDespachanteInput({
      despachanteNombre: '  Estudio Aduanero  ',
      despachanteEmail: '  Broker@Example.COM ',
    })
    expect(result).toEqual({
      ok: true,
      data: { despachanteNombre: 'Estudio Aduanero', despachanteEmail: 'broker@example.com' },
    })
  })

  it('rejects a malformed email', () => {
    expect(normalizeDespachanteInput({ despachanteEmail: 'not-an-email' })).toMatchObject({
      ok: false,
      status: 422,
    })
  })

  it('requires an email when a name is given', () => {
    expect(normalizeDespachanteInput({ despachanteNombre: 'Estudio' })).toMatchObject({
      ok: false,
      status: 422,
    })
  })

  it('accepts an email without a name', () => {
    expect(normalizeDespachanteInput({ despachanteEmail: 'broker@example.com' })).toMatchObject({
      ok: true,
      data: { despachanteNombre: null, despachanteEmail: 'broker@example.com' },
    })
  })

  it('enforces column widths', () => {
    expect(
      normalizeDespachanteInput({
        despachanteNombre: 'x'.repeat(DESPACHANTE_NOMBRE_MAX + 1),
        despachanteEmail: 'broker@example.com',
      }),
    ).toMatchObject({ ok: false, status: 422 })
    expect(
      normalizeDespachanteInput({
        despachanteEmail: `${'x'.repeat(DESPACHANTE_EMAIL_MAX)}@example.com`,
      }),
    ).toMatchObject({ ok: false, status: 422 })
  })
})

describe('groupSaldosByMoneda', () => {
  it('returns an empty list without entries', () => {
    expect(groupSaldosByMoneda([])).toEqual([])
  })

  it('keeps foreign balances separate from the local one', () => {
    expect(
      groupSaldosByMoneda([
        { moneda: 'ARS', monto: 1000 },
        { moneda: 'USD', monto: 250 },
        { moneda: 'ARS', monto: -400 },
        { moneda: 'USD', monto: -50.5 },
      ]),
    ).toEqual([
      { moneda: 'ARS', saldo: 600 },
      { moneda: 'USD', saldo: 199.5 },
    ])
  })

  it('defaults blank currencies to the local one and normalizes case', () => {
    expect(
      groupSaldosByMoneda([
        { moneda: '', monto: 100 },
        { moneda: 'usd', monto: 10 },
      ]),
    ).toEqual([
      { moneda: 'ARS', saldo: 100 },
      { moneda: 'USD', saldo: 10 },
    ])
  })

  it('sorts the local currency first and the rest alphabetically', () => {
    expect(
      groupSaldosByMoneda([
        { moneda: 'USD', monto: 1 },
        { moneda: 'ARS', monto: 1 },
        { moneda: 'EUR', monto: 1 },
      ]).map((row) => row.moneda),
    ).toEqual(['ARS', 'EUR', 'USD'])
  })
})

describe('buildDespachanteEmailBody', () => {
  it('lists the operation header and the goods', () => {
    const body = buildDespachanteEmailBody({
      pedidoId: 42,
      clienteRsocial: 'ACME SA',
      incoterm: 'FOB',
      paisDestino: 'BR',
      moneda: 'USD',
      total: 1500,
      items: [
        { descripcion: 'Bomba centrifuga', cantidad: 2 },
        { descripcion: 'Repuesto sello', cantidad: 10 },
      ],
    })
    expect(body).toContain('Pedido: #42')
    expect(body).toContain('Cliente: ACME SA')
    expect(body).toContain('Incoterm: FOB')
    expect(body).toContain('Pais destino: BR')
    expect(body).toContain('Moneda: USD')
    expect(body).toContain('Total: 1500.00')
    expect(body).toContain('- Bomba centrifuga x 2')
    expect(body).toContain('- Repuesto sello x 10')
  })

  it('falls back to placeholders and local currency', () => {
    const body = buildDespachanteEmailBody({
      pedidoId: 7,
      clienteRsocial: 'Cliente',
      incoterm: null,
      paisDestino: null,
      moneda: null,
      total: 0,
      items: [],
    })
    expect(body).toContain('Incoterm: -')
    expect(body).toContain('Pais destino: -')
    expect(body).toContain('Moneda: ARS')
  })
})
