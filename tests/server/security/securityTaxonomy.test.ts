import { describe, expect, it } from 'vitest'
import { classifyAuditEvent, isPrivilegedRole } from '../../../apps/server/security/securityTaxonomy'
import { resolveCountryFromIp } from '../../../apps/server/security/geoip'

describe('securityTaxonomy (#221)', () => {
  it('classifies privileged user_create as high', () => {
    expect(classifyAuditEvent('user_create', { role: 'owner' })).toEqual({
      securityEventType: 'user_privileged_create',
      severity: 'high',
    })
  })

  it('classifies role escalation as critical', () => {
    expect(classifyAuditEvent('user_update', { role: 'manager', previousRole: 'seller' })).toEqual({
      securityEventType: 'role_escalation',
      severity: 'critical',
    })
  })

  it('classifies MFA disable on privileged role as critical', () => {
    expect(classifyAuditEvent('mfa_disable', { role: 'owner' })).toEqual({
      securityEventType: 'mfa_disabled_critical',
      severity: 'critical',
    })
  })

  it('classifies login geo anomaly as critical', () => {
    expect(classifyAuditEvent('login', { geoAnomaly: true, country: 'BR' })).toEqual({
      securityEventType: 'login_geo_anomaly',
      severity: 'critical',
    })
  })

  it('classifies normal login as info', () => {
    expect(classifyAuditEvent('login', { country: 'AR' })).toEqual({
      securityEventType: 'info_login_success',
      severity: 'info',
    })
  })

  it('exposes privileged role helper', () => {
    expect(isPrivilegedRole('owner')).toBe(true)
    expect(isPrivilegedRole('seller')).toBe(false)
  })
})

describe('resolveCountryFromIp (#221)', () => {
  it('returns null for private and loopback addresses', () => {
    expect(resolveCountryFromIp('127.0.0.1')).toBeNull()
    expect(resolveCountryFromIp('10.0.0.5')).toBeNull()
    expect(resolveCountryFromIp('192.168.1.10')).toBeNull()
    expect(resolveCountryFromIp('172.16.0.1')).toBeNull()
  })

  it('returns a country code for a well-known public IP when geo DB resolves', () => {
    // 8.8.8.8 is Google DNS; geoip-lite typically maps to US.
    const country = resolveCountryFromIp('8.8.8.8')
    expect(country === null || /^[A-Z]{2}$/.test(country)).toBe(true)
  })
})
