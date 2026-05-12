import { describe, expect, it, vi } from 'vitest'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../server/auth'
import { tenantContext } from '../../server/middleware/tenantContext'

describe('tenantContext middleware', () => {
  it('sets req.tenantId from authenticated session claims', () => {
    const req = {
      auth: {
        claims: {
          userId: 1,
          username: 'owner',
          tenantId: 42,
          role: 'owner',
          permissions: [],
          scope: { tenantId: 42, branchIds: [], warehouseIds: [], routeIds: [], channels: [] },
        },
      },
    } as unknown as AuthenticatedRequest
    const next = vi.fn()

    tenantContext(req, {} as Response, next)

    expect(req.tenantId).toBe(42)
    expect(next).toHaveBeenCalledOnce()
  })

  it('leaves req.tenantId unset when session is absent', () => {
    const req = {} as AuthenticatedRequest
    const next = vi.fn()

    tenantContext(req, {} as Response, next)

    expect(req.tenantId).toBeUndefined()
    expect(next).toHaveBeenCalledOnce()
  })
})
