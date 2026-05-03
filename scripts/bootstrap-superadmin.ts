import 'dotenv/config'
import { randomBytes, scryptSync } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PrismaClient } from '@prisma/client'
import { PrismaClient as PrismaClientImpl } from '@prisma/client'
import { USER_CHANNELS } from '../src/lib/rbac'

const prisma = new PrismaClientImpl()
const TENANT_SLUG = 'platform'
const TENANT_NAME = 'BizCode Platform'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function requiredEnv(name: string, env: NodeJS.ProcessEnv): string {
  const value = env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

export async function bootstrapSuperAdmin(args: {
  prisma: PrismaClient
  env: NodeJS.ProcessEnv
}): Promise<'created' | 'existing'> {
  const configuredUsername = args.env.BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME?.trim() || 'Ayelen'
  const username = configuredUsername.toLowerCase()
  const password = requiredEnv('BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD', args.env)

  const tenant = await args.prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {
      name: TENANT_NAME,
      active: true,
    },
    create: {
      slug: TENANT_SLUG,
      name: TENANT_NAME,
      active: true,
    },
  })

  const existingUser = await args.prisma.appUser.findUnique({
    where: {
      tenantId_username: {
        tenantId: tenant.id,
        username,
      },
    },
  })

  if (existingUser) {
    console.log(`[bootstrap-superadmin] Super admin already exists for tenant "${TENANT_SLUG}".`)
    return 'existing'
  }

  const user = await args.prisma.appUser.create({
    data: {
      tenantId: tenant.id,
      username,
      passwordHash: hashPassword(password),
      role: 'super_admin',
      active: true,
      scopeChannels: [...USER_CHANNELS],
    },
  })

  await args.prisma.auditEvent.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      action: 'bootstrap_super_admin',
      resource: 'user',
      resourceId: String(user.id),
      metadata: {
        username: user.username,
      },
    },
  })

  console.log(`[bootstrap-superadmin] Super admin created: ${user.username}`)
  return 'created'
}

const isDirectRun = process.argv[1] ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false

if (isDirectRun) {
  bootstrapSuperAdmin({ prisma, env: process.env })
    .catch((error: unknown) => {
      console.error(error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
