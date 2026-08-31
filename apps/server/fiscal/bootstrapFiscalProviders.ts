/**
 * @en Registers built-in fiscal provider adapter factories (ARCA + capability stubs) (#378).
 *   Mirrors `bootstrapEcommerceConnectors.ts`.
 * @es Registra factories built-in de adapters fiscales (ARCA + stubs de capacidades) (#378).
 *   Refleja `bootstrapEcommerceConnectors.ts`.
 * @pt-BR Registra factories built-in de adapters fiscais (ARCA + stubs de capacidades) (#378).
 *   Reflete `bootstrapEcommerceConnectors.ts`.
 */

import { registerFiscalProviderAdapterFactory } from './fiscalProviderRegistry'
import { ArcaFiscalAdapter } from './arca/ArcaFiscalAdapter'
import { UruguayDgiFiscalAdapter } from './stubs/UruguayDgiFiscalAdapter'
import { ChileSiiFiscalAdapter } from './stubs/ChileSiiFiscalAdapter'
import { MexicoSatFiscalAdapter } from './stubs/MexicoSatFiscalAdapter'

let bootstrapped = false

/** @en Idempotent bootstrap of default fiscal provider adapter factories. */
export function bootstrapFiscalProviders(): void {
  if (bootstrapped) return
  registerFiscalProviderAdapterFactory('arca_wsfe', (prisma) => new ArcaFiscalAdapter(prisma))
  registerFiscalProviderAdapterFactory('uruguay_dgi', (prisma) => new UruguayDgiFiscalAdapter(prisma))
  registerFiscalProviderAdapterFactory('chile_sii', (prisma) => new ChileSiiFiscalAdapter(prisma))
  registerFiscalProviderAdapterFactory('mexico_sat_pac', (prisma) => new MexicoSatFiscalAdapter(prisma))
  bootstrapped = true
}

/** @en Test helper. */
export function resetFiscalProvidersBootstrap(): void {
  bootstrapped = false
}
