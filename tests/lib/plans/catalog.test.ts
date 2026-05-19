import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PLAN_KEY,
  PLAN_CATALOG,
  isLimitExceeded,
  planIncludesFeature,
} from '../../../src/lib/plans'

describe('plans catalog', () => {
  it('exposes starter/pro/enterprise/trial', () => {
    expect(PLAN_CATALOG.starter.maxUsers).toBe(3)
    expect(PLAN_CATALOG.enterprise.maxUsers).toBeNull()
    expect(DEFAULT_PLAN_KEY).toBe('starter')
  })

  it('isLimitExceeded treats null as unlimited', () => {
    expect(isLimitExceeded(100, null)).toBe(false)
    expect(isLimitExceeded(3, 3)).toBe(true)
    expect(isLimitExceeded(2, 3)).toBe(false)
  })

  it('planIncludesFeature checks feature keys', () => {
    expect(planIncludesFeature(PLAN_CATALOG.pro.features, 'apps.driver')).toBe(true)
    expect(planIncludesFeature(PLAN_CATALOG.starter.features, 'apps.driver')).toBe(false)
  })
})
