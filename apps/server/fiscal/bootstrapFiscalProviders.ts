/**
 * @en Registers built-in fiscal provider adapter factories (ARCA/MX/UY/CL/BR homologación mocks)
 *   (#378/#210/#207/#208/#211). Mirrors `bootstrapEcommerceConnectors.ts`.
 * @es Registra factories built-in de adapters fiscales (mocks de homologación ARCA/MX/UY/CL/BR)
 *   (#378/#210/#207/#208/#211). Refleja `bootstrapEcommerceConnectors.ts`.
 * @pt-BR Registra factories built-in de adapters fiscais (mocks de homologação ARCA/MX/UY/CL/BR)
 *   (#378/#210/#207/#208/#211). Reflete `bootstrapEcommerceConnectors.ts`.
 */

import { registerFiscalProviderAdapterFactory } from './fiscalProviderRegistry'
import { ArcaFiscalAdapter } from './arca/ArcaFiscalAdapter'
import { UruguayDgiFiscalAdapter } from './uy/UruguayDgiFiscalAdapter'
import { ChileSiiFiscalAdapter } from './cl/ChileSiiFiscalAdapter'
import { MexicoSatFiscalAdapter } from './mx/MexicoSatFiscalAdapter'
import { BrazilSefazNfeFiscalAdapter } from './br/BrazilSefazNfeFiscalAdapter'

let bootstrapped = false

/** @en Idempotent bootstrap of default fiscal provider adapter factories. */
export function bootstrapFiscalProviders(): void {
  if (bootstrapped) return
  registerFiscalProviderAdapterFactory('arca_wsfe', (prisma) => new ArcaFiscalAdapter(prisma))
  registerFiscalProviderAdapterFactory('uruguay_dgi', (prisma) => new UruguayDgiFiscalAdapter(prisma))
  registerFiscalProviderAdapterFactory('chile_sii', (prisma) => new ChileSiiFiscalAdapter(prisma))
  registerFiscalProviderAdapterFactory('mexico_sat_pac', (prisma) => new MexicoSatFiscalAdapter(prisma))
  registerFiscalProviderAdapterFactory('brazil_sefaz_nfe', (prisma) => new BrazilSefazNfeFiscalAdapter(prisma))
  bootstrapped = true
}

/** @en Test helper. */
export function resetFiscalProvidersBootstrap(): void {
  bootstrapped = false
}
