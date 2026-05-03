import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { rubroBodySchema } from '../schemas/domain'
import type { RubroInput } from '../createApp.types'
import { parseCsvWithFixedHeaders, CSV_IMPORT_MAX_ROWS } from '../csvImport'
import { parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import {
  RUBRO_IMPORT_CSV_HEADERS,
  buildRubroImportTemplateCsv,
  csvRowToRawRubro,
  errorMessage,
  getTenantId,
  singleCsvUpload,
  validateRubroInput,
} from './restDomainShared'

/**
 * @en Rubro (category) REST routes and CSV import.
 */
export function registerRubrosRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx

  app.get('/api/rubros', requirePermission('products.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const { take, skip } = parseListPagination(req)
      const rubros = await prisma.rubro.findMany({
        where: { tenantId },
        orderBy: { codigo: 'asc' },
        take,
        skip,
      })
      res.json({ success: true, data: rubros })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })
  
  app.post(
    '/api/rubros',
    requirePermission('products.manage'),
    validateBody(rubroBodySchema),
    async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const body = req.body as RubroInput
      const rubro = await prisma.rubro.create({ data: { ...body, tenantId } })
      await writeAudit(req as AuthenticatedRequest, 'rubro_create', 'rubro', String(rubro.id))
      res.json({ success: true, data: rubro })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
    },
  )
  
  app.get('/api/rubros/import/template', requirePermission('products.manage'), (_req: Request, res: Response) => {
    const body = buildRubroImportTemplateCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="rubros_import_template.csv"')
    res.send(body)
  })
  
  app.post('/api/rubros/import', requirePermission('products.manage'), singleCsvUpload, (req: Request, res: Response) => {
    void (async () => {
    const file = (req as Request & { file?: { buffer: Buffer } }).file
    if (!file?.buffer) {
      res.status(400).json({ success: false, error: 'Expected multipart field "file" with a .csv file' })
      return
    }
    try {
          const tenantId = getTenantId(req)
          const parsedCsv = parseCsvWithFixedHeaders(file.buffer, RUBRO_IMPORT_CSV_HEADERS, CSV_IMPORT_MAX_ROWS)
          if (!parsedCsv.ok) {
            res.status(400).json({ success: false, error: parsedCsv.error })
            return
          }
          const errors: { row: number; message: string }[] = []
          const seenCodigos = new Map<number, number>()
          const validatedRows: { row: number; input: RubroInput }[] = []
          for (const [i, row] of parsedCsv.records.entries()) {
            const rowNum = i + 2
            const raw = csvRowToRawRubro(row)
            const parsed = validateRubroInput(raw)
            if (!parsed.ok) {
              errors.push({ row: rowNum, message: parsed.error })
              continue
            }
            const codigo = parsed.value.codigo
            const firstRow = seenCodigos.get(codigo)
            if (firstRow !== undefined) {
              errors.push({
                row: rowNum,
                message: `Duplicate codigo ${codigo} (first occurrence on row ${firstRow})`,
              })
              continue
            }
            seenCodigos.set(codigo, rowNum)
            validatedRows.push({ row: rowNum, input: parsed.value })
          }
          const codigos = validatedRows.map((r) => r.input.codigo)
          const existing =
            codigos.length === 0
              ? []
              : await prisma.rubro.findMany({
                  where: { tenantId, codigo: { in: codigos } },
                  select: { codigo: true },
                })
          const existingSet = new Set(existing.map((e) => e.codigo))
          const toInsert: RubroInput[] = []
          for (const vr of validatedRows) {
            if (existingSet.has(vr.input.codigo)) {
              errors.push({ row: vr.row, message: `codigo ${vr.input.codigo} already exists` })
              continue
            }
            toInsert.push(vr.input)
          }
          let created = 0
          await prisma.$transaction(async (tx) => {
            for (const data of toInsert) {
              await tx.rubro.create({ data: { ...data, tenantId } })
              created += 1
            }
          })
          const authReq = req as AuthenticatedRequest
          await writeAudit(authReq, 'rubro_import', 'rubro', undefined, {
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
}
