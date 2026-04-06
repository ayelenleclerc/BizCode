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

  app.use(cors())
  app.use(express.json())
  app.use(resolveSession(prisma))

  registerAuthRoutes(app, prisma)

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getOpenApiDocument()))

  async function writeAudit(
    req: AuthenticatedRequest,
    action: string,
    resource: string,
    resourceId?: string,
  ): Promise<void> {
    if (!req.auth) {
      return
    }
    try {
      await prisma.auditEvent.create({
        data: {
          tenantId: req.auth.claims.tenantId,
          userId: req.auth.claims.userId,
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
      const cliente = await prisma.cliente.update({
        where: { id: parseInt(String(req.params.id), 10) },
        data: req.body,
      })
      await writeAudit(req as AuthenticatedRequest, 'cliente_update', 'cliente', String(cliente.id))
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
      const result = await prisma.factura.create({
        data: {
          ...factura,
          items: {
            create: items,
          },
        } as Parameters<typeof prisma.factura.create>[0]['data'],
        include: { items: true },
      })
      await writeAudit(req as AuthenticatedRequest, 'factura_create', 'factura', String(result.id))
      res.json({ success: true, data: result })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  return app
}
