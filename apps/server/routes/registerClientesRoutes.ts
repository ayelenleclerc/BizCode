import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { verifyOwnership } from '../middleware/verifyOwnership'
import { clienteBodySchema } from '../schemas/domain'
import type { ClienteInput } from '@bizcode/types'
import { parseCsvWithFixedHeaders, CSV_IMPORT_MAX_ROWS } from '../csvImport'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import {
  buildClienteImportTemplateCsv,
  CLIENTE_IMPORT_CSV_HEADERS,
  errorMessage,
  getTenantId,
  singleCsvUpload,
} from './restDomainShared'

/**
 * @en Customer REST routes (`/api/clientes`, CSV import).
 */
export function registerClientesRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, services, writeAudit } = ctx
  const { cliente, import: importService } = services
  const ownership = verifyOwnership(prisma, 'cliente')

  app.get('/api/clientes', requirePermission('customers.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const filtro = (req.query.q as string) || ''
      const { take, skip } = parseListPagination(req)
      const { total, clientes } = await cliente.list(tenantId, filtro, take, skip)
      res.json(paginatedListJson(clientes, total, take, skip))
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.get('/api/clientes/import/template', requirePermission('customers.manage'), (_req: Request, res: Response) => {
    const body = buildClienteImportTemplateCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="clientes_import_template.csv"')
    res.send(body)
  })

  app.post('/api/clientes/import', requirePermission('customers.manage'), singleCsvUpload, (req: Request, res: Response) => {
    void (async () => {
      const file = (req as Request & { file?: { buffer: Buffer } }).file
      if (!file?.buffer) {
        res.status(400).json({ success: false, error: 'Expected multipart field "file" with a .csv file' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const parsedCsv = parseCsvWithFixedHeaders(file.buffer, CLIENTE_IMPORT_CSV_HEADERS, CSV_IMPORT_MAX_ROWS)
        if (!parsedCsv.ok) {
          res.status(400).json({ success: false, error: parsedCsv.error })
          return
        }
        const { created, errors } = await importService.importClientes(tenantId, parsedCsv.records)
        const authReq = req as AuthenticatedRequest
        await writeAudit(authReq, 'cliente_import', 'cliente', undefined, {
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

  app.get(
    '/api/clientes/:id',
    requirePermission('customers.read'),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await cliente.getById(tenantId, parseInt(String(req.params.id), 10))
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/clientes',
    requirePermission('customers.manage'),
    validateBody(clienteBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as ClienteInput
        const result = await cliente.create(tenantId, body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(req as AuthenticatedRequest, 'cliente_create', 'cliente', String(result.data.id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/clientes/:id',
    requirePermission('customers.manage'),
    validateBody(clienteBodySchema),
    ownership,
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const parsedBody = req.body as ClienteInput
        const authReq = req as AuthenticatedRequest
        const role = authReq.auth?.claims.role
        const canManageFinancials = role === 'owner' || role === 'manager'
        const result = await cliente.update(
          tenantId,
          parseInt(String(req.params.id), 10),
          parsedBody,
          canManageFinancials,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'cliente_update', 'cliente', String(result.data.id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
