import express from 'express'
import type { Application, Request, Response } from 'express'
import cors from 'cors'
import type { PrismaClient } from '@prisma/client'

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
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

  // ============ CLIENTES ============

  app.get('/api/clientes', async (req: Request, res: Response) => {
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

  app.get('/api/clientes/:id', async (req: Request, res: Response) => {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: parseInt(String(req.params.id), 10) },
      })
      res.json({ success: true, data: cliente })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post('/api/clientes', async (req: Request, res: Response) => {
    try {
      const cliente = await prisma.cliente.create({
        data: req.body,
      })
      res.json({ success: true, data: cliente })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.put('/api/clientes/:id', async (req: Request, res: Response) => {
    try {
      const cliente = await prisma.cliente.update({
        where: { id: parseInt(String(req.params.id), 10) },
        data: req.body,
      })
      res.json({ success: true, data: cliente })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  // ============ ARTICULOS ============

  app.get('/api/articulos', async (req: Request, res: Response) => {
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

  app.get('/api/articulos/:id', async (req: Request, res: Response) => {
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

  app.post('/api/articulos', async (req: Request, res: Response) => {
    try {
      const articulo = await prisma.articulo.create({
        data: req.body,
      })
      res.json({ success: true, data: articulo })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.put('/api/articulos/:id', async (req: Request, res: Response) => {
    try {
      const articulo = await prisma.articulo.update({
        where: { id: parseInt(String(req.params.id), 10) },
        data: req.body,
      })
      res.json({ success: true, data: articulo })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  // ============ RUBROS ============

  app.get('/api/rubros', async (_req: Request, res: Response) => {
    try {
      const rubros = await prisma.rubro.findMany({
        orderBy: { codigo: 'asc' },
      })
      res.json({ success: true, data: rubros })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post('/api/rubros', async (req: Request, res: Response) => {
    try {
      const rubro = await prisma.rubro.create({ data: req.body })
      res.json({ success: true, data: rubro })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  // ============ FORMAS DE PAGO ============

  app.get('/api/formas-pago', async (_req: Request, res: Response) => {
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

  app.get('/api/facturas', async (_req: Request, res: Response) => {
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

  app.post('/api/facturas', async (req: Request, res: Response) => {
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
