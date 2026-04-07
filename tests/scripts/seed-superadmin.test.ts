import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import {
  runSuperAdminSeed,
  SUPERADMIN_SEED_TENANT_SLUG,
  SUPERADMIN_SEED_TENANT_NAME,
  SUPERADMIN_SEED_USERNAME,
} from '../../prisma/seedSuperAdmin'
import { verifyPassword } from '../../server/passwordHash'
import { USER_CHANNELS } from '../../src/lib/rbac'

function buildPrismaMock(tenantId = 7): PrismaClient {
  const tenant = {
    id: tenantId,
    slug: SUPERADMIN_SEED_TENANT_SLUG,
    name: SUPERADMIN_SEED_TENANT_NAME,
    active: true,
  }
  return {
    tenant: {
      upsert: vi.fn().mockResolvedValue(tenant),
    },
    appUser: {
      upsert: vi.fn().mockResolvedValue({ id: 2 }),
    },
  } as unknown as PrismaClient
}

describe('runSuperAdminSeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when BIZCODE_SEED_SUPERADMIN_PASSWORD is missing', async () => {
    const prisma = buildPrismaMock()
    await expect(runSuperAdminSeed({ prisma, env: {} })).rejects.toThrow(
      /BIZCODE_SEED_SUPERADMIN_PASSWORD must be set/,
    )
    expect(prisma.tenant.upsert).not.toHaveBeenCalled()
  })

  it('throws when BIZCODE_SEED_SUPERADMIN_PASSWORD is only whitespace', async () => {
    const prisma = buildPrismaMock()
    await expect(
      runSuperAdminSeed({ prisma, env: { BIZCODE_SEED_SUPERADMIN_PASSWORD: '   ' } }),
    ).rejects.toThrow(/BIZCODE_SEED_SUPERADMIN_PASSWORD must be set/)
  })

  it('throws when password is shorter than 8 characters', async () => {
    const prisma = buildPrismaMock()
    await expect(
      runSuperAdminSeed({ prisma, env: { BIZCODE_SEED_SUPERADMIN_PASSWORD: 'short' } }),
    ).rejects.toThrow(/at least 8 characters/)
    expect(prisma.tenant.upsert).not.toHaveBeenCalled()
  })

  it('upserts tenant and super admin with a password hash that verifyPassword accepts', async () => {
    const prisma = buildPrismaMock()
    const secret = 'longEnough1'
    await runSuperAdminSeed({ prisma, env: { BIZCODE_SEED_SUPERADMIN_PASSWORD: secret } })

    expect(prisma.tenant.upsert).toHaveBeenCalledWith({
      where: { slug: SUPERADMIN_SEED_TENANT_SLUG },
      create: {
        name: SUPERADMIN_SEED_TENANT_NAME,
        slug: SUPERADMIN_SEED_TENANT_SLUG,
        active: true,
      },
      update: { name: SUPERADMIN_SEED_TENANT_NAME, active: true },
    })

    expect(prisma.appUser.upsert).toHaveBeenCalledTimes(1)
    const upsertArg = vi.mocked(prisma.appUser.upsert).mock.calls[0]?.[0]
    expect(upsertArg).toBeDefined()
    if (!upsertArg) {
      return
    }

    const hashCreate = upsertArg.create.passwordHash
    const hashUpdate = upsertArg.update.passwordHash
    expect(hashCreate).toBe(hashUpdate)
    expect(verifyPassword(secret, hashCreate)).toBe(true)

    expect(upsertArg.create).toMatchObject({
      tenantId: 7,
      username: SUPERADMIN_SEED_USERNAME,
      role: 'super_admin',
      active: true,
      scopeChannels: [...USER_CHANNELS],
    })
    expect(upsertArg.update).toMatchObject({
      role: 'super_admin',
      active: true,
      scopeChannels: [...USER_CHANNELS],
    })
  })
})
