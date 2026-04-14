import { randomBytes } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { bootstrapSuperAdmin } from '../../scripts/bootstrap-superadmin'

function buildPrismaMock(existingUser: boolean, adminUsername: string): PrismaClient {
  return {
    tenant: {
      upsert: vi.fn().mockResolvedValue({ id: 22, slug: 'bizcode', name: 'BizCode', active: true }),
    },
    appUser: {
      findUnique: vi.fn().mockResolvedValue(
        existingUser
          ? {
              id: 9,
              tenantId: 22,
              username: adminUsername,
              role: 'super_admin',
              active: true,
            }
          : null,
      ),
      create: vi.fn().mockResolvedValue({
        id: 9,
        tenantId: 22,
        username: adminUsername,
        role: 'super_admin',
        active: true,
      }),
    },
    auditEvent: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
  } as unknown as PrismaClient
}

describe('bootstrapSuperAdmin', () => {
  let adminUsername: string
  let adminSecret: string

  beforeEach(() => {
    adminUsername = `u${randomBytes(6).toString('hex')}`
    adminSecret = randomBytes(18).toString('hex')
  })

  it('creates super admin when user does not exist', async () => {
    const prisma = buildPrismaMock(false, adminUsername)
    const result = await bootstrapSuperAdmin({
      prisma,
      env: {
        BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME: adminUsername,
        BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD: adminSecret,
      },
    })

    expect(result).toBe('created')
    expect(prisma.appUser.create).toHaveBeenCalledTimes(1)
    expect(prisma.auditEvent.create).toHaveBeenCalledTimes(1)
  })

  it('is idempotent when super admin already exists', async () => {
    const prisma = buildPrismaMock(true, adminUsername)
    const result = await bootstrapSuperAdmin({
      prisma,
      env: {
        BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME: adminUsername,
        BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD: adminSecret,
      },
    })

    expect(result).toBe('existing')
    expect(prisma.appUser.create).not.toHaveBeenCalled()
  })
})
