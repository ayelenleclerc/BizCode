/**
 * @en Registry + bootstrap tests for the multi-organism fiscal module (#378, ADR-0018).
 * @es Tests de registro + bootstrap del módulo fiscal multi-organismo (#378, ADR-0018).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import {
  clearFiscalProviderRegistry,
  getFiscalProviderAdapter,
  hasFiscalProviderAdapterFactory,
  listRegisteredFiscalProviders,
  registerFiscalProviderAdapterFactory,
} from '../../../apps/server/fiscal/fiscalProviderRegistry'
import { bootstrapFiscalProviders, resetFiscalProvidersBootstrap } from '../../../apps/server/fiscal/bootstrapFiscalProviders'
import { ArcaFiscalAdapter } from '../../../apps/server/fiscal/arca/ArcaFiscalAdapter'
import { UruguayDgiFiscalAdapter } from '../../../apps/server/fiscal/stubs/UruguayDgiFiscalAdapter'
import { MexicoSatFiscalAdapter } from '../../../apps/server/fiscal/mx/MexicoSatFiscalAdapter'
import { ChileSiiFiscalAdapter } from '../../../apps/server/fiscal/stubs/ChileSiiFiscalAdapter'

const prisma = {} as unknown as PrismaClient

describe('fiscalProviderRegistry', () => {
  beforeEach(() => {
    clearFiscalProviderRegistry()
    resetFiscalProvidersBootstrap()
  })

  it('has no registered providers before bootstrap', () => {
    expect(listRegisteredFiscalProviders()).toEqual([])
    expect(hasFiscalProviderAdapterFactory('arca_wsfe')).toBe(false)
    expect(getFiscalProviderAdapter('arca_wsfe', prisma)).toBeNull()
  })

  it('registers a factory and builds an adapter instance via it', () => {
    const factory = vi.fn(() => new UruguayDgiFiscalAdapter(prisma))
    registerFiscalProviderAdapterFactory('uruguay_dgi', factory)

    expect(hasFiscalProviderAdapterFactory('uruguay_dgi')).toBe(true)
    const adapter = getFiscalProviderAdapter('uruguay_dgi', prisma)
    expect(adapter).toBeInstanceOf(UruguayDgiFiscalAdapter)
    expect(factory).toHaveBeenCalledWith(prisma)
  })

  it('returns null for a provider without a registered factory', () => {
    expect(getFiscalProviderAdapter('mexico_sat_pac', prisma)).toBeNull()
  })

  it('clearFiscalProviderRegistry removes every registration', () => {
    registerFiscalProviderAdapterFactory('arca_wsfe', (p) => new ArcaFiscalAdapter(p))
    expect(listRegisteredFiscalProviders()).toEqual(['arca_wsfe'])
    clearFiscalProviderRegistry()
    expect(listRegisteredFiscalProviders()).toEqual([])
  })
})

describe('bootstrapFiscalProviders', () => {
  beforeEach(() => {
    clearFiscalProviderRegistry()
    resetFiscalProvidersBootstrap()
  })

  it('registers arca_wsfe, uruguay_dgi, chile_sii and mexico_sat_pac factories', () => {
    bootstrapFiscalProviders()

    expect(listRegisteredFiscalProviders().sort()).toEqual(
      ['arca_wsfe', 'chile_sii', 'mexico_sat_pac', 'uruguay_dgi'].sort(),
    )
    expect(getFiscalProviderAdapter('arca_wsfe', prisma)).toBeInstanceOf(ArcaFiscalAdapter)
    expect(getFiscalProviderAdapter('uruguay_dgi', prisma)).toBeInstanceOf(UruguayDgiFiscalAdapter)
    expect(getFiscalProviderAdapter('chile_sii', prisma)).toBeInstanceOf(ChileSiiFiscalAdapter)
    expect(getFiscalProviderAdapter('mexico_sat_pac', prisma)).toBeInstanceOf(MexicoSatFiscalAdapter)
  })

  it('is idempotent: calling it twice does not throw or duplicate registrations', () => {
    bootstrapFiscalProviders()
    bootstrapFiscalProviders()
    expect(listRegisteredFiscalProviders().sort()).toEqual(
      ['arca_wsfe', 'chile_sii', 'mexico_sat_pac', 'uruguay_dgi'].sort(),
    )
  })

  it('does nothing after the module-level bootstrap flag is set until reset', () => {
    bootstrapFiscalProviders()
    clearFiscalProviderRegistry()
    bootstrapFiscalProviders()
    expect(listRegisteredFiscalProviders()).toEqual([])

    resetFiscalProvidersBootstrap()
    bootstrapFiscalProviders()
    expect(listRegisteredFiscalProviders().length).toBe(4)
  })
})
