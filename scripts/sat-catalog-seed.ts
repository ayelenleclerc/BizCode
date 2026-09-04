/**
 * @en Seeds curated SAT CFDI catalog fixtures into SatCatalogEntry (#210).
 * @es Siembra el subconjunto curado del catálogo SAT CFDI en SatCatalogEntry (#210).
 * @pt-BR Semeia o subconjunto curado do catálogo SAT CFDI em SatCatalogEntry (#210).
 *
 * Usage: `pnpm exec tsx scripts/sat-catalog-seed.ts`
 */

import { PrismaClient } from '@prisma/client'
import { SatCatalogService } from '../apps/server/fiscal/mx/SatCatalogService'

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  try {
    const service = new SatCatalogService(prisma)
    const result = await service.seedCuratedFixtures()
    if (!result.ok) {
      console.error(result.error)
      process.exitCode = 1
      return
    }
    console.log(`SAT catalog seeded: ${result.data.upserted} rows upserted`)
  } finally {
    await prisma.$disconnect()
  }
}

void main()
