import type { Application, Request, Response } from 'express'
import type { PrismaClient, Prisma } from '@prisma/client'
import { requirePermission, type AuthenticatedRequest } from './auth'
import { writeAuditEvent } from './audit'
import { validateCUIT } from '../src/lib/validators'
import { csvImportUploadSingle, parseCsvWithFixedHeaders, CSV_IMPORT_MAX_ROWS } from './csvImport'
import { validateBody } from './middleware/validateBody'
import {
  articuloBodySchema,
  clienteBodySchema,
  deliveryZoneCreateBodySchema,
  deliveryZoneUpdateBodySchema,
  facturaBodySchema,
  facturaVoidBodySchema,
  proveedorBodySchema,
  rubroBodySchema,
} from './schemas/domain'
import type {
  ArticuloInput,
  ClienteInput,
  DeliveryZoneCreateParsed,
  DeliveryZoneUpdateParsed,
  FacturaInput,
  ProveedorInput,
  RubroInput,
} from './createApp.types'
import { dispatchNotification } from './channels'
import { parseListPagination } from './services/listPagination'


function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function getTenantId(req: Request): number {
  return (req as AuthenticatedRequest).auth!.claims.tenantId
}

type ValidationSuccess<T> = { ok: true; value: T }
type ValidationFailure = { ok: false; error: string }
type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseOptionalString(value: unknown, maxLength: number, field: string): ValidationResult<string | null | undefined> {
  if (value === undefined) return { ok: true, value: undefined }
  if (value === null) return { ok: true, value: null }
  if (typeof value !== 'string') return { ok: false, error: `${field} must be a string` }
  const trimmed = value.trim()
  if (trimmed.length === 0) return { ok: true, value: null }
  if (trimmed.length > maxLength) return { ok: false, error: `${field} must be at most ${maxLength} characters` }
  return { ok: true, value: trimmed }
}

function parseOptionalNumber(value: unknown, field: string, min?: number): ValidationResult<number | null | undefined> {
  if (value === undefined) return { ok: true, value: undefined }
  if (value === null) return { ok: true, value: null }
  if (typeof value !== 'number' || Number.isNaN(value)) return { ok: false, error: `${field} must be a number` }
  if (min !== undefined && value < min) return { ok: false, error: `${field} must be >= ${min}` }
  return { ok: true, value }
}

function parseRequiredNumber(value: unknown, field: string, min?: number): ValidationResult<number> {
  if (typeof value !== 'number' || Number.isNaN(value)) return { ok: false, error: `${field} must be a number` }
  if (min !== undefined && value < min) return { ok: false, error: `${field} must be >= ${min}` }
  return { ok: true, value }
}

function parseRequiredInteger(value: unknown, field: string, min?: number): ValidationResult<number> {
  if (typeof value !== 'number' || !Number.isInteger(value)) return { ok: false, error: `${field} must be an integer` }
  if (min !== undefined && value < min) return { ok: false, error: `${field} must be >= ${min}` }
  return { ok: true, value }
}

