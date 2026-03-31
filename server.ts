import { PrismaClient } from '@prisma/client'
import { createApp } from './server/createApp'

const prisma = new PrismaClient()
const PORT = 3001

const app = createApp(prisma)

app.listen(PORT, () => {
  console.log(`✓ API Server running on http://localhost:${PORT}`)
  console.log(`✓ PostgreSQL connected`)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit()
})
