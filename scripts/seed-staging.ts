import { config } from 'dotenv'
import { Prisma, PrismaClient } from '@prisma/client'
import { NEW_TENANT_MODULES } from '../apps/web/src/lib/modules/tenantDefaults'
import {
  assertSafeStagingDatabaseUrl,
  resolveStagingSeedTargetUrl,
} from './lib/stagingDbGuard'

config()

export const STAGING_SEED_TENANT_SLUG = 'staging-demo'
export const STAGING_SEED_TENANT_NAME = 'Staging Demo'
export const STAGING_SEED_CLIENTE_CODIGO = 900001
export const STAGING_SEED_CLIENTE_RSOCIAL = 'Cliente Sintetico SA'
export const STAGING_SEED_RUBRO_CODIGO = 9001

/**
 * @en Idempotent synthetic staging fixtures (no real PII). Aborts if target looks like production (#152).
 * @es Fixtures sintéticos idempotentes de staging (sin PII real). Aborta si el target parece producción (#152).
 * @pt-BR Fixtures sintéticos idempotentes de staging (sem PII real). Aborta se o alvo parecer produção (#152).
 */
async function main(): Promise<void> {
  const targetUrl = resolveStagingSeedTargetUrl(process.env)
  const guard = assertSafeStagingDatabaseUrl({
    targetUrl,
    stagingUrl: process.env.STAGING_DATABASE_URL,
    prodUrl: process.env.PROD_DATABASE_URL,
    prodHostsDenylist: process.env.BIZCODE_PROD_DB_HOSTS,
  })
  if (!guard.ok) {
    console.error(`[seed-staging] ${guard.reason}`)
    process.exit(1)
  }

  process.env.DATABASE_URL = guard.targetUrl
  const prisma = new PrismaClient()

  try {
    const tenant = await prisma.tenant.upsert({
      where: { slug: STAGING_SEED_TENANT_SLUG },
      create: {
        name: STAGING_SEED_TENANT_NAME,
        slug: STAGING_SEED_TENANT_SLUG,
        active: true,
      },
      update: { name: STAGING_SEED_TENANT_NAME, active: true },
    })

    await prisma.tenantConfig.upsert({
      where: { tenantId: tenant.id },
      create: {
        tenantId: tenant.id,
        businessType: 'ambos',
        rubros: [],
        plan: 'pro',
        modules: [...NEW_TENANT_MODULES],
        integrations: [],
      },
      update: {},
    })

    await prisma.rubro.upsert({
      where: {
        tenantId_codigo: { tenantId: tenant.id, codigo: STAGING_SEED_RUBRO_CODIGO },
      },
      create: {
        tenantId: tenant.id,
        codigo: STAGING_SEED_RUBRO_CODIGO,
        nombre: 'Rubro Sintetico',
      },
      update: { nombre: 'Rubro Sintetico' },
    })

    await prisma.cliente.upsert({
      where: {
        tenantId_codigo: { tenantId: tenant.id, codigo: STAGING_SEED_CLIENTE_CODIGO },
      },
      create: {
        tenantId: tenant.id,
        codigo: STAGING_SEED_CLIENTE_CODIGO,
        rsocial: STAGING_SEED_CLIENTE_RSOCIAL,
        fantasia: 'Demo Staging',
        cuit: '20000000000',
        condIva: 'CF',
        email: 'staging-demo@example.invalid',
        activo: true,
      },
      update: {
        rsocial: STAGING_SEED_CLIENTE_RSOCIAL,
        fantasia: 'Demo Staging',
        email: 'staging-demo@example.invalid',
        activo: true,
      },
    })

    console.info(
      `[seed-staging] OK tenant="${STAGING_SEED_TENANT_SLUG}" cliente codigo=${STAGING_SEED_CLIENTE_CODIGO} (synthetic).`,
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e: unknown) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2021') {
    console.error(
      '\n[seed-staging] Missing Prisma tables (P2021). Apply schema first:\n' +
        '  npx prisma migrate deploy\n' +
        '  (or local: npx prisma db push)\n',
    )
  } else {
    console.error(e)
  }
  process.exit(1)
})