function validateClienteInput(raw: unknown): ValidationResult<ClienteInput> {
  if (!isObjectRecord(raw)) return { ok: false, error: 'Request body must be an object' }
  const codigo = parseRequiredInteger(raw.codigo, 'codigo', 1)
  if (!codigo.ok) return codigo
  if (typeof raw.rsocial !== 'string' || raw.rsocial.trim().length < 3 || raw.rsocial.trim().length > 30) {
    return { ok: false, error: 'rsocial must be a string between 3 and 30 characters' }
  }
  if (typeof raw.condIva !== 'string' || !['RI', 'Mono', 'CF', 'Exento'].includes(raw.condIva)) {
    return { ok: false, error: 'condIva must be one of: RI, Mono, CF, Exento' }
  }
  if (typeof raw.activo !== 'boolean') return { ok: false, error: 'activo must be a boolean' }

  const fantasia = parseOptionalString(raw.fantasia, 30, 'fantasia')
  if (!fantasia.ok) return fantasia
  const domicilio = parseOptionalString(raw.domicilio, 40, 'domicilio')
  if (!domicilio.ok) return domicilio
  const localidad = parseOptionalString(raw.localidad, 25, 'localidad')
  if (!localidad.ok) return localidad
  const cpost = parseOptionalString(raw.cpost, 8, 'cpost')
  if (!cpost.ok) return cpost
  const telef = parseOptionalString(raw.telef, 25, 'telef')
  if (!telef.ok) return telef
  const email = parseOptionalString(raw.email, 50, 'email')
  if (!email.ok) return email

  const cuit = parseOptionalString(raw.cuit, 14, 'cuit')
  if (!cuit.ok) return cuit
  if (cuit.value && !validateCUIT(cuit.value)) return { ok: false, error: 'cuit must be a valid Argentine CUIT' }

  const creditLimit = parseOptionalNumber(raw.creditLimit, 'creditLimit', 0)
  if (!creditLimit.ok) return creditLimit
  const creditDays = parseOptionalNumber(raw.creditDays, 'creditDays', 0)
  if (!creditDays.ok) return creditDays
  if (creditDays.value !== undefined && creditDays.value !== null && !Number.isInteger(creditDays.value)) {
    return { ok: false, error: 'creditDays must be an integer' }
  }
  if (raw.suspended !== undefined && typeof raw.suspended !== 'boolean') {
    return { ok: false, error: 'suspended must be a boolean' }
  }
  const deliveryZoneId = parseOptionalNumber(raw.deliveryZoneId, 'deliveryZoneId', 1)
  if (!deliveryZoneId.ok) return deliveryZoneId
  if (deliveryZoneId.value !== undefined && deliveryZoneId.value !== null && !Number.isInteger(deliveryZoneId.value)) {
    return { ok: false, error: 'deliveryZoneId must be an integer' }
  }

  return {
    ok: true,
    value: {
      codigo: codigo.value,
      rsocial: raw.rsocial.trim(),
      condIva: raw.condIva as ClienteInput['condIva'],
      activo: raw.activo,
      ...(fantasia.value !== undefined && { fantasia: fantasia.value }),
      ...(cuit.value !== undefined && { cuit: cuit.value }),
      ...(domicilio.value !== undefined && { domicilio: domicilio.value }),
      ...(localidad.value !== undefined && { localidad: localidad.value }),
      ...(cpost.value !== undefined && { cpost: cpost.value }),
      ...(telef.value !== undefined && { telef: telef.value }),
      ...(email.value !== undefined && { email: email.value }),
      ...(creditLimit.value !== undefined && { creditLimit: creditLimit.value }),
      ...(creditDays.value !== undefined && { creditDays: creditDays.value ?? 0 }),
      ...(raw.suspended !== undefined && { suspended: raw.suspended }),
      ...(deliveryZoneId.value !== undefined && { deliveryZoneId: deliveryZoneId.value }),
    },
  }
}

function validateArticuloInput(raw: unknown): ValidationResult<ArticuloInput> {
  if (!isObjectRecord(raw)) return { ok: false, error: 'Request body must be an object' }
  const codigo = parseRequiredInteger(raw.codigo, 'codigo', 1)
  if (!codigo.ok) return codigo
  if (typeof raw.descripcion !== 'string' || raw.descripcion.trim().length < 3 || raw.descripcion.trim().length > 30) {
    return { ok: false, error: 'descripcion must be a string between 3 and 30 characters' }
  }
  const rubroId = parseRequiredInteger(raw.rubroId, 'rubroId', 1)
  if (!rubroId.ok) return rubroId
  if (typeof raw.condIva !== 'string' || !['1', '2', '3'].includes(raw.condIva)) {
    return { ok: false, error: 'condIva must be one of: 1, 2, 3' }
  }
  if (typeof raw.umedida !== 'string' || raw.umedida.trim().length < 2 || raw.umedida.trim().length > 6) {
    return { ok: false, error: 'umedida must be a string between 2 and 6 characters' }
  }
  const precioLista1 = parseRequiredNumber(raw.precioLista1, 'precioLista1', 0.01)
  if (!precioLista1.ok) return precioLista1
  const precioLista2 = parseRequiredNumber(raw.precioLista2, 'precioLista2', 0.01)
  if (!precioLista2.ok) return precioLista2
  const costo = parseRequiredNumber(raw.costo, 'costo', 0.01)
  if (!costo.ok) return costo
  const stock = parseRequiredInteger(raw.stock, 'stock', 0)
  if (!stock.ok) return stock
  const minimo = parseRequiredInteger(raw.minimo, 'minimo', 0)
  if (!minimo.ok) return minimo
  if (typeof raw.activo !== 'boolean') return { ok: false, error: 'activo must be a boolean' }

  return {
    ok: true,
    value: {
      codigo: codigo.value,
      descripcion: raw.descripcion.trim(),
      rubroId: rubroId.value,
      condIva: raw.condIva as ArticuloInput['condIva'],
      umedida: raw.umedida.trim(),
      precioLista1: precioLista1.value,
      precioLista2: precioLista2.value,
      costo: costo.value,
      stock: stock.value,
      minimo: minimo.value,
      activo: raw.activo,
    },
  }
}

