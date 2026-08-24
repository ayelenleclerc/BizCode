import { describe, expect, it } from 'vitest'
import { isValidTenantSlug, normalizeTenantSlug, suggestTenantSlug } from './tenantSlug'
import {
  isInvoiceMutationBlocked,
  isInvoiceMutationBlockedByTrial,
  SAAS_STATUS_SUSPENDED_PAYMENT,
  SAAS_STATUS_SUSPENDED_TRIAL,
  SAAS_STATUS_TRIAL,
  trialDaysRemaining,
} from './saasStatus'

describe('tenantSlug', () => {
  it('suggests hyphenated lowercase slug', () => {
    expect(suggestTenantSlug('Mi Negocio SA')).toBe('mi-negocio-sa')
  })

  it('validates slug shape', () => {
    expect(isValidTenantSlug('acme')).toBe(true)
    expect(isValidTenantSlug('acme-co')).toBe(true)
    expect(isValidTenantSlug('-bad')).toBe(false)
    expect(isValidTenantSlug('A')).toBe(false)
    expect(isValidTenantSlug(normalizeTenantSlug('  Hello  '))).toBe(true)
    expect(isValidTenantSlug('hello_world')).toBe(false)
  })
})

describe('saasStatus helpers', () => {
  it('blocks invoice mutations for suspended_trial and suspended_payment', () => {
    expect(isInvoiceMutationBlockedByTrial(SAAS_STATUS_SUSPENDED_TRIAL)).toBe(true)
    expect(isInvoiceMutationBlockedByTrial(SAAS_STATUS_TRIAL)).toBe(false)
    expect(isInvoiceMutationBlockedByTrial('active')).toBe(false)
    expect(isInvoiceMutationBlocked(SAAS_STATUS_SUSPENDED_PAYMENT)).toBe(true)
    expect(isInvoiceMutationBlocked(SAAS_STATUS_SUSPENDED_TRIAL)).toBe(true)
    expect(isInvoiceMutationBlocked('active')).toBe(false)
  })

  it('computes days remaining', () => {
    const now = new Date('2026-08-21T12:00:00.000Z')
    const ends = new Date('2026-08-24T12:00:00.000Z')
    expect(trialDaysRemaining(ends, now)).toBe(3)
    expect(trialDaysRemaining(new Date('2026-08-20T12:00:00.000Z'), now)).toBe(0)
    expect(trialDaysRemaining(null, now)).toBeNull()
  })
})
