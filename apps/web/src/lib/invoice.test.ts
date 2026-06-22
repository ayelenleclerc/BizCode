import { describe, it, expect } from 'vitest'
import { calculateInvoice, calculateItemSubtotal } from './invoice'

describe('calculateItemSubtotal', () => {
  it('calcula subtotal sin descuento', () => {
    expect(calculateItemSubtotal(2, 100, 0)).toBe(200)
  })

  it('calcula subtotal con descuento parcial', () => {
    expect(calculateItemSubtotal(1, 100, 10)).toBe(90)
  })

  it('calcula subtotal con 100% de descuento', () => {
    expect(calculateItemSubtotal(1, 100, 100)).toBe(0)
  })

  it('calcula subtotal con cantidades decimales', () => {
    expect(calculateItemSubtotal(1.5, 100, 0)).toBe(150)
  })

  it('redondea a 2 decimales', () => {
    // 1 * 10 - 10*33.33/100 = 10 - 3.333 = 6.667 → 6.67
    expect(calculateItemSubtotal(1, 10, 33.33)).toBe(6.67)
  })
})

describe('calculateInvoice', () => {
  it('retorna todos ceros para array de ítems vacío', () => {
    const result = calculateInvoice([], 'RI')
    expect(result).toEqual({ neto1: 0, neto2: 0, neto3: 0, iva1: 0, iva2: 0, total: 0 })
  })

  it('calcula correctamente para cliente RI con artículo IVA 21%', () => {
    const result = calculateInvoice(
      [{ cantidad: 1, precio: 100, dscto: 0, articuloIva: '1' }],
      'RI'
    )
    expect(result.neto1).toBe(100)
    expect(result.iva1).toBe(21)
    expect(result.total).toBe(121)
  })

  it('calcula correctamente para cliente RI con artículo IVA 10.5%', () => {
    const result = calculateInvoice(
      [{ cantidad: 1, precio: 200, dscto: 0, articuloIva: '2' }],
      'RI'
    )
    expect(result.neto2).toBe(200)
    expect(result.iva2).toBe(21)
    expect(result.total).toBe(221)
  })

  it('calcula correctamente para cliente RI con artículo exento (IVA 3)', () => {
    const result = calculateInvoice(
      [{ cantidad: 1, precio: 100, dscto: 0, articuloIva: '3' }],
      'RI'
    )
    expect(result.neto3).toBe(100)
    expect(result.iva1).toBe(0)
    expect(result.iva2).toBe(0)
    expect(result.total).toBe(100)
  })

  it('no aplica IVA para cliente CF', () => {
    const result = calculateInvoice(
      [{ cantidad: 1, precio: 100, dscto: 0, articuloIva: '1' }],
      'CF'
    )
    expect(result.neto1).toBe(100)
    expect(result.iva1).toBe(0)
    expect(result.total).toBe(100)
  })

  it('no aplica IVA para cliente Exento', () => {
    const result = calculateInvoice(
      [{ cantidad: 1, precio: 100, dscto: 0, articuloIva: '1' }],
      'Exento'
    )
    expect(result.iva1).toBe(0)
    expect(result.total).toBe(100)
  })

  it('aplica IVA para cliente Mono (Monotributista)', () => {
    const result = calculateInvoice(
      [{ cantidad: 1, precio: 100, dscto: 0, articuloIva: '1' }],
      'Mono'
    )
    expect(result.iva1).toBe(21)
    expect(result.total).toBe(121)
  })

  it('calcula ítems mixtos con distintas alícuotas', () => {
    const result = calculateInvoice(
      [
        { cantidad: 2, precio: 100, dscto: 0, articuloIva: '1' }, // neto1=200
        { cantidad: 1, precio: 200, dscto: 0, articuloIva: '2' }, // neto2=200
        { cantidad: 1, precio: 50, dscto: 0, articuloIva: '3' },  // neto3=50
      ],
      'RI'
    )
    expect(result.neto1).toBe(200)
    expect(result.neto2).toBe(200)
    expect(result.neto3).toBe(50)
    expect(result.iva1).toBe(42)
    expect(result.iva2).toBe(21)
    expect(result.total).toBe(513)
  })

  it('calcula correctamente con descuento', () => {
    const result = calculateInvoice(
      [{ cantidad: 1, precio: 100, dscto: 10, articuloIva: '1' }],
      'RI'
    )
    expect(result.neto1).toBe(90)
    expect(result.iva1).toBe(18.9)
    expect(result.total).toBe(108.9)
  })

  it('redondea totales a 2 decimales', () => {
    // cantidad=3, precio=3.33, dscto=0 → subtotal=9.99, neto1=9.99, iva1=2.1 (9.99*0.21=2.0979→2.1)
    const result = calculateInvoice(
      [{ cantidad: 3, precio: 3.33, dscto: 0, articuloIva: '1' }],
      'RI'
    )
    expect(result.neto1).toBe(9.99)
    expect(result.iva1).toBe(2.1)
  })

  it('no acumula neto para articuloIva fuera de "1","2","3" (rama implícita del else-if)', () => {
    // TypeScript previene esto en producción, pero la cobertura de V8 exige cubrir la rama implícita
    const result = calculateInvoice(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [{ cantidad: 1, precio: 100, dscto: 0, articuloIva: '9' as any }],
      'RI'
    )
    expect(result.neto1).toBe(0)
    expect(result.neto2).toBe(0)
    expect(result.neto3).toBe(0)
    expect(result.total).toBe(0)
  })
})