function validateRubroInput(raw: unknown): ValidationResult<RubroInput> {
  if (!isObjectRecord(raw)) return { ok: false, error: 'Request body must be an object' }
  const codigo = parseRequiredInteger(raw.codigo, 'codigo', 1)
  if (!codigo.ok) return codigo
  if (typeof raw.nombre !== 'string' || raw.nombre.trim().length === 0 || raw.nombre.trim().length > 20) {
    return { ok: false, error: 'nombre must be a string between 1 and 20 characters' }
  }
  return { ok: true, value: { codigo: codigo.value, nombre: raw.nombre.trim() } }
}

function validateProveedorInput(raw: unknown): ValidationResult<ProveedorInput> {
  if (!isObjectRecord(raw)) return { ok: false, error: 'Request body must be an object' }
  const codigo = parseRequiredInteger(raw.codigo, 'codigo', 1)
  if (!codigo.ok) return codigo
  if (typeof raw.rsocial !== 'string' || raw.rsocial.trim().length < 3 || raw.rsocial.trim().length > 30) {
    return { ok: false, error: 'rsocial must be a string between 3 and 30 characters' }
  }
  if (typeof raw.condIva !== 'string' || !['RI', 'Mono', 'CF', 'Exento'].includes(raw.condIva)) {
    return { ok: false, error: 'condIva must be one of: RI, Mono, CF, Exento' }
  }
  if (typeof raw.activo !== 'boolean') return { ok: false, error: 'activo must be a boolean' }
  const fantasia = parseOptionalString(raw.fantasia, 30, 'fantasia')
  if (!fantasia.ok) return fantasia
  const telef = parseOptionalString(raw.telef, 25, 'telef')
  if (!telef.ok) return telef
  const email = parseOptionalString(raw.email, 50, 'email')
  if (!email.ok) return email
  const cuit = parseOptionalString(raw.cuit, 14, 'cuit')
  if (!cuit.ok) return cuit
  if (cuit.value && !validateCUIT(cuit.value)) return { ok: false, error: 'cuit must be a valid Argentine CUIT' }
  return {
    ok: true,
    value: {
      codigo: codigo.value,
      rsocial: raw.rsocial.trim(),
      condIva: raw.condIva as ProveedorInput['condIva'],
      activo: raw.activo,
      ...(fantasia.value !== undefined && { fantasia: fantasia.value }),
      ...(cuit.value !== undefined && { cuit: cuit.value }),
      ...(telef.value !== undefined && { telef: telef.value }),
      ...(email.value !== undefined && { email: email.value }),
    },
  }
}

/**
 * `fecha` del cliente (input `YYYY-MM-DD` o ISO-8601) → `Date` para Prisma `DateTime`.
 * Las cadenas solo-fecha fallan en el validador estricto de entrada de Prisma en algunos entornos (p. ej. CI).
 */
function facturaFechaToPrismaDate(isoDate: string): Date {
  const trimmed = isoDate.trim()
  const dayOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (dayOnly) {
    const y = Number(dayOnly[1])
    const mo = Number(dayOnly[2])
    const d = Number(dayOnly[3])
    return new Date(Date.UTC(y, mo - 1, d, 0, 0, 0, 0))
  }
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`fecha must be YYYY-MM-DD or ISO-8601, got: ${isoDate}`)
  }
  return parsed
}

const CLIENTE_IMPORT_CSV_HEADERS = [
  'codigo',
  'rsocial',
  'condIva',
  'activo',
  'fantasia',
  'cuit',
  'domicilio',
  'localidad',
  'cpost',
  'telef',
  'email',
  'creditLimit',
  'creditDays',
  'suspended',
  'deliveryZoneId',
] as const

