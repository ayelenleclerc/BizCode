import type { PrismaClient } from '@prisma/client'
import {
  estimateTenantMonthlyPrice,
  type TenantMonthlyPriceEstimate,
} from '../../src/lib/modules/pricing'
import { MODULE_KEYS, type ModuleKey } from '../../src/lib/modules'
import { TenantConfigService } from './TenantConfigService'

function isModuleKey(value: string): value is ModuleKey {
  return (MODULE_KEYS as readonly string[]).includes(value)
}

function parseModulesQuery(raw: string | undefined): ModuleKey[] | undefined | null {
  if (raw === undefined || raw.trim() === '') {
    return undefined
  }
  const keys: ModuleKey[] = []
  for (const part of raw.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    if (!isModuleKey(trimmed)) {
      return null
    }
    keys.push(trimmed)
  }
  return keys
}

export { parseModulesQuery }

/**
 * @en Super-admin estimated monthly pricing from tenant plan and modules (#226).
 * @es Precio mensual estimado para super-admin según plan y módulos del tenant (#226).
 * @pt-BR Preço mensal estimado para super-admin por plano e módulos do tenant (#226).
 */
export class TenantPricingService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly configService = new TenantConfigService(prisma),
  ) {}

  async getPricing(
    tenantId: number,
    previewModules?: readonly ModuleKey[],
  ): Promise<TenantMonthlyPriceEstimate | null> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) {
      return null
    }

    let config = await this.configService.getConfig(tenantId)
    if (!config) {
      config = await this.configService.createDefaultForTenant(tenantId)
    }

    const modules = previewModules ?? config.modules
    return estimateTenantMonthlyPrice(config.plan, modules)
  }
}
