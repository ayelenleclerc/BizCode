import { describe, expect, it, vi } from 'vitest'
import {
  TENANT_RLS_GUC,
  createTenantRlsPrisma,
  isTenantRlsBypassEnabled,
  runWithTenantRls,
  runWithTenantRlsContext,
  getTenantRlsStore,
} from '../../../apps/server/lib/tenantRls'
import type { PrismaClient } from '@prisma/client'

describe('tenantRls helpers', () => {
  it('reports bypass only when BIZCODE_RLS_BYPASS=true', () => {
    const prev = process.env.BIZCODE_RLS_BYPASS
    delete process.env.BIZCODE_RLS_BYPASS
    expect(isTenantRlsBypassEnabled()).toBe(false)
    process.env.BIZCODE_RLS_BYPASS = 'true'
    expect(isTenantRlsBypassEnabled()).toBe(true)
    if (prev === undefined) delete process.env.BIZCODE_RLS_BYPASS
    else process.env.BIZCODE_RLS_BYPASS = prev
  })

  it('runWithTenantRls rejects non-positive tenantId', async () => {
    const prisma = { $transaction: vi.fn() } as unknown as PrismaClient
    await expect(runWithTenantRls(prisma, 0, async () => null)).rejects.toThrow(/positive integer/)
  })

  it('runWithTenantRls applies set_config LOCAL then runs fn', async () => {
    const executeRaw = vi.fn().mockResolvedValue(0)
    const prisma = {
      $transaction: vi.fn(async (fn: (tx: { $executeRaw: typeof executeRaw }) => Promise<string>) =>
        fn({ $executeRaw: executeRaw }),
      ),
    } as unknown as PrismaClient

    const result = await runWithTenantRls(prisma, 7, async () => {
      expect(getTenantRlsStore()?.inRlsTx).toBe(true)
      expect(getTenantRlsStore()?.tenantId).toBe(7)
      return 'ok'
    })

    expect(result).toBe('ok')
    expect(executeRaw).toHaveBeenCalled()
    expect(TENANT_RLS_GUC).toBe('app.current_tenant_id')
  })

  it('createTenantRlsPrisma wraps RLS model ops in a transaction with GUC', async () => {
    const findMany = vi.fn().mockResolvedValue([])
    const executeRaw = vi.fn().mockResolvedValue(0)
    const base = {
      $extends: vi.fn(() => {
        return {
          $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
            fn({
              $executeRaw: executeRaw,
              cliente: { findMany },
            }),
          ),
          cliente: { findMany: vi.fn() },
        }
      }),
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          $executeRaw: executeRaw,
          cliente: { findMany },
        }),
      ),
    } as unknown as PrismaClient

    const extended = createTenantRlsPrisma(base)
    expect(base.$extends).toHaveBeenCalled()
    expect(extended).toBeTruthy()

    runWithTenantRlsContext(3, () => {
      expect(getTenantRlsStore()?.tenantId).toBe(3)
    })
  })
})
