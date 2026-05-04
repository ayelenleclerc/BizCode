import { Prisma } from '@prisma/client'
import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { clienteBodySchema } from '../schemas/domain'
import type { ClienteInput } from '../createApp.types'
import { parseCsvWithFixedHeaders, CSV_IMPORT_MAX_ROWS } from '../csvImport'
import { paginatedListJson, parseListPagination } from '../services/listPagination'
import type { RestRouteContext } from './restRouteTypes'
import {
  buildClienteImportTemplateCsv,
  CLIENTE_IMPORT_CSV_HEADERS,
  csvRowToRawCliente,
  errorMessage,
  getTenantId,
  singleCsvUpload,
  validateClienteInput,
} from './restDomainShared'

/**
 * @en Customer REST routes (`/api/clientes`, CSV import).
 */
export function registerClientesRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx

  app.get('/api/clientes', requirePermission('customers.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const filtro = (req.query.q as string) || ''
      const { take, skip } = parseListPagination(req)
      const where = {
        tenantId,
        OR: [
          { rsocial: { contains: filtro, mode: Prisma.QueryMode.insensitive } },
          { cuit: { contains: filtro, mode: Prisma.QueryMode.insensitive } },
          { codigo: { equals: filtro ? parseInt(filtro, 10) : undefined } },
        ],
      }
      const [total, clientes] = await Promise.all([
        prisma.cliente.count({ where }),
        prisma.cliente.findMany({
          where,
          orderBy: { codigo: 'asc' },
          take,
          skip,
        }),
      ])
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
        const errors: { row: number; message: string }[] = []
        const seenCodigos = new Map<number, number>()
        const validatedRows: { row: number; input: ClienteInput }[] = []
        for (const [i, row] of parsedCsv.records.entries()) {
          const rowNum = i + 2
          const raw = csvRowToRawCliente(row)
          const parsed = validateClienteInput(raw)
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
            : await prisma.cliente.findMany({
                where: { tenantId, codigo: { in: codigos } },
                select: { codigo: true },
              })
        const existingSet = new Set(existing.map((e) => e.codigo))
        const toInsert: ClienteInput[] = []
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
            await tx.cliente.create({ data: { ...data, tenantId } })
            created += 1
          }
        })
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

  app.get('/api/clientes/:id', requirePermission('customers.read'), async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantId(req)
      const cliente = await prisma.cliente.findFirst({
        where: { id: parseInt(String(req.params.id), 10), tenantId },
      })
      res.json({ success: true, data: cliente })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: errorMessage(err) })
    }
  })

  app.post(
    '/api/clientes',
    requirePermission('customers.manage'),
    validateBody(clienteBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const body = req.body as ClienteInput
        if (body.deliveryZoneId != null) {
          const zone = await prisma.deliveryZone.findFirst({
            where: { id: body.deliveryZoneId, tenantId },
          })
          if (!zone) {
            res.status(400).json({ success: false, error: 'deliveryZoneId does not belong to this tenant' })
            return
          }
        }
        const cliente = await prisma.cliente.create({
          data: { ...body, tenantId },
        })
        await writeAudit(req as AuthenticatedRequest, 'cliente_create', 'cliente', String(cliente.id))
        res.json({ success: true, data: cliente })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/clientes/:id',
    requirePermission('customers.manage'),
    validateBody(clienteBodySchema),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const parsedBody = req.body as ClienteInput
        const authReq = req as AuthenticatedRequest
        const role = authReq.auth?.claims.role
        const canManageFinancials = role === 'owner' || role === 'manager'

        const { creditLimit, creditDays, suspended, ...baseBody } = parsedBody
        const data = canManageFinancials
          ? { ...baseBody, creditLimit, creditDays, suspended }
          : baseBody

        if (data.deliveryZoneId != null) {
          const zone = await prisma.deliveryZone.findFirst({
            where: { id: data.deliveryZoneId, tenantId },
          })
          if (!zone) {
            res.status(400).json({ success: false, error: 'deliveryZoneId does not belong to this tenant' })
            return
          }
        }

        const id = parseInt(String(req.params.id), 10)
        const existingCliente = await prisma.cliente.findFirst({ where: { id, tenantId } })
        if (!existingCliente) {
          res.status(404).json({ success: false, error: 'Cliente not found' })
          return
        }

        const cliente = await prisma.cliente.update({
          where: { id },
          data,
        })
        await writeAudit(authReq, 'cliente_update', 'cliente', String(cliente.id))
        res.json({ success: true, data: cliente })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
