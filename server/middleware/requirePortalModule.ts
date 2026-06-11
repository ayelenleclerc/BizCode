import type { NextFunction, Response } from 'express'
import type { ModuleKey } from '../../src/lib/modules'
import { modulesInclude } from '../services/TenantConfigService'
import type { PortalRequest } from '../portal/portalTypes'

/**
 * @en Blocks portal routes when the tenant module is disabled (#240).
 * @es Bloquea rutas del portal si el módulo del tenant está deshabilitado (#240).
 * @pt-BR Bloqueia rotas do portal quando o módulo do tenant está desabilitado (#240).
 */
export function requirePortalModule(moduleKey: ModuleKey) {
  return (req: PortalRequest, res: Response, next: NextFunction): void => {
    const modules = req.portalTenant?.modules ?? []
    if (!modulesInclude(modules, moduleKey)) {
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
