/**
 * @en Reads/writes per-tenant fiscal provider configuration across the multi-organism
 *   module (#378, ADR-0018). For `arca_wsfe` it dual-writes the legacy `TenantFiscalConfig`
 *   table (via `ArcaService`, unchanged) and the new `FiscalProviderConfig` table, and
 *   dual-reads `TenantFiscalConfig` when no `FiscalProviderConfig` row exists yet
 *   (tenants that have not run the backfill script).
 * @es Lee/escribe la configuración de proveedor fiscal por tenant del módulo
 *   multi-organismo (#378, ADR-0018). Para `arca_wsfe` escribe en dual la tabla legacy
 *   `TenantFiscalConfig` (vía `ArcaService`, sin cambios) y la nueva `FiscalProviderConfig`,
 *   y lee en dual `TenantFiscalConfig` cuando no existe fila `FiscalProviderConfig`
 *   (tenants que no corrieron el script de backfill).
 * @pt-BR Lê/escreve a configuração de provedor fiscal por tenant do módulo
 *   multi-organismo (#378, ADR-0018). Para `arca_wsfe` escreve em dual a tabela legada
 *   `TenantFiscalConfig` (via `ArcaService`, sem mudanças) e a nova `FiscalProviderConfig`,
 *   e lê em dual `TenantFiscalConfig` quando não existe linha `FiscalProviderConfig`
 *   (tenants que não executaram o script de backfill).
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../services/serviceResults'
import { ArcaService, type FiscalConfigInput } from './ar/ArcaService'
import { decryptFiscalSecret, encryptFiscalSecret } from './ar/fiscalSecrets'
import { bootstrapFiscalProviders } from './bootstrapFiscalProviders'
import { getFiscalProviderAdapter, listRegisteredFiscalProviders } from './fiscalProviderRegistry'
import type {
  FiscalCountryCode,
  FiscalEnvironment,
  FiscalProviderCapabilities,
  FiscalProviderCode,
} from './types'

export type FiscalProviderStatusEntry = {
  provider: FiscalProviderCode
  countryCode: FiscalCountryCode
  capabilities: FiscalProviderCapabilities
  configured: boolean
  enabled: boolean
  isDefault: boolean
  environment?: FiscalEnvironment
  taxIdentifier?: string
  legalName?: string
  pointOfSale?: string
  lastValidationAt?: Date | null
  validationStatus?: string | null
}

type ArcaSecretBundle = {
  cuit: string
  certificate: string
  privateKey: string
  ambiente: FiscalEnvironment
}

export class FiscalProviderConfigService {
  private readonly arca: ArcaService

  constructor(private readonly prisma: PrismaClient) {
    bootstrapFiscalProviders()
    this.arca = new ArcaService(prisma)
  }

  /** @en Capability declarations for every registered provider (no tenant context, no secrets). */
  getCapabilities(): FiscalProviderCapabilities[] {
    return listRegisteredFiscalProviders()
      .map((provider) => getFiscalProviderAdapter(provider, this.prisma)?.getCapabilities())
      .filter((c): c is FiscalProviderCapabilities => c !== undefined)
  }

  /** @en Tenant-scoped status for every registered provider (no secrets ever returned). */
  async getStatus(tenantId: number): Promise<ServiceResult<FiscalProviderStatusEntry[]>> {
    const providers = listRegisteredFiscalProviders()
    const rows = await this.prisma.fiscalProviderConfig.findMany({ where: { tenantId } })
    const rowByProvider = new Map(rows.map((row) => [row.providerCode, row]))
    const legacyArca = rowByProvider.has('arca_wsfe')
      ? null
      : await this.prisma.tenantFiscalConfig.findUnique({ where: { tenantId } })

    const entries: FiscalProviderStatusEntry[] = []
    for (const provider of providers) {
      const adapter = getFiscalProviderAdapter(provider, this.prisma)
      if (!adapter) continue
      const row = rowByProvider.get(provider)
      if (row) {
        entries.push({
          provider,
          countryCode: adapter.countryCode,
          capabilities: adapter.getCapabilities(),
          configured: true,
          enabled: row.enabled,
          isDefault: row.isDefault,
          environment: row.environment as FiscalEnvironment,
          taxIdentifier: row.taxIdentifier ?? undefined,
          legalName: row.legalName ?? undefined,
          pointOfSale: row.pointOfSale ?? undefined,
          lastValidationAt: row.lastValidationAt,
          validationStatus: row.validationStatus,
        })
        continue
      }
      if (provider === 'arca_wsfe' && legacyArca) {
        entries.push({
          provider,
          countryCode: adapter.countryCode,
          capabilities: adapter.getCapabilities(),
          configured: true,
          enabled: true,
          isDefault: true,
          environment: legacyArca.ambiente as FiscalEnvironment,
          taxIdentifier: legacyArca.cuit,
        })
        continue
      }
      entries.push({
        provider,
        countryCode: adapter.countryCode,
        capabilities: adapter.getCapabilities(),
        configured: false,
        enabled: false,
        isDefault: false,
      })
    }
    return { ok: true, data: entries }
  }

  /** @en Legacy shape for `GET /api/arca/config` compat (registerArcaRoutes delegates here). */
  async getArcaConfigStatus(tenantId: number): Promise<{ configured: boolean; cuit?: string; ambiente?: string }> {
    return this.arca.getConfigStatus(tenantId)
  }

  /**
   * @en Upserts ARCA credentials: writes the legacy `TenantFiscalConfig` row via
   *   `ArcaService` (unchanged behavior/response), then dual-writes `FiscalProviderConfig`
   *   with a single AES-256-GCM encrypted JSON bundle of the same secrets (#378).
   */
  async upsertArcaConfig(tenantId: number, input: FiscalConfigInput): Promise<ServiceResult<{ id: number }>> {
    const legacyResult = await this.arca.upsertConfig(tenantId, input)
    if (!legacyResult.ok) return legacyResult

    const ambiente: FiscalEnvironment = input.ambiente ?? 'homologacion'
    const bundle: ArcaSecretBundle = {
      cuit: input.cuit.trim(),
      certificate: input.certificate,
      privateKey: input.privateKey,
      ambiente,
    }
    const existing = await this.prisma.fiscalProviderConfig.findUnique({
      where: { tenantId_providerCode: { tenantId, providerCode: 'arca_wsfe' } },
    })
    const anyDefault = await this.prisma.fiscalProviderConfig.findFirst({
      where: { tenantId, isDefault: true },
    })
    const isDefault = existing?.isDefault ?? anyDefault == null

    await this.prisma.fiscalProviderConfig.upsert({
      where: { tenantId_providerCode: { tenantId, providerCode: 'arca_wsfe' } },
      create: {
        tenantId,
        providerCode: 'arca_wsfe',
        countryCode: 'AR',
        environment: ambiente,
        enabled: true,
        isDefault,
        taxIdentifier: bundle.cuit,
        encryptedConfig: encryptFiscalSecret(JSON.stringify(bundle)),
        configVersion: 1,
      },
      update: {
        environment: ambiente,
        enabled: true,
        taxIdentifier: bundle.cuit,
        encryptedConfig: encryptFiscalSecret(JSON.stringify(bundle)),
        configVersion: (existing?.configVersion ?? 0) + 1,
      },
    })

    return legacyResult
  }

  /**
   * @en Resolves which provider handles new authorizations for a tenant: an explicit
   *   `FiscalProviderConfig.isDefault` row, or — for tenants not yet migrated — the
   *   presence of a legacy `TenantFiscalConfig` row (implies `arca_wsfe`).
   */
  async resolveDefaultProvider(tenantId: number): Promise<ServiceResult<FiscalProviderCode>> {
    const row = await this.prisma.fiscalProviderConfig.findFirst({
      where: { tenantId, isDefault: true, enabled: true },
    })
    if (row) return { ok: true, data: row.providerCode as FiscalProviderCode }

    const legacyArca = await this.prisma.tenantFiscalConfig.findUnique({ where: { tenantId } })
    if (legacyArca) return { ok: true, data: 'arca_wsfe' }

    return { ok: false, status: 422, error: 'FISCAL_PROVIDER_NOT_CONFIGURED' }
  }

  /** @en Validates stored credentials for a provider and records the outcome (no secrets returned). */
  async validateConfiguration(
    tenantId: number,
    provider: FiscalProviderCode,
  ): Promise<ServiceResult<{ configured: boolean }>> {
    const adapter = getFiscalProviderAdapter(provider, this.prisma)
    if (!adapter) return { ok: false, status: 404, error: 'FISCAL_PROVIDER_NOT_REGISTERED' }
    const result = await adapter.validateConfiguration(tenantId)
    await this.prisma.fiscalProviderConfig.updateMany({
      where: { tenantId, providerCode: provider },
      data: {
        lastValidationAt: new Date(),
        validationStatus: result.ok ? 'valid' : 'invalid',
        validationError: result.ok ? null : result.error,
      },
    })
    return result
  }

  /**
   * @en Decrypts a stored `FiscalProviderConfig.encryptedConfig` bundle (internal use only,
   *   e.g. adapters that need raw secrets); never expose the return value over HTTP.
   */
  static decryptArcaBundle(encryptedConfig: string): ArcaSecretBundle {
    return JSON.parse(decryptFiscalSecret(encryptedConfig)) as ArcaSecretBundle
  }
}
