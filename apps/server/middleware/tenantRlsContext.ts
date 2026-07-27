import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { runWithTenantRlsContext } from '../lib/tenantRls'

/**
 * @en Binds `req.tenantId` into AsyncLocalStorage for Prisma RLS `set_config` helpers.
 * @es Enlaza `req.tenantId` en AsyncLocalStorage para helpers Prisma RLS `set_config`.
 * @pt-BR Liga `req.tenantId` ao AsyncLocalStorage para helpers Prisma RLS `set_config`.
 */
export function tenantRlsContext(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const tenantId =
    typeof req.tenantId === 'number' && Number.isInteger(req.tenantId) && req.tenantId > 0
      ? req.tenantId
      : null
  runWithTenantRlsContext(tenantId, () => {
    next()
  })
}
