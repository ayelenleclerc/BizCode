/**
 * @en `FiscalProviderConfigService` tests (#378, ADR-0018): dual-read/dual-write between
 *   the legacy `TenantFiscalConfig` table and the new `FiscalProviderConfig` table for
 *   `arca_wsfe`, capability listing, and default-provider resolution.
 * @es Tests de `FiscalProviderConfigService` (#378, ADR-0018): lectura/escritura dual
 *   entre la tabla legada `TenantFiscalConfig` y la nueva `FiscalProviderConfig` para
 *   `arca_wsfe`, listado de capacidades y resolución del proveedor por defecto.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { FiscalProviderConfigService } from '../../../apps/server/fiscal/FiscalProviderConfigService'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import { clearFiscalProviderRegistry } from '../../../apps/server/fiscal/fiscalProviderRegistry'
import { resetFiscalProvidersBootstrap } from '../../../apps/server/fiscal/bootstrapFiscalProviders'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    fiscalProviderConfig: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    tenantFiscalConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('FiscalProviderConfigService', () => {
  let prisma: PrismaClient
  let service: FiscalProviderConfigService

  beforeEach(() => {
    clearFiscalProviderRegistry()
    resetFiscalProvidersBootstrap()
    prisma = buildPrismaMock()
    service = new FiscalProviderConfigService(prisma)
  })

  it('getCapabilities lists every registered provider without requiring tenant context', () => {
    const capabilities = service.getCapabilities()
    expect(capabilities.map((c) => c.provider).sort()).toEqual(['arca_wsfe', 'mexico_sat_pac', 'uruguay_dgi'].sort())
  })

  it('getStatus falls back to legacy TenantFiscalConfig for arca_wsfe when no FiscalProviderConfig row exists', async () => {
    prisma = buildPrismaMock({
      tenantFiscalConfig: {
        findUnique: vi.fn().mockResolvedValue({ cuit: '20123456789', ambiente: 'homologacion' }),
        upsert: vi.fn(),
      },
    })
    service = new FiscalProviderConfigService(prisma)

    const result = await service.getStatus(1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      const arca = result.data.find((entry) => entry.provider === 'arca_wsfe')
      expect(arca?.configured).toBe(true)
      expect(arca?.isDefault).toBe(true)
      expect(arca?.taxIdentifier).toBe('20123456789')
      const dgi = result.data.find((entry) => entry.provider === 'uruguay_dgi')
      expect(dgi?.configured).toBe(false)
    }
  })

  it('getStatus prefers the FiscalProviderConfig row over the legacy table once migrated', async () => {
    prisma = buildPrismaMock({
      fiscalProviderConfig: {
        findMany: vi.fn().mockResolvedValue([
          {
            providerCode: 'arca_wsfe',
            enabled: true,
            isDefault: true,
            environment: 'produccion',
            taxIdentifier: '20999999999',
            legalName: 'Demo SA',
            pointOfSale: '0001',
            lastValidationAt: null,
            validationStatus: 'valid',
          },
        ]),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        upsert: vi.fn(),
        updateMany: vi.fn(),
      },
      tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue({ cuit: '20123456789' }), upsert: vi.fn() },
    })
    service = new FiscalProviderConfigService(prisma)

    const result = await service.getStatus(1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      const arca = result.data.find((entry) => entry.provider === 'arca_wsfe')
      expect(arca?.environment).toBe('produccion')
      expect(arca?.taxIdentifier).toBe('20999999999')
    }
    expect(prisma.tenantFiscalConfig.findUnique).not.toHaveBeenCalled()
  })

  it('getArcaConfigStatus delegates to ArcaService and never leaks secrets', async () => {
    prisma = buildPrismaMock({
      tenantFiscalConfig: {
        findUnique: vi.fn().mockResolvedValue({
          cuit: '20123456789',
          ambiente: 'homologacion',
          certEncrypted: encryptFiscalSecret('cert'),
          keyEncrypted: encryptFiscalSecret('key'),
        }),
        upsert: vi.fn(),
      },
    })
    service = new FiscalProviderConfigService(prisma)

    const status = await service.getArcaConfigStatus(1)
    expect(status).toEqual({ configured: true, cuit: '20123456789', ambiente: 'homologacion' })
    expect(status).not.toHaveProperty('certEncrypted')
  })

  it('upsertArcaConfig dual-writes TenantFiscalConfig and FiscalProviderConfig with an encrypted bundle', async () => {
    const result = await service.upsertArcaConfig(1, {
      cuit: '20123456789',
      certificate: 'CERT',
      privateKey: 'KEY',
      ambiente: 'homologacion',
    })

    expect(result).toEqual({ ok: true, data: { id: 1 } })
    expect(prisma.tenantFiscalConfig.upsert).toHaveBeenCalled()
    expect(prisma.fiscalProviderConfig.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ providerCode: 'arca_wsfe', countryCode: 'AR', isDefault: true }),
      }),
    )
    const call = vi.mocked(prisma.fiscalProviderConfig.upsert).mock.calls[0]?.[0] as {
      create: { encryptedConfig: string }
    }
    expect(call.create.encryptedConfig).not.toMatch(/CERT|KEY/)
    const decrypted = FiscalProviderConfigService.decryptArcaBundle(call.create.encryptedConfig)
    expect(decrypted).toEqual({ cuit: '20123456789', certificate: 'CERT', privateKey: 'KEY', ambiente: 'homologacion' })
  })

  it('resolveDefaultProvider prefers an explicit isDefault FiscalProviderConfig row', async () => {
    prisma = buildPrismaMock({
      fiscalProviderConfig: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ providerCode: 'arca_wsfe' }),
        upsert: vi.fn(),
        updateMany: vi.fn(),
      },
    })
    service = new FiscalProviderConfigService(prisma)

    const result = await service.resolveDefaultProvider(1)
    expect(result).toEqual({ ok: true, data: 'arca_wsfe' })
  })

  it('resolveDefaultProvider falls back to arca_wsfe when only the legacy table has a row', async () => {
    prisma = buildPrismaMock({ tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue({ cuit: '1' }), upsert: vi.fn() } })
    service = new FiscalProviderConfigService(prisma)

    const result = await service.resolveDefaultProvider(1)
    expect(result).toEqual({ ok: true, data: 'arca_wsfe' })
  })

  it('resolveDefaultProvider fails when the tenant has no fiscal configuration at all', async () => {
    const result = await service.resolveDefaultProvider(1)
    expect(result).toEqual({ ok: false, status: 422, error: 'FISCAL_PROVIDER_NOT_CONFIGURED' })
  })

  describe('resolveDefaultProvider by tax jurisdiction (#207)', () => {
    it('picks the enabled config matching the tenant country when no row is marked as default', async () => {
      prisma = buildPrismaMock({
        fiscalProviderConfig: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          findFirst: vi
            .fn()
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ providerCode: 'uruguay_dgi' }),
          upsert: vi.fn(),
          updateMany: vi.fn(),
        },
        tenantConfig: { findUnique: vi.fn().mockResolvedValue({ jurisdiccionFiscal: 'UY' }) },
      })
      service = new FiscalProviderConfigService(prisma)

      const result = await service.resolveDefaultProvider(1)
      expect(result).toEqual({ ok: true, data: 'uruguay_dgi' })
      expect(prisma.fiscalProviderConfig.findFirst).toHaveBeenLastCalledWith({
        where: { tenantId: 1, enabled: true, countryCode: 'UY' },
      })
    })

    it('does not fall back to the Argentine legacy table for a non-Argentine tenant', async () => {
      prisma = buildPrismaMock({
        tenantFiscalConfig: {
          findUnique: vi.fn().mockResolvedValue({ cuit: '1' }),
          upsert: vi.fn(),
        },
        tenantConfig: { findUnique: vi.fn().mockResolvedValue({ jurisdiccionFiscal: 'UY' }) },
      })
      service = new FiscalProviderConfigService(prisma)

      const result = await service.resolveDefaultProvider(1)
      expect(result).toEqual({ ok: false, status: 422, error: 'FISCAL_PROVIDER_NOT_CONFIGURED' })
      expect(prisma.tenantFiscalConfig.findUnique).not.toHaveBeenCalled()
    })

    it('treats an unknown persisted jurisdiction as Argentina', async () => {
      prisma = buildPrismaMock({
        tenantFiscalConfig: {
          findUnique: vi.fn().mockResolvedValue({ cuit: '1' }),
          upsert: vi.fn(),
        },
        tenantConfig: { findUnique: vi.fn().mockResolvedValue({ jurisdiccionFiscal: 'ZZ' }) },
      })
      service = new FiscalProviderConfigService(prisma)

      const result = await service.resolveDefaultProvider(1)
      expect(result).toEqual({ ok: true, data: 'arca_wsfe' })
    })
  })

  it('validateConfiguration records the validation outcome without a registered provider', async () => {
    const result = await service.validateConfiguration(1, 'arca_wsfe')
    expect(result.ok).toBe(true)
    expect(prisma.fiscalProviderConfig.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ validationStatus: 'valid' }) }),
    )
  })
})