const singleCsvUpload = csvImportUploadSingle()

const RUBRO_IMPORT_CSV_HEADERS = ['codigo', 'nombre'] as const

const ARTICULO_IMPORT_CSV_HEADERS = [
  'codigo',
  'descripcion',
  'rubroCodigo',
  'condIva',
  'umedida',
  'precioLista1',
  'precioLista2',
  'costo',
  'stock',
  'minimo',
  'activo',
] as const

const PROVEEDOR_IMPORT_CSV_HEADERS = [
  'codigo',
  'rsocial',
  'condIva',
  'activo',
  'fantasia',
  'cuit',
  'telef',
  'email',
] as const

function buildClienteImportTemplateCsv(): string {
  const header = CLIENTE_IMPORT_CSV_HEADERS.join(',')
  const example = [
    '1001',
    'Ejemplo SA',
    'RI',
    'true',
    '',
    '20-12345678-9',
    'Calle 123',
    'Córdoba',
    '5000',
    '351-5550100',
    'contacto@example.com',
    '',
    '0',
    'false',
    '',
  ].join(',')
  return `\uFEFF${header}\n${example}\n`
}

function optionalTrimmedCsv(value: string | undefined): string | undefined {
  const t = (value ?? '').trim()
  return t === '' ? undefined : t
}

/** `null` = invalid cell; `undefined` = empty (caller decides if allowed). */
function parseCsvBooleanCell(value: string): boolean | null | undefined {
  const v = value.trim().toLowerCase()
  if (v === '') return undefined
  if (['true', '1', 'yes', 'sí', 'si'].includes(v)) return true
  if (['false', '0', 'no'].includes(v)) return false
  return null
}

function csvRowToRawCliente(row: Record<string, string>): Record<string, unknown> {
  const raw: Record<string, unknown> = {}
  const codigoStr = (row.codigo ?? '').trim()
  if (codigoStr === '') {
    raw.codigo = undefined
  } else {
    const n = Number.parseInt(codigoStr, 10)
    raw.codigo = Number.isNaN(n) ? Number.NaN : n
  }
  const rs = (row.rsocial ?? '').trim()
  raw.rsocial = rs === '' ? undefined : rs
  const ci = (row.condIva ?? '').trim()
  raw.condIva = ci === '' ? undefined : ci
  const activoCell = (row.activo ?? '').trim()
  if (activoCell === '') {
    raw.activo = undefined
  } else {
    const b = parseCsvBooleanCell(activoCell)
    raw.activo = b === null ? null : b
  }
  const fantasia = optionalTrimmedCsv(row.fantasia)
  if (fantasia !== undefined) raw.fantasia = fantasia
  const cuit = optionalTrimmedCsv(row.cuit)
  if (cuit !== undefined) raw.cuit = cuit
  const domicilio = optionalTrimmedCsv(row.domicilio)
  if (domicilio !== undefined) raw.domicilio = domicilio
  const localidad = optionalTrimmedCsv(row.localidad)
  if (localidad !== undefined) raw.localidad = localidad
  const cpost = optionalTrimmedCsv(row.cpost)
  if (cpost !== undefined) raw.cpost = cpost
  const telef = optionalTrimmedCsv(row.telef)
  if (telef !== undefined) raw.telef = telef
  const email = optionalTrimmedCsv(row.email)
  if (email !== undefined) raw.email = email
  const cl = (row.creditLimit ?? '').trim()
  if (cl !== '') {
    const n = Number.parseFloat(cl)
    raw.creditLimit = Number.isNaN(n) ? Number.NaN : n
  }
  const cd = (row.creditDays ?? '').trim()
  if (cd !== '') {
    const n = Number.parseInt(cd, 10)
    raw.creditDays = Number.isNaN(n) ? Number.NaN : n
  }
  const sus = (row.suspended ?? '').trim()
  if (sus !== '') {
    const b = parseCsvBooleanCell(sus)
    raw.suspended = b === null ? null : b
  }
  const dz = (row.deliveryZoneId ?? '').trim()
  if (dz !== '') {
    const n = Number.parseInt(dz, 10)
    raw.deliveryZoneId = Number.isNaN(n) ? Number.NaN : n
  }
  return raw
}

