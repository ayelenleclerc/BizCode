import { describe, expect, it } from 'vitest'
import { formatCurrency } from './currencyFormat'

describe('formatCurrency', () => {
  it('formats ARS with es-AR by default', () => {
    const formatted = formatCurrency(1234.5)
    expect(formatted).toMatch(/1.?234/)
    expect(formatted).toMatch(/\$|ARS/)
  })

  it('accepts locale and currency overrides', () => {
    const us = formatCurrency(10, 'en-US', 'USD')
    expect(us).toContain('10')
    expect(us).toMatch(/\$|USD/)

    const br = formatCurrency(10, 'pt-BR', 'BRL')
    expect(br).toContain('10')
  })
})
