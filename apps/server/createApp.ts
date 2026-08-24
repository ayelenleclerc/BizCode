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
import { registerPushNotificationRoutes } from './routes/registerPushNotificationRoutes'
import { isSmtpConfigured, isTwilioConfigured } from './channels'
import { registerChatRoutes } from './chat'
import { registerAuditEventRoutes } from './auditEvents'
import { correlationId } from './middleware/correlationId'
import { errorHandler } from './middleware/errorHandler'
import { observabilityMiddleware } from './middleware/observability'
import { getSecurityHeadersMiddleware } from './middleware/securityHeaders'
import { routeHttpRateLimiter } from './middleware/routeRateLimit'
import { forbiddenBurstMiddleware } from './security/forbiddenBurstMiddleware'
import { tenantContext } from './middleware/tenantContext'
import { tenantRlsContext } from './middleware/tenantRlsContext'
import { tenantModules } from './middleware/tenantModules'
import { tenantPlan } from './middleware/tenantPlan'
import { registerRestDomainRoutes } from './registerRestDomainRoutes'
import { registerMetricsRoute } from './routes/registerMetricsRoute'
import { registerSaasRoutes } from './routes/registerSaasRoutes'
import { registerSaasBillingRoutes } from './routes/registerSaasBillingRoutes'
import { bootstrapEcommerceConnectors } from './integrations/ecommerce/bootstrapEcommerceConnectors'

/**
 * @en Applies Express `trust proxy` from `TRUST_PROXY` hop count when set (#217).
 * @es Aplica Express `trust proxy` desde hops `TRUST_PROXY` si está seteado (#217).
 * @pt-BR Aplica Express `trust proxy` a partir de hops `TRUST_PROXY` se definido (#217).
 */
export function applyTrustProxyFromEnv(app: Application): void {
  const raw = process.env.TRUST_PROXY?.trim()
  if (!raw) {
    return
  }
  if (raw === 'true') {
    app.set('trust proxy', 1)
    return
  }
  const hops = Number.parseInt(raw, 10)
  if (Number.isFinite(hops) && hops >= 1) {
    app.set('trust proxy', hops)
  }
}

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
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
    const specPath = path.resolve(dir, '../../docs/api/openapi.yaml')
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
  applyTrustProxyFromEnv(app)
  app.use(getSecurityHeadersMiddleware())
  app.use(correlationId)

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
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        ;(req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf)
      },
    }),
  )
  app.use(
    '/uploads/articulos',
    express.static(
      process.env.BIZCODE_ARTICULO_IMAGES_DIR?.trim() || path.join(process.cwd(), 'uploads', 'articulos'),
    ),
  )
  app.use(resolveSession(prisma))
  // After session so authenticated vs anonymous keys work (#217).
  app.use(routeHttpRateLimiter)
  app.use(forbiddenBurstMiddleware())
  app.use(tenantContext)
  app.use(tenantRlsContext)
  app.use(tenantModules(prisma))
  app.use(tenantPlan(prisma))
  app.use(observabilityMiddleware)

  registerAuthRoutes(app, prisma)
  registerUserRoutes(app, prisma)
  registerDashboardRoutes(app, prisma)
  registerNotificationRoutes(app, prisma)
  registerPushNotificationRoutes(app, prisma)
  registerChatRoutes(app, prisma)
  registerAuditEventRoutes(app, prisma)
  registerMetricsRoute(app)

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

  bootstrapEcommerceConnectors()
  registerSaasRoutes(app, prisma)
  registerSaasBillingRoutes(app, prisma)
  registerRestDomainRoutes(app, prisma)

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Not found' })
  })
  app.use(errorHandler)

  return app
}
