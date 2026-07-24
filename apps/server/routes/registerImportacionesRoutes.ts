import type { Application, Request, Response } from 'express'
import type {
  ImportDuplicateMode,
  ImportEntity,
  ImportModo,
} from '@bizcode/types'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { importacionesMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { csvImportUploadSingle } from '../csvImport'
import {
  ARTICULO_IMPORT_CSV_HEADERS,
  CLIENTE_IMPORT_CSV_HEADERS,
  PROVEEDOR_IMPORT_CSV_HEADERS,
  SALDO_IMPORT_CSV_HEADERS,
  buildArticuloImportTemplateCsv,
  buildClienteImportTemplateCsv,
  buildImportTemplateXlsx,
  buildProveedorImportTemplateCsv,
  buildSaldoImportTemplateCsv,
  errorMessage,
  getTenantId,
} from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

const upload = csvImportUploadSingle()

const ENTITIES: ImportEntity[] = ['articulos', 'clientes', 'proveedores', 'saldos']

function parseEntity(value: unknown): ImportEntity | null {
  return typeof value === 'string' && (ENTITIES as string[]).includes(value)
    ? (value as ImportEntity)
    : null
}

function authUserId(req: Request): number {
  return (req as AuthenticatedRequest).auth!.claims.userId
}

function pathId(req: Request): number {
  return Number.parseInt(String(req.params.id), 10)
}

/**
 * @en REST endpoints for unified bulk Excel/CSV import jobs (#238).
 * @es Endpoints REST de importación masiva unificada Excel/CSV (#238).
 * @pt-BR Endpoints REST de importação em massa unificada Excel/CSV (#238).
 */
export function registerImportacionesRoutes(app: Application, ctx: RestRouteContext): void {
  const { bulkImportValidate, importJob } = ctx.services
  const moduleGuard = requireModule('platform.data_import')
  const readPermission = requirePermission('data_import.read')
  const managePermission = requirePermission('data_import.manage')

  app.get(
    '/api/importaciones/templates/:entity',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const entity = parseEntity(req.params.entity)
        if (!entity) {
          res.status(400).json({ success: false, error: 'Invalid entity' })
          return
        }
        const format = typeof req.query.format === 'string' ? req.query.format : 'csv'
        if (format === 'xlsx') {
          const headers =
            entity === 'clientes'
              ? CLIENTE_IMPORT_CSV_HEADERS
              : entity === 'articulos'
                ? ARTICULO_IMPORT_CSV_HEADERS
                : entity === 'proveedores'
                  ? PROVEEDOR_IMPORT_CSV_HEADERS
                  : SALDO_IMPORT_CSV_HEADERS
          const descriptions = headers.map((h) => `# ${h}`)
          const example =
            entity === 'clientes'
              ? ['1001', 'Ejemplo SA', 'RI', 'true', '', '', '', '', '', '', '', '', '', '0', 'false', '']
              : entity === 'articulos'
                ? ['100', 'Producto demo', '10', '1', 'UN', '100.50', '95.00', '50.00', '0', '0', 'true']
                : entity === 'proveedores'
                  ? ['2001', 'Proveedor Demo SA', 'RI', 'true', '', '', '', '']
                  : ['1001', '', '1500.50', '2026-01-01', 'Saldo inicial']
          const buf = await buildImportTemplateXlsx(headers, descriptions, example)
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          )
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="${entity}_import_template.xlsx"`,
          )
          res.status(200).send(buf)
          return
        }

        const csv =
          entity === 'clientes'
            ? buildClienteImportTemplateCsv()
            : entity === 'articulos'
              ? buildArticuloImportTemplateCsv()
              : entity === 'proveedores'
                ? buildProveedorImportTemplateCsv()
                : buildSaldoImportTemplateCsv()
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${entity}_import_template.csv"`,
        )
        res.status(200).send(csv)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/importaciones/validate',
    importacionesMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    upload,
    async (req: Request, res: Response) => {
      try {
        const entity = parseEntity(req.body?.entity ?? req.query.entity)
        if (!entity) {
          res.status(400).json({ success: false, error: 'entity required' })
          return
        }
        const file = req.file
        if (!file?.buffer) {
          res.status(400).json({ success: false, error: 'file required' })
          return
        }
        const duplicateMode = (req.body?.duplicateMode ?? 'skip') as ImportDuplicateMode
        const result = await bulkImportValidate.validateFile(
          getTenantId(req),
          entity,
          file.buffer,
          file.originalname,
          duplicateMode === 'update' ? 'update' : 'skip',
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/importaciones/jobs',
    importacionesMutationHttpRateLimiter,
    moduleGuard,
    managePermission,
    upload,
    async (req: Request, res: Response) => {
      try {
        const entity = parseEntity(req.body?.entity ?? req.query.entity)
        if (!entity) {
          res.status(400).json({ success: false, error: 'entity required' })
          return
        }
        const file = req.file
        if (!file?.buffer) {
          res.status(400).json({ success: false, error: 'file required' })
          return
        }
        const modo = (
          req.body?.modo === 'todo_o_nada' ? 'todo_o_nada' : 'mejores_esfuerzos'
        ) as ImportModo
        const duplicateMode = (
          req.body?.duplicateMode === 'update' ? 'update' : 'skip'
        ) as ImportDuplicateMode
        const result = await importJob.createAndStart({
          tenantId: getTenantId(req),
          userId: authUserId(req),
          entity,
          modo,
          duplicateMode,
          buffer: file.buffer,
          filename: file.originalname,
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'importacion.start',
          'import_job',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/importaciones/jobs/:id',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await importJob.getById(getTenantId(req), pathId(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/importaciones/jobs/:id/events',
    importacionesMutationHttpRateLimiter,
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const id = pathId(req)
        const existing = await importJob.getById(getTenantId(req), id)
        if (!existing.ok) {
          res.status(existing.status).json({ success: false, error: existing.error })
          return
        }

        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.flushHeaders?.()

        const send = (payload: unknown) => {
          res.write(`data: ${JSON.stringify(payload)}\n\n`)
        }

        send({
          jobId: existing.data.id,
          estado: existing.data.estado,
          processedRows: existing.data.processedRows,
          totalRows: existing.data.totalRows,
          createdCount: existing.data.createdCount,
          updatedCount: existing.data.updatedCount,
          skippedCount: existing.data.skippedCount,
          errorCount: existing.data.errorCount,
        })

        if (
          existing.data.estado === 'completed' ||
          existing.data.estado === 'failed' ||
          existing.data.estado === 'cancelled'
        ) {
          res.end()
          return
        }

        const heartbeat = setInterval(() => {
          res.write(': heartbeat\n\n')
        }, 15000)

        const unsubscribe = importJob.subscribe(id, (event) => {
          send(event)
          if (
            event.estado === 'completed' ||
            event.estado === 'failed' ||
            event.estado === 'cancelled'
          ) {
            clearInterval(heartbeat)
            unsubscribe()
            res.end()
          }
        })

        req.on('close', () => {
          clearInterval(heartbeat)
          unsubscribe()
        })
      } catch (err: unknown) {
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: errorMessage(err) })
        } else {
          res.end()
        }
      }
    },
  )

  app.get(
    '/api/importaciones/jobs/:id/report',
    moduleGuard,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await importJob.buildReportCsv(getTenantId(req), pathId(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="import-job-${pathId(req)}-report.csv"`,
        )
        res.status(200).send(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
