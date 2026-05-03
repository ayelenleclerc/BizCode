import type { PrismaClient } from '@prisma/client'
import { hashPassword } from '../server/passwordHash'
import { USER_CHANNELS } from '../src/lib/rbac'

export const SUPERADMIN_SEED_TENANT_SLUG = 'platform'
export const SUPERADMIN_SEED_TENANT_NAME = 'Platform'
export const SUPERADMIN_SEED_USERNAME = 'ayelen'

/**
 * @en Idempotent SuperAdmin seed: upserts tenant `platform` and user `ayelen` with role `super_admin`. Requires `BIZCODE_SEED_SUPERADMIN_PASSWORD` in `env` (min 8 characters).
 * @es Seed idempotente de SuperAdmin: upsert del tenant `platform` y usuario `ayelen` con rol `super_admin`. Exige `BIZCODE_SEED_SUPERADMIN_PASSWORD` en `env` (mín. 8 caracteres).
 * @pt-BR Seed idempotente do SuperAdmin: upsert do tenant `platform` e usuário `ayelen` com papel `super_admin`. Exige `BIZCODE_SEED_SUPERADMIN_PASSWORD` em `env` (mín. 8 caracteres).
 */
export async function runSuperAdminSeed(args: {
  prisma: PrismaClient
  env: NodeJS.ProcessEnv
}): Promise<void> {
  const raw = args.env.BIZCODE_SEED_SUPERADMIN_PASSWORD
  if (raw === undefined || !raw.trim()) {
    throw new Error(
      'BIZCODE_SEED_SUPERADMIN_PASSWORD must be set in .env before seeding (minimum 8 characters). See .env.example.',
    )
  }
  const rawPassword = raw.trim()
  if (rawPassword.length < 8) {
    throw new Error('BIZCODE_SEED_SUPERADMIN_PASSWORD must be at least 8 characters.')
  }

  const tenant = await args.prisma.tenant.upsert({
    where: { slug: SUPERADMIN_SEED_TENANT_SLUG },
    create: { name: SUPERADMIN_SEED_TENANT_NAME, slug: SUPERADMIN_SEED_TENANT_SLUG, active: true },
    update: { name: SUPERADMIN_SEED_TENANT_NAME, active: true },
  })

  const passwordHash = hashPassword(rawPassword)
  const channelList = [...USER_CHANNELS]

  await args.prisma.appUser.upsert({
    where: {
      tenantId_username: { tenantId: tenant.id, username: SUPERADMIN_SEED_USERNAME },
    },
    create: {
      tenantId: tenant.id,
      username: SUPERADMIN_SEED_USERNAME,
      passwordHash,
      role: 'super_admin',
      active: true,
      scopeChannels: channelList,
    },
    update: {
      passwordHash,
      role: 'super_admin',
      active: true,
      scopeChannels: channelList,
    },
  })
}
