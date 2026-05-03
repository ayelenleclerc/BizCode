import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { Application, Request, Response } from 'express'
import cors from 'cors'
import type { PrismaClient } from '@prisma/client'
import { parse as parseYaml } from 'yaml'
import swaggerUi from 'swagger-ui-express'
import { registerAuthRoutes, resolveSession, type AuthenticatedRequest } from './auth'
import { registerUserRoutes } from './users'
import { registerDashboardRoutes } from './dashboard'
import { registerNotificationRoutes } from './notifications'
import { isSmtpConfigured, isTwilioConfigured } from './channels'
import { registerChatRoutes } from './chat'
import { correlationId } from './middleware/correlationId'
import { errorHandler } from './middleware/errorHandler'
import { globalHttpRateLimiter } from './middleware/globalRateLimit'
import { registerRestDomainRoutes } from './registerRestDomainRoutes'

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
] as const

/**
 * @en Parses comma-separated extra origins from `CORS_ORIGINS` (trimmed, empty entries dropped).
 * @es Parsea orígenes extra separados por comas desde `CORS_ORIGINS` (recortados, sin vacíos).
 * @pt-BR Faz parse de origens extras em `CORS_ORIGINS` separadas por vírgula (trim, sem vazios).
 */
export function parseCorsOriginsFromEnv(): string[] {
  const raw = process.env.CORS_ORIGINS?.trim()
  if (!raw) {
    return []
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/**
 * @en Allowed browser origins for credentialed CORS (defaults + `CORS_ORIGINS`).
 * @es Orígenes de navegador permitidos para CORS con credenciales (por defecto + `CORS_ORIGINS`).
 * @pt-BR Origens de navegador permitidos para CORS com credenciais (padrão + `CORS_ORIGINS`).
 */
export function getCorsAllowedOrigins(): Set<string> {
  return new Set<string>([...DEFAULT_CORS_ORIGINS, ...parseCorsOriginsFromEnv()])
}

let cachedOpenApiDocument: Record<string, unknown> | undefined

/**
 * @en Loads and caches `docs/api/openapi.yaml` for Swagger UI (same spec as contract tests).
 * @es Carga y cachea `docs/api/openapi.yaml` para Swagger UI (el mismo spec que el contrato).
 * @pt-BR Carrega e armazena em cache `docs/api/openapi.yaml` para o Swagger UI (o mesmo spec do contrato).
 */
function getOpenApiDocument(): Record<string, unknown> {
  if (cachedOpenApiDocument === undefined) {
    const dir = path.dirname(fileURLToPath(import.meta.url))
    const specPath = path.resolve(dir, '../docs/api/openapi.yaml')
    cachedOpenApiDocument = parseYaml(readFileSync(specPath, 'utf8')) as Record<string, unknown>
  }
  return cachedOpenApiDocument
}

/**
 * @en Express application factory for the REST API (tests via supertest, runtime via `server.ts`).
 * @es Fábrica de la aplicación Express para la API REST (pruebas con supertest, ejecución vía `server.ts`).
 * @pt-BR Fábrica do app Express para a API REST (testes com supertest, execução via `server.ts`).
 */
export function createApp(prisma: PrismaClient): Application {
  const app = express()
  app.use(correlationId)
  app.use(globalHttpRateLimiter)

  const allowedOrigins = getCorsAllowedOrigins()
  app.use(
    cors({
      credentials: true,
      origin(origin, callback): void {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true)
          return
        }
        callback(null, false)
      },
    }),
  )
  app.use(express.json())
  app.use(resolveSession(prisma))

  registerAuthRoutes(app, prisma)
  registerUserRoutes(app, prisma)
  registerDashboardRoutes(app, prisma)
  registerNotificationRoutes(app, prisma)
  registerChatRoutes(app, prisma)

  /**
   * @en Reports which external notification channels are configured (reads env vars server-side).
   *     No sensitive values are exposed — only boolean flags.
   * @es Informa qué canales de notificación externos están configurados (lee env vars en servidor).
   *     No se exponen valores sensibles — solo flags booleanos.
   */
  app.get('/api/notifications/channels', (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    res.json({
      success: true,
      data: {
        inApp: true,
        email: isSmtpConfigured(),
        whatsapp: isTwilioConfigured(),
      },
    })
  })

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getOpenApiDocument()))

  registerRestDomainRoutes(app, prisma)

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Not found' })
  })
  app.use(errorHandler)

  return app
}
