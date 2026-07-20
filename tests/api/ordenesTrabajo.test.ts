import { describe, expect, it, vi } from 'vitest'
import type { Application } from 'express'
import { registerOrdenTrabajoRoutes } from '../../apps/server/routes/registerOrdenTrabajoRoutes'
import type { RestRouteContext } from '../../apps/server/routes/restRouteTypes'

vi.mock('../../apps/server/middleware/requireModule', () => ({
  requireModule: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}))

vi.mock('../../apps/server/auth', () => ({
  requirePermission: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  requireAnyPermission: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}))

vi.mock('../../apps/server/middleware/validateBody', () => ({
  validateBody: () => (_req: unknown, _res: unknown, next: () => void) => {
    next()
  },
}))

describe('registerOrdenTrabajoRoutes', () => {
  it('registers list/create/get/update/transicion/facturar paths', () => {
    const routes: string[] = []
    const app = {
      get: (path: string, ..._handlers: unknown[]) => {
        routes.push(`GET ${path}`)
      },
      post: (path: string, ..._handlers: unknown[]) => {
        routes.push(`POST ${path}`)
      },
      put: (path: string, ..._handlers: unknown[]) => {
        routes.push(`PUT ${path}`)
      },
    } as unknown as Application

    const ctx = {
      services: {
        ordenTrabajo: {
          list: vi.fn(),
          getById: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          transition: vi.fn(),
          facturar: vi.fn(),
        },
      },
      writeAudit: vi.fn(),
      prisma: {},
    } as unknown as RestRouteContext

    registerOrdenTrabajoRoutes(app, ctx)

    expect(routes).toEqual(
      expect.arrayContaining([
        'GET /api/ordenes-trabajo',
        'POST /api/ordenes-trabajo',
        'GET /api/ordenes-trabajo/:id',
        'PUT /api/ordenes-trabajo/:id',
        'POST /api/ordenes-trabajo/:id/transicion',
        'POST /api/ordenes-trabajo/:id/facturar',
      ]),
    )
  })
})
