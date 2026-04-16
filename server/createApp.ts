import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { Application, Request, Response } from 'express'
import cors from 'cors'
import type { PrismaClient } from '@prisma/client'
import { parse as parseYaml } from 'yaml'
import swaggerUi from 'swagger-ui-express'
import { registerAuthRoutes, requirePermission, resolveSession, type AuthenticatedRequest } from './auth'
import { registerUserRoutes } from './users'
import { registerDashboardRoutes } from './dashboard'
import { registerNotificationRoutes } from './notifications'
import { dispatchNotification, isSmtpConfigured, isTwilioConfigured } from './channels'

const DEFAULT_CORS_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'] as const

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

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
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

  async function writeAudit(
    req: AuthenticatedRequest,
    action: string,
    resource: string,
    resourceId?: string,
  ): Promise<void> {
    try {
      await prisma.auditEvent.create({
        data: {
          tenantId: req.auth!.claims.tenantId,
          userId: req.auth!.claims.userId,
          action,
          resource,
          resourceId,
          ipAddress: req.ip,
        },
      })
    } catch (_error) {
      // Audit failures should not block core business operations.
    }
  }

  // ============ CLIENTES ============

  app.get('/api/clientes', requirePermission('customers.read'), async (req: Request, res: Response) => {
    try {
      const filtro = (req.query.q as string) || ''
      const clientes = await prisma.cliente.findMany({
        where: {
          OR: [
            { rsocial: { contains: filtro, mode: 'insensitive' } },
            { cuit: { contains: filtro, mode: 'insensitive' } },
            { codigo: { equals: filtro ? parseInt(filtro, 10) : undefined } },
          ],
        },
        orderBy: { codigo: 'asc' },
      })
      res.json({ success: true, data: clientes })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get('/api/clientes/:id', requirePermission('customers.read'), async (req: Request, res: Response) => {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: parseInt(String(req.params.id), 10) },
      })
      res.json({ success: true, data: cliente })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post('/api/clientes', requirePermission('customers.manage'), async (req: Request, res: Response) => {
    try {
      const cliente = await prisma.cliente.create({
        data: req.body,
      })
      await writeAudit(req as AuthenticatedRequest, 'cliente_create', 'cliente', String(cliente.id))
      res.json({ success: true, data: cliente })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.put('/api/clientes/:id', requirePermission('customers.manage'), async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest
      const role = authReq.auth?.claims.role
      const canManageFinancials = role === 'owner' || role === 'manager'

      // Strip financial management fields for roles without the right
      const { creditLimit, creditDays, suspended, ...baseBody } = req.body as Record<string, unknown>
      const data = canManageFinancials
        ? { ...baseBody, creditLimit, creditDays, suspended }
        : baseBody

      const cliente = await prisma.cliente.update({
        where: { id: parseInt(String(req.params.id), 10) },
        data,
      })
      await writeAudit(authReq, 'cliente_update', 'cliente', String(cliente.id))
      res.json({ success: true, data: cliente })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  // ============ ARTICULOS ============

  app.get('/api/articulos', requirePermission('products.read'), async (req: Request, res: Response) => {
    try {
      const filtro = (req.query.q as string) || ''
      const articulos = await prisma.articulo.findMany({
        where: {
          OR: [
            { descripcion: { contains: filtro, mode: 'insensitive' } },
            { codigo: { equals: filtro ? parseInt(filtro, 10) : undefined } },
          ],
        },
        include: { rubro: true },
        orderBy: { codigo: 'asc' },
      })
      res.json({ success: true, data: articulos })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get('/api/articulos/:id', requirePermission('products.read'), async (req: Request, res: Response) => {
    try {
      const articulo = await prisma.articulo.findUnique({
        where: { id: parseInt(String(req.params.id), 10) },
        include: { rubro: true },
      })
      res.json({ success: true, data: articulo })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post('/api/articulos', requirePermission('products.manage'), async (req: Request, res: Response) => {
    try {
      const articulo = await prisma.articulo.create({
        data: req.body,
      })
      await writeAudit(req as AuthenticatedRequest, 'articulo_create', 'articulo', String(articulo.id))
      res.json({ success: true, data: articulo })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.put('/api/articulos/:id', requirePermission('products.manage'), async (req: Request, res: Response) => {
    try {
      const articulo = await prisma.articulo.update({
        where: { id: parseInt(String(req.params.id), 10) },
        data: req.body,
      })
      await writeAudit(req as AuthenticatedRequest, 'articulo_update', 'articulo', String(articulo.id))
      res.json({ success: true, data: articulo })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  // ============ RUBROS ============

  app.get('/api/rubros', requirePermission('products.read'), async (_req: Request, res: Response) => {
    try {
      const rubros = await prisma.rubro.findMany({
        orderBy: { codigo: 'asc' },
      })
      res.json({ success: true, data: rubros })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post('/api/rubros', requirePermission('products.manage'), async (req: Request, res: Response) => {
    try {
      const rubro = await prisma.rubro.create({ data: req.body })
      await writeAudit(req as AuthenticatedRequest, 'rubro_create', 'rubro', String(rubro.id))
      res.json({ success: true, data: rubro })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  // ============ FORMAS DE PAGO ============

  app.get('/api/formas-pago', requirePermission('sales.create'), async (_req: Request, res: Response) => {
    try {
      const formas = await prisma.formaPago.findMany({
        orderBy: { codigo: 'asc' },
      })
      res.json({ success: true, data: formas })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  // ============ FACTURAS ============

  app.get('/api/facturas', requirePermission('reports.operational.read'), async (_req: Request, res: Response) => {
    try {
      const facturas = await prisma.factura.findMany({
        include: { cliente: true, items: true },
        orderBy: { fecha: 'desc' },
      })
      res.json({ success: true, data: facturas })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post('/api/facturas', requirePermission('sales.create'), async (req: Request, res: Response) => {
    try {
      const { items, ...factura } = req.body as { items: Record<string, unknown>[] } & Record<
        string,
        unknown
      >
      const clienteId = parseInt(String(factura.clienteId), 10)

      // Check suspension before creating the factura
      const clienteCheck = await prisma.cliente.findUnique({
        where: { id: clienteId },
        select: { suspended: true },
      })
      if (clienteCheck?.suspended) {
        res.status(422).json({ success: false, error: 'CLIENT_SUSPENDED' })
        return
      }

      // Create factura and update customer balance atomically
      const [result, updatedCliente] = await prisma.$transaction(async (tx) => {
        const newFactura = await tx.factura.create({
          data: {
            ...factura,
            items: { create: items },
          } as Parameters<typeof prisma.factura.create>[0]['data'],
          include: { items: true },
        })

        const updated = await tx.cliente.update({
          where: { id: clienteId },
          data: { balance: { increment: newFactura.total } },
          select: { id: true, rsocial: true, balance: true, creditLimit: true },
        })

        return [newFactura, updated] as const
      })

      // Dispatch to all configured channels if balance exceeds credit limit (non-blocking)
      if (
        updatedCliente.creditLimit !== null &&
        Number(updatedCliente.balance) > Number(updatedCliente.creditLimit)
      ) {
        const authReq = req as AuthenticatedRequest
        dispatchNotification(prisma, authReq.auth!.claims.tenantId, 'credit_limit_exceeded', {
          clienteId: updatedCliente.id,
          rsocial: updatedCliente.rsocial,
          amount: String(updatedCliente.balance),
          limit: String(updatedCliente.creditLimit),
        }).catch(() => { /* notification failure must not block the sale */ })
      }

      await writeAudit(req as AuthenticatedRequest, 'factura_create', 'factura', String(result.id))
      res.json({ success: true, data: result })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  // ============ ZONAS DE ENTREGA ============

  app.get('/api/zonas-entrega', requirePermission('logistics.read'), async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest
      const tenantId = authReq.auth!.claims.tenantId
      const zones = await prisma.deliveryZone.findMany({
        where: { tenantId },
        orderBy: { nombre: 'asc' },
      })
      res.json({ success: true, data: zones })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post('/api/zonas-entrega', requirePermission('logistics.manage'), async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest
      const tenantId = authReq.auth!.claims.tenantId
      const { nombre, tipo, diasEntrega, horario } = req.body as {
        nombre?: string
        tipo?: string
        diasEntrega?: string
        horario?: string
      }
      if (!nombre?.trim()) {
        res.status(400).json({ success: false, error: 'nombre is required' })
        return
      }
      const zone = await prisma.deliveryZone.create({
        data: { tenantId, nombre: nombre.trim(), tipo: tipo ?? 'barrio', diasEntrega, horario },
      })
      await writeAudit(authReq, 'delivery_zone_create', 'delivery_zone', String(zone.id))
      res.status(201).json({ success: true, data: zone })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.put('/api/zonas-entrega/:id', requirePermission('logistics.manage'), async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest
      const tenantId = authReq.auth!.claims.tenantId
      const id = parseInt(String(req.params.id), 10)

      // Verify the zone belongs to the tenant before updating
      const existing = await prisma.deliveryZone.findFirst({ where: { id, tenantId } })
      if (!existing) {
        res.status(404).json({ success: false, error: 'Delivery zone not found' })
        return
      }

      const { nombre, tipo, diasEntrega, horario, activo } = req.body as {
        nombre?: string
        tipo?: string
        diasEntrega?: string
        horario?: string
        activo?: boolean
      }
      const zone = await prisma.deliveryZone.update({
        where: { id },
        data: {
          ...(nombre !== undefined && { nombre: nombre.trim() }),
          ...(tipo !== undefined && { tipo }),
          ...(diasEntrega !== undefined && { diasEntrega }),
          ...(horario !== undefined && { horario }),
          ...(activo !== undefined && { activo }),
        },
      })
      await writeAudit(authReq, 'delivery_zone_update', 'delivery_zone', String(zone.id))
      res.json({ success: true, data: zone })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  return app
}
