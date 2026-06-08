import type { Application, Request, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { requirePermission } from '../auth'
import { AppError } from '../errors/AppError'
import { parseCsvWithFixedHeaders, CSV_IMPORT_MAX_ROWS } from '../csvImport'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  proveedorArticuloBodySchema,
  proveedorArticuloImportRowSchema,
  proveedorArticuloUpdateBodySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import type { RestRouteContext } from './restRouteTypes'
import {
  errorMessage,
  getTenantId,
  PROVEEDOR_CATALOGO_IMPORT_CSV_HEADERS,
  singleCsvUpload,
} from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function sendRouteError(err: unknown, res: Response): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message })
    return
  }
  res.status(500).json({ success: false, error: errorMessage(err) })
}

/**
 * @en Supplier catalog routes — per-supplier article codes and list prices (#273).
 * @es Rutas de catálogo por proveedor — códigos y precios de lista (#273).
 * @pt-BR Rotas de catálogo por fornecedor — códigos e preços de lista (#273).
 */
export function registerProveedorCatalogoRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { proveedorCatalogo } = services
  const purchasesModule = requireModule('logistics.purchases')

  app.get(
    '/api/proveedores/:id/catalogo',
    purchasesModule,
    requirePermission('suppliers.read'),
    async (req: Request, res: Response) => {
      const proveedorId = parsePositiveIntParam(String(req.params.id))
      if (proveedorId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      try {
        const tenantId = getTenantId(req)
        const items = await proveedorCatalogo.listCatalogo(tenantId, proveedorId)
        if (items === null) {
          res.status(404).json({ success: false, error: 'Proveedor not found' })
          return
        }
        res.json({ success: true, data: { items } })
      } catch (err: unknown) {
        sendRouteError(err, res)
      }
    },
  )

  app.post(
    '/api/proveedores/:id/catalogo',
    purchasesModule,
    requirePermission('suppliers.manage'),
    validateBody(proveedorArticuloBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }

      const proveedorId = parsePositiveIntParam(String(req.params.id))
      if (proveedorId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      try {
        const tenantId = getTenantId(req)
        const row = await proveedorCatalogo.createEntry(tenantId, proveedorId, req.body)
        await writeAudit(authReq, 'proveedor_catalogo_create', 'proveedor_articulo', String(row.id), {
          proveedorId,
          articuloId: row.articuloId,
          codigoProveedor: row.codigoProveedor,
        })
        res.status(201).json({ success: true, data: row })
      } catch (err: unknown) {
        sendRouteError(err, res)
      }
    },
  )

  app.put(
    '/api/proveedores/:id/catalogo/:articuloId',
    purchasesModule,
    requirePermission('suppliers.manage'),
    validateBody(proveedorArticuloUpdateBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }

      const proveedorId = parsePositiveIntParam(String(req.params.id))
      const articuloId = parsePositiveIntParam(String(req.params.articuloId))
      if (proveedorId === null || articuloId === null) {
        res.status(400).json({ success: false, error: 'id and articuloId must be positive integers' })
        return
      }

      try {
        const tenantId = getTenantId(req)
        const row = await proveedorCatalogo.updateEntry(tenantId, proveedorId, articuloId, req.body)
        await writeAudit(authReq, 'proveedor_catalogo_update', 'proveedor_articulo', String(row.id), {
          proveedorId,
          articuloId,
        })
        res.json({ success: true, data: row })
      } catch (err: unknown) {
        sendRouteError(err, res)
      }
    },
  )

  app.post(
    '/api/proveedores/:id/catalogo/import',
    purchasesModule,
    requirePermission('suppliers.manage'),
    singleCsvUpload,
    (req: Request, res: Response) => {
      void (async () => {
        const authReq = req as AuthenticatedRequest
        if (!authReq.auth) {
          res.status(401).json({ success: false, error: 'Authentication required' })
          return
        }

        const proveedorId = parsePositiveIntParam(String(req.params.id))
        if (proveedorId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }

        const file = (req as Request & { file?: { buffer: Buffer } }).file
        if (!file?.buffer) {
          res.status(400).json({ success: false, error: 'Expected multipart field "file" with a .csv file' })
          return
        }

        try {
          const tenantId = getTenantId(req)
          const parsedCsv = parseCsvWithFixedHeaders(
            file.buffer,
            PROVEEDOR_CATALOGO_IMPORT_CSV_HEADERS,
            CSV_IMPORT_MAX_ROWS,
          )
          if (!parsedCsv.ok) {
            res.status(400).json({ success: false, error: parsedCsv.error })
            return
          }

          const errors: { row: number; message: string }[] = []
          const validatedRows: Array<{
            row: number
            codigoProveedor: string
            codigoInterno: number
            precioLista?: number | null
            unidadCompra?: string | null
          }> = []

          for (const [i, row] of parsedCsv.records.entries()) {
            const rowNum = i + 2
            const raw = {
              codigo_proveedor: row.codigo_proveedor ?? '',
              codigo_interno: row.codigo_interno ?? '',
              precio: row.precio ?? '',
              unidad: row.unidad ?? '',
            }
            const parsed = safeParseBodySchema(proveedorArticuloImportRowSchema, raw)
            if (!parsed.ok) {
              errors.push({ row: rowNum, message: parsed.error })
              continue
            }
            const precioRaw = parsed.value.precio
            const unidadRaw = parsed.value.unidad
            validatedRows.push({
              row: rowNum,
              codigoProveedor: parsed.value.codigo_proveedor.trim(),
              codigoInterno: parsed.value.codigo_interno,
              precioLista:
                precioRaw === '' || precioRaw === null || precioRaw === undefined
                  ? undefined
                  : precioRaw,
              unidadCompra:
                unidadRaw === '' || unidadRaw === null || unidadRaw === undefined
                  ? undefined
                  : String(unidadRaw).trim() || null,
            })
          }

          const result = await proveedorCatalogo.importRows(tenantId, proveedorId, validatedRows)
          if (result === null) {
            res.status(404).json({ success: false, error: 'Proveedor not found' })
            return
          }

          const mergedErrors = [...errors, ...result.errors]
          await writeAudit(authReq, 'proveedor_catalogo_import', 'proveedor_articulo', undefined, {
            proveedorId,
            created: result.created,
            updated: result.updated,
            skipped: result.skipped + errors.length,
          })

          res.json({
            success: true,
            data: {
              created: result.created,
              updated: result.updated,
              skipped: result.skipped + errors.length,
              errors: mergedErrors,
            },
          })
        } catch (err: unknown) {
          sendRouteError(err, res)
        }
      })()
    },
  )
}
