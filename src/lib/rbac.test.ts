import { describe, it, expect } from 'vitest'
import { hasPermission, OWNER_PERMISSIONS, ROLE_PERMISSIONS } from './rbac'

describe('rbac — super_admin', () => {
  it('includes every owner permission', () => {
    for (const p of OWNER_PERMISSIONS) {
      expect(hasPermission('super_admin', p)).toBe(true)
    }
  })

  it('includes platform-only permissions', () => {
    expect(hasPermission('super_admin', 'platform.tenants.manage')).toBe(true)
    expect(hasPermission('super_admin', 'platform.support.impersonate')).toBe(true)
  })

  it('owner does not include platform.tenants.manage', () => {
    expect(hasPermission('owner', 'platform.tenants.manage')).toBe(false)
  })

  it('super_admin permission list length matches owner plus two platform entries', () => {
    expect(ROLE_PERMISSIONS.super_admin).toHaveLength(OWNER_PERMISSIONS.length + 2)
  })
})
