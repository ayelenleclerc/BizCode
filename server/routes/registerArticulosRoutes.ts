import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { articuloBodySchema } from '../schemas/domain'
import type { ArticuloInput } from '../createApp.types'
import { parseCsvWithFixedHeaders, CSV_IMPORT_MAX_ROWS } from '../csvImport'
import { parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import {
  ARTICULO_IMPORT_CSV_HEADERS,
  buildArticuloImportTemplateCsv,
  csvRowToRawArticulo,
  errorMessage,
  getTenantId,
  singleCsvUpload,
  validateArticuloInput,
} from './restDomainShared'

/**
 * @en Product (articulo) REST routes and CSV import.
 */
export function registerArticulosRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx

  app.get('/api/articulos', requirePermission('products.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const filtro = (req.query.q as string) || ''
      const { take, skip } = parseListPagination(req)
      const articulos = await prisma.articulo.findMany({
        where: {
          tenantId,
          OR: [
            { descripcion: { contains: filtro, mode: 'insensitive' } },
            { codigo: { equals: filtro ? parseInt(filtro, 10) : undefined } },
          ],
        },
        include: { rubro: true },
        orderBy: { codigo: 'asc' },
        take,
        skip,
      })
      res.json({ success: true, data: articulos })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })
  
  app.get('/api/articulos/:id', requirePermission('products.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const articulo = await prisma.articulo.findFirst({
        where: { id: parseInt(String(req.params.id), 10), tenantId },
        include: { rubro: true },
      })
      res.json({ success: true, data: articulo })
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
      const rubro = await prisma.rubro.findFirst({
        where: { id: body.rubroId, tenantId },
      })
      if (!rubro) {
        res.status(400).json({ success: false, error: 'rubroId is not valid for this tenant' })
        return
      }
      const articulo = await prisma.articulo.create({
        data: { ...body, tenantId },
      })
      await writeAudit(req as AuthenticatedRequest, 'articulo_create', 'articulo', String(articulo.id))
      res.json({ success: true, data: articulo })
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
      const rubro = await prisma.rubro.findFirst({
        where: { id: body.rubroId, tenantId },
      })
      if (!rubro) {
        res.status(400).json({ success: false, error: 'rubroId is not valid for this tenant' })
        return
      }
      const id = parseInt(String(req.params.id), 10)
      const existing = await prisma.articulo.findFirst({ where: { id, tenantId } })
      if (!existing) {
        res.status(404).json({ success: false, error: 'Articulo not found' })
        return
      }
      const articulo = await prisma.articulo.update({
        where: { id },
        data: body,
      })
      await writeAudit(req as AuthenticatedRequest, 'articulo_update', 'articulo', String(articulo.id))
      res.json({ success: true, data: articulo })
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
          const rubrosDb = await prisma.rubro.findMany({
            where: { tenantId },
            select: { id: true, codigo: true },
          })
          const rubroByCodigo = new Map(rubrosDb.map((r) => [r.codigo, r.id]))
          const errors: { row: number; message: string }[] = []
          const seenCodigos = new Map<number, number>()
          const validatedRows: { row: number; input: ArticuloInput }[] = []
          for (const [i, row] of parsedCsv.records.entries()) {
            const rowNum = i + 2
            const raw = csvRowToRawArticulo(row)
            const rubroCodigo = raw.rubroCodigo
            if (typeof rubroCodigo !== 'number' || !Number.isInteger(rubroCodigo)) {
              errors.push({ row: rowNum, message: 'rubroCodigo must be a valid integer' })
              continue
            }
            const rubroId = rubroByCodigo.get(rubroCodigo)
            if (rubroId === undefined) {
              errors.push({ row: rowNum, message: `Unknown rubroCodigo ${rubroCodigo}` })
              continue
            }
            const { rubroCodigo: _rc, ...rest } = raw
            const forValidate = { ...rest, rubroId }
            const parsed = validateArticuloInput(forValidate)
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
              : await prisma.articulo.findMany({
                  where: { tenantId, codigo: { in: codigos } },
                  select: { codigo: true },
                })
          const existingSet = new Set(existing.map((e) => e.codigo))
          const toInsert: ArticuloInput[] = []
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
              await tx.articulo.create({ data: { ...data, tenantId } })
              created += 1
            }
          })
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
}
