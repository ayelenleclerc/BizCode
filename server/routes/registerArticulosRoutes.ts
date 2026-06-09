import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { articuloBodySchema, stockAjusteBodySchema } from '../schemas/domain'
import type { ArticuloInput, StockAjusteInput } from '../createApp.types'
import { hasPermission } from '../../src/lib/rbac'
import { readDbfRecordsFromBuffer } from '../../src/lib/migration/readDbfBuffer'
import { parseCsvWithFixedHeaders, CSV_IMPORT_MAX_ROWS } from '../csvImport'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import {
  ARTICULO_IMPORT_CSV_HEADERS,
  buildArticuloImportTemplateCsv,
  errorMessage,
  getTenantId,
  singleCsvUpload,
  singleDbfUpload,
} from './restDomainShared'

/**
 * @en Product (articulo) REST routes and CSV import.
 */
export function registerArticulosRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { articulo, stockAjuste, import: importService } = services

  function canViewStockHistorial(role: string): boolean {
    return (
      hasPermission(role as Parameters<typeof hasPermission>[0], 'inventory.adjust') ||
      role === 'owner' ||
      role === 'manager' ||
      role === 'warehouse_lead'
    )
  }

  app.get('/api/articulos', requirePermission('products.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const filtro = (req.query.q as string) || ''
      const { take, skip } = parseListPagination(req)
      const { total, articulos } = await articulo.list(tenantId, filtro, take, skip)
      res.json(paginatedListJson(articulos, total, take, skip))
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get('/api/articulos/:id', requirePermission('products.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const data = await articulo.getById(tenantId, parseInt(String(req.params.id), 10))
      res.json({ success: true, data })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post(
    '/api/articulos',
    requirePermission('products.manage'),
    validateBody(articuloBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as ArticuloInput
        const result = await articulo.create(tenantId, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'articulo_create', 'articulo', String(result.data.id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/articulos/:id',
    requirePermission('products.manage'),
    validateBody(articuloBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as ArticuloInput
        const result = await articulo.update(tenantId, parseInt(String(req.params.id), 10), body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'articulo_update', 'articulo', String(result.data.id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/articulos/:id/stock-historial',
    requirePermission('products.read'),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!canViewStockHistorial(authReq.auth!.claims.role)) {
        res.status(403).json({ success: false, error: 'Missing permission to view stock history' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const articuloId = parseInt(String(req.params.id), 10)
        const { take, skip } = parseListPagination(req)
        const result = await stockAjuste.listHistorial(tenantId, articuloId, take, skip)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json(paginatedListJson(result.data.ajustes, result.data.total, take, skip))
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/articulos/:id/stock-ajuste',
    requirePermission('inventory.adjust'),
    validateBody(stockAjusteBodySchema),
    async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const articuloId = parseInt(String(req.params.id), 10)
        const body = req.body as StockAjusteInput
        const result = await stockAjuste.adjust(
          tenantId,
          articuloId,
          authReq.auth!.claims.userId,
          body,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'stock_adjust', 'articulo', String(articuloId), {
          stockBefore: result.data.stockBefore,
          stockAfter: result.data.stockAfter,
          cantidad: body.cantidad,
          motivo: body.motivo,
        })
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get('/api/articulos/import/template', requirePermission('products.manage'), (_req: Request, res: Response) => {
    const body = buildArticuloImportTemplateCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="articulos_import_template.csv"')
    res.send(body)
  })

  app.post('/api/articulos/import', requirePermission('products.manage'), singleCsvUpload, (req: Request, res: Response) => {
    void (async () => {
      const file = (req as Request & { file?: { buffer: Buffer } }).file
      if (!file?.buffer) {
        res.status(400).json({ success: false, error: 'Expected multipart field "file" with a .csv file' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const parsedCsv = parseCsvWithFixedHeaders(file.buffer, ARTICULO_IMPORT_CSV_HEADERS, CSV_IMPORT_MAX_ROWS)
        if (!parsedCsv.ok) {
          res.status(400).json({ success: false, error: parsedCsv.error })
          return
        }
        const { created, errors } = await importService.importArticulos(tenantId, parsedCsv.records)
        const authReq = req as AuthenticatedRequest
        await writeAudit(authReq, 'articulo_import', 'articulo', undefined, {
          createdCount: created,
          errorCount: errors.length,
        })
        res.json({
          success: true,
          data: { created, skipped: errors.length, errors },
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    })()
  })

  app.post(
    '/api/articulos/migrate-dbf',
    requirePermission('settings.business.manage'),
    singleDbfUpload,
    (req: Request, res: Response) => {
      void (async () => {
        const file = (req as Request & { file?: { buffer: Buffer } }).file
        if (!file?.buffer) {
          res.status(400).json({ success: false, error: 'Expected multipart field "file" with a .dbf file' })
          return
        }
        try {
          const tenantId = getTenantId(req)
          const rows = await readDbfRecordsFromBuffer(file.buffer)
          const { created, updated = 0, errors } = await importService.importArticulosFromDbf(tenantId, rows)
          const authReq = req as AuthenticatedRequest
          await writeAudit(authReq, 'articulo_import', 'articulo', undefined, {
            createdCount: created,
            updatedCount: updated,
            errorCount: errors.length,
            source: 'dbf',
          })
          res.json({
            success: true,
            data: { created, updated, skipped: errors.length, errors },
          })
        } catch (err: unknown) {
          res.status(500).json({ success: false, error: errorMessage(err) })
        }
      })()
    },
  )
}
