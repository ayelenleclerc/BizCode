import { config } from 'dotenv'
import { Prisma, PrismaClient } from '@prisma/client'
import { hashPassword } from '../server/passwordHash'
import { USER_CHANNELS } from '../src/lib/rbac'

config()

const prisma = new PrismaClient()

const TENANT_SLUG = 'platform'
const TENANT_NAME = 'Platform'
const SUPERADMIN_USERNAME = 'ayelen'

/**
 * @en Idempotent seed: platform tenant + SuperAdmin (`ayelen`) for local/dev login. Requires `BIZCODE_SEED_SUPERADMIN_PASSWORD` in `.env` (min 8 chars; see `.env.example`).
 * @es Seed idempotente: tenant platform + SuperAdmin (`ayelen`) para login local/dev. Exige `BIZCODE_SEED_SUPERADMIN_PASSWORD` en `.env` (mín. 8 caracteres; véase `.env.example`).
 * @pt-BR Seed idempotente: tenant platform + SuperAdmin (`ayelen`) para login local/dev. Exige `BIZCODE_SEED_SUPERADMIN_PASSWORD` no `.env` (mín. 8 caracteres; ver `.env.example`).
 */
async function main(): Promise<void> {
  const raw = process.env.BIZCODE_SEED_SUPERADMIN_PASSWORD
  if (raw === undefined || !raw.trim()) {
    throw new Error(
      'BIZCODE_SEED_SUPERADMIN_PASSWORD must be set in .env before seeding (minimum 8 characters). See .env.example.',
    )
  }
  const rawPassword = raw.trim()
  if (rawPassword.length < 8) {
    throw new Error('BIZCODE_SEED_SUPERADMIN_PASSWORD must be at least 8 characters.')
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    create: { name: TENANT_NAME, slug: TENANT_SLUG, active: true },
    update: { name: TENANT_NAME, active: true },
  })

  const passwordHash = hashPassword(rawPassword)
  const channelList = [...USER_CHANNELS]

  await prisma.appUser.upsert({
    where: {
      tenantId_username: { tenantId: tenant.id, username: SUPERADMIN_USERNAME },
    },
    create: {
      tenantId: tenant.id,
      username: SUPERADMIN_USERNAME,
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

  // eslint-disable-next-line no-console -- seed feedback for developers
  console.info(`[seed] Tenant "${TENANT_SLUG}" and SuperAdmin "${SUPERADMIN_USERNAME}" are ready.`)
}

main()
  .catch((e: unknown) => {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2021') {
      // eslint-disable-next-line no-console -- seed diagnostics
      console.error(
        '\n[seed] La base no tiene tablas de Prisma (P2021). Aplica el esquema antes del seed:\n' +
          '  npx prisma migrate dev --name init\n' +
          '  (solo dev, sin historial de migraciones: npx prisma db push)\n' +
          'Luego: npx prisma db seed\n',
      )
    } else {
      console.error(e)
    }
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
