import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from '../../apps/server/auth'
import { requireModule } from '../../apps/server/middleware/requireModule'

type MockResponse = Response & { statusCode: number; body: unknown }

function mockRes(): MockResponse {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }
  return res as unknown as MockResponse
}

describe('requireModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without auth', () => {
    const req = {} as AuthenticatedRequest
    const res = mockRes()
    const next = vi.fn() as NextFunction
    requireModule('billing.orders')(req, res, next)
    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 when module missing', () => {
    const req = {
      auth: { claims: { tenantId: 1, userId: 1, role: 'owner' } },
      tenantModules: ['core.auth'],
    } as unknown as AuthenticatedRequest
    const res = mockRes()
    const next = vi.fn() as NextFunction
    requireModule('billing.orders')(req, res, next)
    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({
      success: false,
      error: 'module_not_enabled',
      module: 'billing.orders',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when module enabled', () => {
    const req = {
      auth: { claims: { tenantId: 1, userId: 1, role: 'owner' } },
      tenantModules: ['billing.orders'],
    } as unknown as AuthenticatedRequest
    const res = mockRes()
    const next = vi.fn() as NextFunction
    requireModule('billing.orders')(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
