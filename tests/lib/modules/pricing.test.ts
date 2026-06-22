import { describe, expect, it } from 'vitest'
import {
  PLAN_BASE_MONTHLY_ARS,
  estimateTenantMonthlyPrice,
} from '../../../apps/web/src/lib/modules/pricing'
describe('estimateTenantMonthlyPrice', () => {
  it('uses plan base and sums paid addons from catalog', () => {
    const modules = ['core.auth', 'billing.orders', 'billing.pos']
    const result = estimateTenantMonthlyPrice('pro', modules)
    expect(result.basePrice).toBe(PLAN_BASE_MONTHLY_ARS.pro)
    expect(result.addons).toEqual([
      { moduleKey: 'billing.orders', price: 1500 },
      { moduleKey: 'billing.pos', price: 2000 },
    ])
    expect(result.totalMonthly).toBe(PLAN_BASE_MONTHLY_ARS.pro + 1500 + 2000)
  })

  it('uses enterprise plan base', () => {
    const result = estimateTenantMonthlyPrice('enterprise', ['core.auth'])
    expect(result.basePrice).toBe(PLAN_BASE_MONTHLY_ARS.enterprise)
    expect(result.totalMonthly).toBe(PLAN_BASE_MONTHLY_ARS.enterprise)
  })

  it('ignores unknown module keys', () => {
    const result = estimateTenantMonthlyPrice('starter', ['core.auth', 'not.a.module'])
    expect(result.basePrice).toBe(0)
    expect(result.addons).toEqual([])
    expect(result.totalMonthly).toBe(0)
  })
})
