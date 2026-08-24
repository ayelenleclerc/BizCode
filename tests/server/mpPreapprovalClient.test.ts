import { describe, expect, it } from 'vitest'
import { createMockPreapproval } from '../../apps/server/saas/mpPreapprovalClient'

describe('mpPreapprovalClient mock', () => {
  it('returns deterministic mock id and initPoint', () => {
    const r = createMockPreapproval(7, 'pro')
    expect(r.mock).toBe(true)
    expect(r.id).toBe('mock-preapproval-7-pro')
    expect(r.initPoint).toContain('/configuracion/billing')
  })
})
