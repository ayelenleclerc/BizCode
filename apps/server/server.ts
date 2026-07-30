import { PrismaClient } from '@prisma/client'
import type { Application } from 'express'
import type { Server } from 'node:http'
import { createApp } from './createApp'
import { createTenantRlsPrisma } from './lib/tenantRls'
import { logger } from './logger'
import { initializeAppConfig } from './config/env'
import { startSecurityMonitor, stopSecurityMonitor } from './security/securityMonitor'

export const PORT = 3001

/**
 * @en Creates the Express app and Prisma client for the API (tests and {@link startServer}).
 * @es Crea la app Express y el cliente Prisma para la API (pruebas y {@link startServer}).
 * @pt-BR Cria o app Express e o cliente Prisma para a API (testes e {@link startServer}).
 */
export function createServerInstance(
  prisma: PrismaClient = createTenantRlsPrisma(new PrismaClient()),
): {
  app: Application
  prisma: PrismaClient
} {
  const app = createApp(prisma)
  return { app, prisma }
}

export type BindHttpServerOptions = {
  /** When false, skips SIGINT handling (unit tests). Default: register listener. */
  registerSigint?: boolean
  /** When false, skips security monitor (#221). Default: start monitor. */
  startSecurityMonitor?: boolean
}

/**
 * @en Binds the HTTP server and optionally registers graceful shutdown on SIGINT.
 * @es Enlaza el servidor HTTP y opcionalmente registra el cierre ante SIGINT.
 * @pt-BR Liga o servidor HTTP e, opcionalmente, registra encerramento em SIGINT.
 */
export function bindHttpServer(
  app: Application,
  prisma: PrismaClient,
  port: number,
  options?: BindHttpServerOptions,
): Server {
  const server = app.listen(port, () => {
    logger.info({ port }, 'API server listening')
  })
  if (options?.startSecurityMonitor !== false) {
    startSecurityMonitor(prisma)
  }
  if (options?.registerSigint !== false) {
    process.once('SIGINT', async () => {
      stopSecurityMonitor()
      await prisma.$disconnect()
      process.exit(0)
    })
  }
  return server
}

/**
 * @en Starts the API server on the given port (default {@link PORT}).
 * @es Arranca el servidor API en el puerto indicado (por defecto {@link PORT}).
 * @pt-BR Inicia o servidor API na porta informada (padrão {@link PORT}).
 */
export function startServer(port: number = PORT, options?: BindHttpServerOptions): Server {
  initializeAppConfig()
  const { app, prisma } = createServerInstance()
  return bindHttpServer(app, prisma, port, options)
}
