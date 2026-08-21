import { describe, expect, it } from 'vitest'
import { resolveStatusTone } from './statusVariant'

describe('resolveStatusTone', () => {
  it('maps pedido / OE / reparto statuses to tones', () => {
    expect(resolveStatusTone('delivered')).toBe('success')
    expect(resolveStatusTone('cancelled')).toBe('error')
    expect(resolveStatusTone('in_transit')).toBe('warning')
    expect(resolveStatusTone('planned')).toBe('info')
    expect(resolveStatusTone('not_delivered')).toBe('error')
    expect(resolveStatusTone('visitado')).toBe('success')
  })

  it('normalizes case and unknowns to info', () => {
    expect(resolveStatusTone(' DELIVERED ')).toBe('success')
    expect(resolveStatusTone('unknown_status')).toBe('info')
  })
})