function buildRubroImportTemplateCsv(): string {
  const header = RUBRO_IMPORT_CSV_HEADERS.join(',')
  const example = ['10', 'Ejemplo'].join(',')
  return `\uFEFF${header}\n${example}\n`
}

function csvRowToRawRubro(row: Record<string, string>): Record<string, unknown> {
  const raw: Record<string, unknown> = {}
  const codigoStr = (row.codigo ?? '').trim()
  if (codigoStr === '') raw.codigo = undefined
  else {
    const n = Number.parseInt(codigoStr, 10)
    raw.codigo = Number.isNaN(n) ? Number.NaN : n
  }
  const nombre = (row.nombre ?? '').trim()
  raw.nombre = nombre === '' ? undefined : nombre
  return raw
}

function buildArticuloImportTemplateCsv(): string {
  const header = ARTICULO_IMPORT_CSV_HEADERS.join(',')
  const example = ['100', 'Producto demo', '10', '1', 'UN', '100.50', '95.00', '50.00', '0', '0', 'true'].join(',')
  return `\uFEFF${header}\n${example}\n`
}

function csvRowToRawArticulo(row: Record<string, string>): Record<string, unknown> {
  const raw: Record<string, unknown> = {}
  const codigoStr = (row.codigo ?? '').trim()
  if (codigoStr === '') raw.codigo = undefined
  else {
    const n = Number.parseInt(codigoStr, 10)
    raw.codigo = Number.isNaN(n) ? Number.NaN : n
  }
  const desc = (row.descripcion ?? '').trim()
  raw.descripcion = desc === '' ? undefined : desc
  const rc = (row.rubroCodigo ?? '').trim()
  if (rc === '') raw.rubroCodigo = undefined
  else {
    const n = Number.parseInt(rc, 10)
    raw.rubroCodigo = Number.isNaN(n) ? Number.NaN : n
  }
  const ci = (row.condIva ?? '').trim()
  raw.condIva = ci === '' ? undefined : ci
  const um = (row.umedida ?? '').trim()
  raw.umedida = um === '' ? undefined : um
  for (const key of ['precioLista1', 'precioLista2', 'costo'] as const) {
    const s = (row[key] ?? '').trim()
    if (s !== '') {
      const n = Number.parseFloat(s)
      raw[key] = Number.isNaN(n) ? Number.NaN : n
    }
  }
  for (const key of ['stock', 'minimo'] as const) {
    const s = (row[key] ?? '').trim()
    if (s !== '') {
      const n = Number.parseInt(s, 10)
      raw[key] = Number.isNaN(n) ? Number.NaN : n
    }
  }
  const act = (row.activo ?? '').trim()
  if (act === '') raw.activo = undefined
  else {
    const b = parseCsvBooleanCell(act)
    raw.activo = b === null ? null : b
  }
  return raw
}

function buildProveedorImportTemplateCsv(): string {
  const header = PROVEEDOR_IMPORT_CSV_HEADERS.join(',')
  const example = ['2001', 'Proveedor Demo SA', 'RI', 'true', '', '', '', ''].join(',')
  return `\uFEFF${header}\n${example}\n`
}

function csvRowToRawProveedor(row: Record<string, string>): Record<string, unknown> {
  const raw: Record<string, unknown> = {}
  const codigoStr = (row.codigo ?? '').trim()
  if (codigoStr === '') raw.codigo = undefined
  else {
    const n = Number.parseInt(codigoStr, 10)
    raw.codigo = Number.isNaN(n) ? Number.NaN : n
  }
  const rs = (row.rsocial ?? '').trim()
  raw.rsocial = rs === '' ? undefined : rs
  const ci = (row.condIva ?? '').trim()
  raw.condIva = ci === '' ? undefined : ci
  const act = (row.activo ?? '').trim()
  if (act === '') raw.activo = undefined
  else {
    const b = parseCsvBooleanCell(act)
    raw.activo = b === null ? null : b
  }
  const fantasia = optionalTrimmedCsv(row.fantasia)
  if (fantasia !== undefined) raw.fantasia = fantasia
  const cuit = optionalTrimmedCsv(row.cuit)
  if (cuit !== undefined) raw.cuit = cuit
  const telef = optionalTrimmedCsv(row.telef)
  if (telef !== undefined) raw.telef = telef
  const email = optionalTrimmedCsv(row.email)
  if (email !== undefined) raw.email = email
  return raw
}

