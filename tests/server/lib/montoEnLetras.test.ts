import { describe, expect, it } from 'vitest'
import { montoEnLetrasArs } from '../../../apps/server/lib/montoEnLetras'

describe('montoEnLetrasArs (#233)', () => {
  it('converts zero', () => {
    expect(montoEnLetrasArs(0)).toBe('cero pesos')
  })

  it('converts one peso', () => {
    expect(montoEnLetrasArs(1)).toBe('un peso')
  })

  it('converts integer amounts', () => {
    expect(montoEnLetrasArs(21)).toBe('veintiuno pesos')
    expect(montoEnLetrasArs(100)).toBe('cien pesos')
    expect(montoEnLetrasArs(121)).toBe('ciento veintiuno pesos')
  })

  it('converts amounts with centavos', () => {
    expect(montoEnLetrasArs(1.5)).toBe('un peso con cincuenta centavos')
    expect(montoEnLetrasArs('242.00')).toBe('doscientos cuarenta y dos pesos')
  })

  it('handles negative amounts', () => {
    expect(montoEnLetrasArs(-10)).toBe('menos diez pesos')
  })

  it('handles millions', () => {
    expect(montoEnLetrasArs(1_000_000)).toBe('un millón pesos')
    expect(montoEnLetrasArs(2_500_000)).toBe('dos millones quinientos mil pesos')
  })
})
