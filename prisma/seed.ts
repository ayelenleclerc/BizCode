import { config } from 'dotenv'
import { Prisma, PrismaClient } from '@prisma/client'
import {
  runSuperAdminSeed,
  SUPERADMIN_SEED_TENANT_SLUG,
  SUPERADMIN_SEED_USERNAME,
} from './seedSuperAdmin'

config()

const prisma = new PrismaClient()

/**
 * @en Idempotent seed: platform tenant + SuperAdmin (`ayelen`) for local/dev login. Requires `BIZCODE_SEED_SUPERADMIN_PASSWORD` in `.env` (min 8 chars; see `.env.example`).
 * @es Seed idempotente: tenant platform + SuperAdmin (`ayelen`) para login local/dev. Exige `BIZCODE_SEED_SUPERADMIN_PASSWORD` en `.env` (mín. 8 caracteres; véase `.env.example`).
 * @pt-BR Seed idempotente: tenant platform + SuperAdmin (`ayelen`) para login local/dev. Exige `BIZCODE_SEED_SUPERADMIN_PASSWORD` no `.env` (mín. 8 caracteres; ver `.env.example`).
 */
async function main(): Promise<void> {
  await runSuperAdminSeed({ prisma, env: process.env })

  console.info(`[seed] Tenant "${SUPERADMIN_SEED_TENANT_SLUG}" and SuperAdmin "${SUPERADMIN_SEED_USERNAME}" are ready.`)
}

main()
  .catch((e: unknown) => {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2021') {
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
