import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'

/**
 * @en Attaches `req.tenantId` from the authenticated session when present.
 * @es Adjunta `req.tenantId` desde la sesión autenticada cuando existe.
 * @pt-BR Anexa `req.tenantId` a partir da sessão autenticada quando presente.
 */
export function tenantContext(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const tenantId = req.auth?.claims.tenantId
  if (typeof tenantId === 'number' && Number.isInteger(tenantId) && tenantId > 0) {
    req.tenantId = tenantId
  }
  next()
}
