import { PrismaClient } from '@prisma/client'
import { ArcaService } from '../server/fiscal/ar/ArcaService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  if (!tenantIdRaw) {
    console.error('Set BIZCODE_TENANT_ID')
    process.exit(1)
  }
  const prisma = new PrismaClient()
  const arca = new ArcaService(prisma)
  try {
    console.log(JSON.stringify(await arca.retryPending(Number.parseInt(tenantIdRaw, 10))))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
