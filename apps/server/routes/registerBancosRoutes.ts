/**
 * @en Bank accounts, CSV mappings, and statement import REST API (#190).
 * @es API REST de cuentas bancarias, mapeos CSV e importación de extractos (#190).
 * @pt-BR API REST de contas bancárias, mapeamentos CSV e importação de extratos (#190).
 */
import type { Application, Request, Response } from 'express'
import multer from 'multer'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { BULK_IMPORT_MAX_FILE_BYTES } from '../csvImport'
import { parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

const bankModule = requireModule('finance.bank_reconcile')

const extractoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: BULK_IMPORT_MAX_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase()
    if (
      name.endsWith('.csv') ||
      name.endsWith('.txt') ||
      name.endsWith('.ofx') ||
      name.endsWith('.qfx') ||
      name.endsWith('.mt940') ||
      name.endsWith('.sta') ||
      name.endsWith('.swi')
    ) {
      cb(null, true)
      return
    }
    cb(null, false)
  },
}).single('file')

function parseId(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function requireWriteRole(req: Request, res: Response): boolean {
  const role = (req as AuthenticatedRequest).auth?.claims.role
  if (role !== 'owner' && role !== 'manager' && role !== 'super_admin') {
    res.status(403).json({
      success: false,
      error: 'Only owner, manager, or super_admin can modify bank accounts',
    })
    return false
  }
  return true
}

export function registerBancosRoutes(app: Application, ctx: RestRouteContext): void {
  const { services, writeAudit } = ctx
  const { bancoExtracto } = services

  app.get(
    '/api/bancos/cuentas',
    bankModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const result = await bancoExtracto.listCuentas(getTenantId(req))
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
    '/api/bancos/cuentas',
    bankModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const authReq = req as AuthenticatedRequest
        const result = await bancoExtracto.createCuenta(getTenantId(req), {
          banco: String(req.body?.banco ?? ''),
          tipoCuenta: String(req.body?.tipoCuenta ?? 'corriente'),
          cbu: String(req.body?.cbu ?? ''),
          alias: req.body?.alias != null ? String(req.body.alias) : null,
          moneda: req.body?.moneda != null ? String(req.body.moneda) : 'ARS',
          activo: req.body?.activo !== false,
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_cuenta_create', 'cuenta_bancaria', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/bancos/cuentas/:id',
    bankModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const id = parseId(String(req.params.id))
        if (id == null) {
          res.status(400).json({ success: false, error: 'Invalid account id' })
          return
        }
        const authReq = req as AuthenticatedRequest
        const result = await bancoExtracto.updateCuenta(getTenantId(req), id, {
          ...(req.body?.banco != null ? { banco: String(req.body.banco) } : {}),
          ...(req.body?.tipoCuenta != null ? { tipoCuenta: String(req.body.tipoCuenta) } : {}),
          ...(req.body?.cbu != null ? { cbu: String(req.body.cbu) } : {}),
          ...(req.body?.alias !== undefined
            ? { alias: req.body.alias == null ? null : String(req.body.alias) }
            : {}),
          ...(req.body?.moneda != null ? { moneda: String(req.body.moneda) } : {}),
          ...(req.body?.activo != null ? { activo: Boolean(req.body.activo) } : {}),
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_cuenta_update', 'cuenta_bancaria', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/bancos/cuentas/:id/movimientos',
    bankModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const id = parseId(String(req.params.id))
        if (id == null) {
          res.status(400).json({ success: false, error: 'Invalid account id' })
          return
        }
        const { take, skip } = parseListPagination(req)
        const from = typeof req.query.from === 'string' ? req.query.from : undefined
        const to = typeof req.query.to === 'string' ? req.query.to : undefined
        const result = await bancoExtracto.listMovimientos(getTenantId(req), id, {
          from,
          to,
          take,
          skip,
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({
          success: true,
          data: result.data.data,
          total: result.data.total,
          take,
          skip,
        })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/bancos/cuentas/:id/importar',
    bankModule,
    requirePermission('reports.financial.read'),
    (req: Request, res: Response) => {
      extractoUpload(req, res, (err: unknown) => {
        void (async () => {
          try {
            if (err) {
              res.status(400).json({ success: false, error: errorMessage(err) })
              return
            }
            if (!requireWriteRole(req, res)) return
            const id = parseId(String(req.params.id))
            if (id == null) {
              res.status(400).json({ success: false, error: 'Invalid account id' })
              return
            }
            const file = (req as Request & { file?: Express.Multer.File }).file
            if (!file) {
              res.status(400).json({
                success: false,
                error: 'Expected multipart field "file" with .csv, .ofx, or .mt940',
              })
              return
            }
            const bancoCode =
              typeof req.body?.bancoCode === 'string' ? req.body.bancoCode : undefined
            const mappingIdRaw =
              typeof req.body?.mappingId === 'string' || typeof req.body?.mappingId === 'number'
                ? Number(req.body.mappingId)
                : undefined
            const mappingId =
              mappingIdRaw != null && Number.isInteger(mappingIdRaw) && mappingIdRaw > 0
                ? mappingIdRaw
                : undefined

            const authReq = req as AuthenticatedRequest
            const result = await bancoExtracto.importExtracto(
              getTenantId(req),
              id,
              { buffer: file.buffer, originalname: file.originalname },
              { bancoCode, mappingId },
            )
            if (!result.ok) {
              res.status(result.status).json({ success: false, error: result.error })
              return
            }
            await writeAudit(authReq, 'banco_extracto_import', 'cuenta_bancaria', String(id), {
              imported: result.data.imported,
              skippedDuplicates: result.data.skippedDuplicates,
              format: result.data.format,
            })
            res.json({ success: true, data: result.data })
          } catch (e: unknown) {
            res.status(500).json({ success: false, error: errorMessage(e) })
          }
        })()
      })
    },
  )

  app.get(
    '/api/bancos/csv-mappings',
    bankModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const result = await bancoExtracto.listMappings(getTenantId(req))
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
    '/api/bancos/csv-mappings',
    bankModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const authReq = req as AuthenticatedRequest
        const result = await bancoExtracto.createMapping(getTenantId(req), {
          bancoCode: String(req.body?.bancoCode ?? ''),
          columnaFecha: String(req.body?.columnaFecha ?? ''),
          columnaDescripcion: String(req.body?.columnaDescripcion ?? ''),
          columnaImporte: String(req.body?.columnaImporte ?? ''),
          columnaReferencia: req.body?.columnaReferencia != null ? String(req.body.columnaReferencia) : null,
          columnaSaldo: req.body?.columnaSaldo != null ? String(req.body.columnaSaldo) : null,
          separadorDecimal: req.body?.separadorDecimal != null ? String(req.body.separadorDecimal) : ',',
          formatoFecha: req.body?.formatoFecha != null ? String(req.body.formatoFecha) : 'dd/MM/yyyy',
          delimiter: req.body?.delimiter != null ? String(req.body.delimiter) : ';',
          signoDebitoCredito:
            req.body?.signoDebitoCredito != null
              ? String(req.body.signoDebitoCredito)
              : 'signed_importe',
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_csv_mapping_create', 'banco_csv_mapping', String(result.data.id))
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/bancos/csv-mappings/:id',
    bankModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        if (!requireWriteRole(req, res)) return
        const id = parseId(String(req.params.id))
        if (id == null) {
          res.status(400).json({ success: false, error: 'Invalid mapping id' })
          return
        }
        const authReq = req as AuthenticatedRequest
        const result = await bancoExtracto.updateMapping(getTenantId(req), id, {
          ...(req.body?.bancoCode != null ? { bancoCode: String(req.body.bancoCode) } : {}),
          ...(req.body?.columnaFecha != null ? { columnaFecha: String(req.body.columnaFecha) } : {}),
          ...(req.body?.columnaDescripcion != null
            ? { columnaDescripcion: String(req.body.columnaDescripcion) }
            : {}),
          ...(req.body?.columnaImporte != null
            ? { columnaImporte: String(req.body.columnaImporte) }
            : {}),
          ...(req.body?.columnaReferencia !== undefined
            ? {
                columnaReferencia:
                  req.body.columnaReferencia == null ? null : String(req.body.columnaReferencia),
              }
            : {}),
          ...(req.body?.columnaSaldo !== undefined
            ? {
                columnaSaldo: req.body.columnaSaldo == null ? null : String(req.body.columnaSaldo),
              }
            : {}),
          ...(req.body?.separadorDecimal != null
            ? { separadorDecimal: String(req.body.separadorDecimal) }
            : {}),
          ...(req.body?.formatoFecha != null ? { formatoFecha: String(req.body.formatoFecha) } : {}),
          ...(req.body?.delimiter != null ? { delimiter: String(req.body.delimiter) } : {}),
          ...(req.body?.signoDebitoCredito != null
            ? { signoDebitoCredito: String(req.body.signoDebitoCredito) }
            : {}),
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await writeAudit(authReq, 'banco_csv_mapping_update', 'banco_csv_mapping', String(id))
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
