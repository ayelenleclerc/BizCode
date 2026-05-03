import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { proveedorBodySchema } from '../schemas/domain'
import type { ProveedorInput } from '../createApp.types'
import { parseCsvWithFixedHeaders, CSV_IMPORT_MAX_ROWS } from '../csvImport'
import { parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import {
  PROVEEDOR_IMPORT_CSV_HEADERS,
  buildProveedorImportTemplateCsv,
  csvRowToRawProveedor,
  errorMessage,
  getTenantId,
  singleCsvUpload,
  validateProveedorInput,
} from './restDomainShared'

/**
 * @en Supplier REST routes and CSV import.
 */
export function registerProveedoresRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx

  app.get('/api/proveedores', requirePermission('suppliers.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const filtro = (req.query.q as string) || ''
      const { take, skip } = parseListPagination(req)
      const proveedores = await prisma.proveedor.findMany({
        where: {
          tenantId,
          OR: [
            { rsocial: { contains: filtro, mode: 'insensitive' } },
            { codigo: { equals: filtro ? parseInt(filtro, 10) : undefined } },
          ],
        },
        orderBy: { codigo: 'asc' },
        take,
        skip,
      })
      res.json({ success: true, data: proveedores })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })
  
  app.get('/api/proveedores/import/template', requirePermission('suppliers.manage'), (_req: Request, res: Response) => {
    const body = buildProveedorImportTemplateCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="proveedores_import_template.csv"')
    res.send(body)
  })
  
  app.post('/api/proveedores/import', requirePermission('suppliers.manage'), singleCsvUpload, (req: Request, res: Response) => {
    void (async () => {
    const file = (req as Request & { file?: { buffer: Buffer } }).file
    if (!file?.buffer) {
      res.status(400).json({ success: false, error: 'Expected multipart field "file" with a .csv file' })
      return
    }
    try {
          const tenantId = getTenantId(req)
          const parsedCsv = parseCsvWithFixedHeaders(file.buffer, PROVEEDOR_IMPORT_CSV_HEADERS, CSV_IMPORT_MAX_ROWS)
          if (!parsedCsv.ok) {
            res.status(400).json({ success: false, error: parsedCsv.error })
            return
          }
          const errors: { row: number; message: string }[] = []
          const seenCodigos = new Map<number, number>()
          const validatedRows: { row: number; input: ProveedorInput }[] = []
          for (const [i, row] of parsedCsv.records.entries()) {
            const rowNum = i + 2
            const raw = csvRowToRawProveedor(row)
            const parsed = validateProveedorInput(raw)
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
              : await prisma.proveedor.findMany({
                  where: { tenantId, codigo: { in: codigos } },
                  select: { codigo: true },
                })
          const existingSet = new Set(existing.map((e) => e.codigo))
          const toInsert: ProveedorInput[] = []
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
              await tx.proveedor.create({ data: { ...data, tenantId } })
              created += 1
            }
          })
          const authReq = req as AuthenticatedRequest
          await writeAudit(authReq, 'proveedor_import', 'proveedor', undefined, {
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
  
  app.get('/api/proveedores/:id', requirePermission('suppliers.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const proveedor = await prisma.proveedor.findFirst({
        where: { id: parseInt(String(req.params.id), 10), tenantId },
      })
      res.json({ success: true, data: proveedor })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })
  
  app.post(
    '/api/proveedores',
    requirePermission('suppliers.manage'),
    validateBody(proveedorBodySchema),
    async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const body = req.body as ProveedorInput
      const proveedor = await prisma.proveedor.create({ data: { ...body, tenantId } })
      await writeAudit(req as AuthenticatedRequest, 'proveedor_create', 'proveedor', String(proveedor.id))
      res.json({ success: true, data: proveedor })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
    },
  )
  
  app.put(
    '/api/proveedores/:id',
    requirePermission('suppliers.manage'),
    validateBody(proveedorBodySchema),
    async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const body = req.body as ProveedorInput
      const id = parseInt(String(req.params.id), 10)
      const existing = await prisma.proveedor.findFirst({ where: { id, tenantId } })
      if (!existing) {
        res.status(404).json({ success: false, error: 'Proveedor not found' })
        return
      }
      const proveedor = await prisma.proveedor.update({
        where: { id },
        data: body,
      })
      await writeAudit(req as AuthenticatedRequest, 'proveedor_update', 'proveedor', String(proveedor.id))
      res.json({ success: true, data: proveedor })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
    },
  )
}
