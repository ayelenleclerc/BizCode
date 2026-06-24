import type { NextFunction, Response } from 'express'
import type { ModuleKey } from '@bizcode/types'
import type { AuthenticatedRequest } from '../auth'
import { modulesInclude } from '../services/TenantConfigService'

/**
 * @en Blocks the route when the tenant does not have the module enabled (#223).
 * @es Bloquea la ruta si el tenant no tiene el módulo habilitado (#223).
 * @pt-BR Bloqueia a rota quando o tenant não tem o módulo habilitado (#223).
 */
export function requireModule(moduleKey: ModuleKey) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    if (!modulesInclude(req.tenantModules, moduleKey)) {
      res.status(403).json({
        success: false,
        error: 'module_not_enabled',
        module: moduleKey,
      })
      return
    }
    next()
  }
}
