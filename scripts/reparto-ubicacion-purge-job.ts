/**
 * @en Purges RepartoUbicacion rows older than retention (#144). Run via cron or manually.
 * @es Elimina ubicaciones de reparto más antiguas que la retención (#144).
 * @pt-BR Remove localizações de reparto mais antigas que a retenção (#144).
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { RepartoUbicacionService } from '../server/services/RepartoUbicacionService'

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  const service = new RepartoUbicacionService(prisma)
  try {
    const deleted = await service.purgeOlderThanRetention()
    console.log(`reparto-ubicacion-purge: deleted ${deleted} row(s)`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
