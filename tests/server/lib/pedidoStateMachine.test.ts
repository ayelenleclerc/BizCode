import { describe, expect, it } from 'vitest'
import {
  canTransition,
  fulfillmentRank,
  nextEstadoAfter,
  actionForTargetEstado,
} from '../../../apps/server/lib/pedidoStateMachine'

describe('pedidoStateMachine', () => {
  it('allows confirm only from draft', () => {
    expect(canTransition('draft', 'confirm')).toBe(true)
    expect(canTransition('confirmed', 'confirm')).toBe(false)
    expect(nextEstadoAfter('draft', 'confirm')).toBe('confirmed')
  })

  it('supports early invoice and keeps logistics estado', () => {
    expect(nextEstadoAfter('confirmed', 'invoice')).toBe('invoiced')
    expect(nextEstadoAfter('packed', 'invoice')).toBe('packed')
    expect(nextEstadoAfter('shipped', 'invoice')).toBe('shipped')
    expect(nextEstadoAfter('delivered', 'invoice')).toBe('delivered')
  })

  it('allows pack from confirmed or invoiced', () => {
    expect(canTransition('confirmed', 'pack')).toBe(true)
    expect(canTransition('invoiced', 'pack')).toBe(true)
    expect(canTransition('draft', 'pack')).toBe(false)
    expect(nextEstadoAfter('confirmed', 'pack')).toBe('packed')
  })

  it('allows collect only from invoiced or delivered', () => {
    expect(canTransition('invoiced', 'collect')).toBe(true)
    expect(canTransition('delivered', 'collect')).toBe(true)
    expect(canTransition('packed', 'collect')).toBe(false)
    expect(nextEstadoAfter('invoiced', 'collect')).toBe('collected')
  })

  it('restricts cancel to draft and confirmed', () => {
    expect(canTransition('draft', 'cancel')).toBe(true)
    expect(canTransition('confirmed', 'cancel')).toBe(true)
    expect(canTransition('packed', 'cancel')).toBe(false)
    expect(canTransition('invoiced', 'cancel')).toBe(false)
  })

  it('ranks fulfillment for sync helpers', () => {
    expect(fulfillmentRank('confirmed')).toBe(0)
    expect(fulfillmentRank('invoiced')).toBe(0)
    expect(fulfillmentRank('packed')).toBe(1)
    expect(fulfillmentRank('shipped')).toBe(2)
    expect(fulfillmentRank('delivered')).toBe(3)
  })

  it('maps transition targets to actions', () => {
    expect(actionForTargetEstado('packed')).toBe('pack')
    expect(actionForTargetEstado('collected')).toBe('collect')
    expect(actionForTargetEstado('draft')).toBe(null)
  })
})
