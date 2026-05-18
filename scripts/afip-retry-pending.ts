import { PrismaClient } from '@prisma/client'
import { AfipService } from '../server/fiscal/ar/AfipService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  if (!tenantIdRaw) {
    console.error('Set BIZCODE_TENANT_ID')
    process.exit(1)
  }
  const prisma = new PrismaClient()
  const afip = new AfipService(prisma)
  try {
    console.log(JSON.stringify(await afip.retryPending(Number.parseInt(tenantIdRaw, 10))))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
