import type { FiscalJurisdictionCode, ModuleKey } from '@bizcode/types'
import { getDefaultModulesForJurisdiction } from '@bizcode/types'
import { resolveDefaultJurisdiction } from '../../web/src/lib/modules/jurisdictionEnv'

/**
 * @en Fiscal defaults every tenant creation path must persist (#437): the jurisdiction comes from the
 *   installation environment instead of relying on the `'AR'` column default, and the starting module
 *   set is derived from that jurisdiction so a non-Argentine tenant never starts with ARCA modules.
 * @es Valores fiscales por defecto que todo camino de alta de tenant debe persistir (#437): la
 *   jurisdicción proviene del entorno de instalación en lugar de depender del default `'AR'` de la
 *   columna, y el conjunto inicial de módulos se deriva de esa jurisdicción para que un tenant no
 *   argentino nunca arranque con módulos de ARCA.
 * @pt-BR Valores fiscais padrão que todo caminho de criação de tenant deve persistir (#437): a
 *   jurisdição vem do ambiente de instalação em vez de depender do padrão `'AR'` da coluna, e o
 *   conjunto inicial de módulos é derivado dessa jurisdição para que um tenant não argentino nunca
 *   comece com módulos da ARCA.
 */
export type NewTenantFiscalDefaults = {
  jurisdiccionFiscal: FiscalJurisdictionCode
  modules: ModuleKey[]
}

export function buildNewTenantFiscalDefaults(
  jurisdiccionFiscal?: FiscalJurisdictionCode,
  env: NodeJS.ProcessEnv = process.env,
): NewTenantFiscalDefaults {
  const resolved = jurisdiccionFiscal ?? resolveDefaultJurisdiction(env)
  return {
    jurisdiccionFiscal: resolved,
    modules: [...getDefaultModulesForJurisdiction(resolved)],
  }
}