/**
 * @en Registers core REST handlers (customers, products, invoicing, delivery zones, health).
 */
export function registerRestDomainRoutes(app: Application, prisma: PrismaClient): void {
    function writeAudit(
      req: AuthenticatedRequest,
      action: string,
      resource: string,
      resourceId?: string,
      metadata?: Prisma.InputJsonValue,
    ): Promise<void> {
      return writeAuditEvent({
        prisma,
        tenantId: req.auth!.claims.tenantId,
        userId: req.auth!.claims.userId,
        action,
        resource,
        resourceId: resourceId ?? null,
        ipAddress: req.ip,
        metadata,
      })
    }

    // ============ CLIENTES ============

    app.get('/api/clientes', requirePermission('customers.read'), async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const filtro = (req.query.q as string) || ''
        const { take, skip } = parseListPagination(req)
        const clientes = await prisma.cliente.findMany({
          where: {
            tenantId,
            OR: [
              { rsocial: { contains: filtro, mode: 'insensitive' } },
              { cuit: { contains: filtro, mode: 'insensitive' } },
              { codigo: { equals: filtro ? parseInt(filtro, 10) : undefined } },
            ],
          },
          orderBy: { codigo: 'asc' },
          take,
          skip,
        })
        res.json({ success: true, data: clientes })
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
      const file = (req as Request & { file?: Express.Multer.File }).file
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

        // Strip financial management fields for roles without the right
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

    // ============ ARTICULOS ============

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
      const file = (req as Request & { file?: Express.Multer.File }).file
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

    // ============ RUBROS ============

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
      const file = (req as Request & { file?: Express.Multer.File }).file
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

    // ============ PROVEEDORES ============

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
      const file = (req as Request & { file?: Express.Multer.File }).file
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

    // ============ FORMAS DE PAGO ============

    app.get('/api/formas-pago', requirePermission('sales.create'), async (_req: Request, res: Response) => {
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

    app.get('/api/facturas', requirePermission('reports.operational.read'), async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const { take, skip } = parseListPagination(req)
        const facturas = await prisma.factura.findMany({
          where: { tenantId },
          include: { cliente: true, items: true },
          orderBy: { fecha: 'desc' },
          take,
          skip,
        })
        res.json({ success: true, data: facturas })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    })

    app.post(
      '/api/facturas',
      requirePermission('sales.create'),
      validateBody(facturaBodySchema),
      async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const parsedValue = req.body as FacturaInput
        const { items, fecha, ...factura } = parsedValue
        const clienteId = factura.clienteId

        const articuloIds = [...new Set(items.map((it) => it.articuloId))]
        const articulosOk = await prisma.articulo.findMany({
          where: { tenantId, id: { in: articuloIds } },
          select: { id: true },
        })
        if (articulosOk.length !== articuloIds.length) {
          res.status(400).json({ success: false, error: 'One or more articuloId values are not valid for this tenant' })
          return
        }

        // Check suspension before creating the factura
        const clienteCheck = await prisma.cliente.findFirst({
          where: { id: clienteId, tenantId },
          select: { suspended: true },
        })
        if (!clienteCheck) {
          res.status(400).json({ success: false, error: 'clienteId is not valid for this tenant' })
          return
        }
        if (clienteCheck.suspended) {
          res.status(422).json({ success: false, error: 'CLIENT_SUSPENDED' })
          return
        }

        // Create factura and update customer balance atomically
        const [result, updatedCliente] = await prisma.$transaction(async (tx) => {
          const newFactura = await tx.factura.create({
            data: {
              ...factura,
              fecha: facturaFechaToPrismaDate(fecha),
              tenantId,
              items: { create: items },
            } as Parameters<typeof prisma.factura.create>[0]['data'],
            include: { items: true },
          })

          const updated = await tx.cliente.update({
            where: { id: clienteId },
            data: { balance: { increment: newFactura.total } },
            select: { id: true, rsocial: true, balance: true, creditLimit: true },
          })

          return [newFactura, updated] as const
        })

        // Dispatch to all configured channels if balance exceeds credit limit (non-blocking)
        if (
          updatedCliente.creditLimit !== null &&
          Number(updatedCliente.balance) > Number(updatedCliente.creditLimit)
        ) {
          const authReq = req as AuthenticatedRequest
          dispatchNotification(prisma, authReq.auth!.claims.tenantId, 'credit_limit_exceeded', {
            clienteId: updatedCliente.id,
            rsocial: updatedCliente.rsocial,
            amount: String(updatedCliente.balance),
            limit: String(updatedCliente.creditLimit),
          }).catch(() => { /* notification failure must not block the sale */ })
        }

        await writeAudit(req as AuthenticatedRequest, 'factura_create', 'factura', String(result.id))
        res.json({ success: true, data: result })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
      },
    )

    // ============ ANULACIÓN DE FACTURAS ============

    app.put(
      '/api/facturas/:id/void',
      requirePermission('sales.cancel'),
      validateBody(facturaVoidBodySchema),
      async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = getTenantId(req)
        const id = parseInt(String(req.params.id), 10)
        const { motivo } = req.body as { motivo: string }

        const factura = await prisma.factura.findFirst({
          where: { id, tenantId },
          select: { id: true, estado: true, total: true, clienteId: true },
        })

        if (!factura) {
          res.status(404).json({ success: false, error: 'Factura not found' })
          return
        }

        if (factura.estado === 'N') {
          res.status(409).json({ success: false, error: 'Factura already voided' })
          return
        }

        // Void atomically: set estado='N', reverse customer balance
        const updated = await prisma.$transaction(async (tx) => {
          const voided = await tx.factura.update({
            where: { id },
            data: { estado: 'N' },
          })
          await tx.cliente.update({
            where: { id: factura.clienteId },
            data: { balance: { decrement: factura.total } },
          })
          return voided
        })

        await writeAudit(authReq, 'factura_void', 'factura', String(id), { motivo })
        res.json({ success: true, data: updated })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
      },
    )

    // ============ ZONAS DE ENTREGA ============

    app.get('/api/zonas-entrega', requirePermission('logistics.read'), async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = authReq.auth!.claims.tenantId
        const { take, skip } = parseListPagination(req)
        const zones = await prisma.deliveryZone.findMany({
          where: { tenantId },
          orderBy: { nombre: 'asc' },
          take,
          skip,
        })
        res.json({ success: true, data: zones })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    })

    app.post(
      '/api/zonas-entrega',
      requirePermission('logistics.manage'),
      validateBody(deliveryZoneCreateBodySchema),
      async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = authReq.auth!.claims.tenantId
        const { nombre, tipo, diasEntrega, horario } = req.body as DeliveryZoneCreateParsed
        const zone = await prisma.deliveryZone.create({
          data: { tenantId, nombre, tipo, diasEntrega, horario },
        })
        await writeAudit(authReq, 'delivery_zone_create', 'delivery_zone', String(zone.id))
        res.status(201).json({ success: true, data: zone })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
      },
    )

    app.put(
      '/api/zonas-entrega/:id',
      requirePermission('logistics.manage'),
      validateBody(deliveryZoneUpdateBodySchema),
      async (req: Request, res: Response) => {
      try {
        const authReq = req as AuthenticatedRequest
        const tenantId = authReq.auth!.claims.tenantId
        const id = parseInt(String(req.params.id), 10)

        // Verify the zone belongs to the tenant before updating
        const existing = await prisma.deliveryZone.findFirst({ where: { id, tenantId } })
        if (!existing) {
          res.status(404).json({ success: false, error: 'Delivery zone not found' })
          return
        }

        const { nombre, tipo, diasEntrega, horario, activo } = req.body as DeliveryZoneUpdateParsed
        const zone = await prisma.deliveryZone.update({
          where: { id },
          data: {
            ...(nombre !== undefined && { nombre }),
            ...(tipo !== undefined && { tipo }),
            ...(diasEntrega !== undefined && { diasEntrega }),
            ...(horario !== undefined && { horario }),
            ...(activo !== undefined && { activo }),
          },
        })
        await writeAudit(authReq, 'delivery_zone_update', 'delivery_zone', String(zone.id))
        res.json({ success: true, data: zone })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
      },
    )

    app.get('/api/health', (_req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() })
    })
}


