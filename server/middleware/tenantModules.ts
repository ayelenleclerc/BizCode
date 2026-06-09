import type { NextFunction, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { NEW_TENANT_MODULES, type ModuleKey } from '../../src/lib/modules'
import type { AuthenticatedRequest } from '../auth'
import { TenantConfigService } from '../services/TenantConfigService'

function parseTestModulesFromEnv(): ModuleKey[] | undefined {
  if (process.env.NODE_ENV !== 'test') {
    return undefined
  }
  const raw = process.env.BIZCODE_TEST_MODULES?.trim()
  if (!raw) {
    return undefined
  }
  const keys = raw.split(',').map((s) => s.trim()).filter(Boolean)
  return keys as ModuleKey[]
}

const TEST_DEFAULT_MODULES: ModuleKey[] = [
  ...NEW_TENANT_MODULES,
  'billing.orders',
  'logistics.dispatches',
  'logistics.picking',
  'logistics.gps',
  'billing.credit_notes',
  'billing.arca_cae',
  'finance.ledger',
  'finance.retenciones',
  'logistics.purchases',
]

/**
 * @en Loads enabled modules for the authenticated tenant onto `req.tenantModules`.
 * @es Carga módulos habilitados del tenant autenticado en `req.tenantModules`.
 * @pt-BR Carrega módulos habilitados do tenant autenticado em `req.tenantModules`.
 */
export function tenantModules(prisma: PrismaClient) {
  const service = new TenantConfigService(prisma)
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const tenantId = req.tenantId ?? req.auth?.claims.tenantId
    if (typeof tenantId !== 'number' || tenantId <= 0 || !req.auth) {
      next()
      return
    }

    if (process.env.NODE_ENV === 'test' && process.env.BIZCODE_TEST_AUTH_BYPASS !== 'false') {
      const fromEnv = parseTestModulesFromEnv()
      req.tenantModules = fromEnv ?? TEST_DEFAULT_MODULES
      next()
      return
    }

    try {
      const { modules } = await service.getFeaturesForTenant(tenantId)
      req.tenantModules = modules
    } catch {
      req.tenantModules = [...NEW_TENANT_MODULES]
    }
    next()
  }
}
