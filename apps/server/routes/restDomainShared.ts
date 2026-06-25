import type { Request } from 'express'
import { csvImportUploadSingle } from '../csvImport'
import { dbfImportUploadSingle } from '../dbfImport'
import type { AuthenticatedRequest } from '../auth'

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export function getTenantId(req: Request): number {
  const authReq = req as AuthenticatedRequest
  if (authReq.tenantId !== undefined) {
    return authReq.tenantId
  }
  return authReq.auth!.claims.tenantId
}

export function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * `fecha` del cliente (input `YYYY-MM-DD` o ISO-8601) -> `Date` para Prisma `DateTime`.
 * Las cadenas solo-fecha fallan en el validador estricto de entrada de Prisma en algunos entornos (p. ej. CI).
 */
export function facturaFechaToPrismaDate(isoDate: string): Date {
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

export const CLIENTE_IMPORT_CSV_HEADERS = [
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

export const singleCsvUpload = csvImportUploadSingle()

export const singleDbfUpload = dbfImportUploadSingle()

export const RUBRO_IMPORT_CSV_HEADERS = ['codigo', 'nombre'] as const

export const ARTICULO_IMPORT_CSV_HEADERS = [
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

export const PROVEEDOR_CATALOGO_IMPORT_CSV_HEADERS = [
  'codigo_proveedor',
  'codigo_interno',
  'precio',
  'unidad',
] as const

export const PROVEEDOR_IMPORT_CSV_HEADERS = [
  'codigo',
  'rsocial',
  'condIva',
  'activo',
  'fantasia',
  'cuit',
  'telef',
  'email',
] as const

export function buildClienteImportTemplateCsv(): string {
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

export function optionalTrimmedCsv(value: string | undefined): string | undefined {
  const t = (value ?? '').trim()
  return t === '' ? undefined : t
}

/** `null` = invalid cell; `undefined` = empty (caller decides if allowed). */
export function parseCsvBooleanCell(value: string): boolean | null | undefined {
  const v = value.trim().toLowerCase()
  if (v === '') return undefined
  if (['true', '1', 'yes', 'sí', 'si'].includes(v)) return true
  if (['false', '0', 'no'].includes(v)) return false
  return null
}

export function csvRowToRawCliente(row: Record<string, string>): Record<string, unknown> {
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

export function buildRubroImportTemplateCsv(): string {
  const header = RUBRO_IMPORT_CSV_HEADERS.join(',')
  const example = ['10', 'Ejemplo'].join(',')
  return `\uFEFF${header}\n${example}\n`
}

export function csvRowToRawRubro(row: Record<string, string>): Record<string, unknown> {
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

export function buildArticuloImportTemplateCsv(): string {
  const header = ARTICULO_IMPORT_CSV_HEADERS.join(',')
  const example = ['100', 'Producto demo', '10', '1', 'UN', '100.50', '95.00', '50.00', '0', '0', 'true'].join(',')
  return `\uFEFF${header}\n${example}\n`
}

export function csvRowToRawArticulo(row: Record<string, string>): Record<string, unknown> {
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

export function buildProveedorImportTemplateCsv(): string {
  const header = PROVEEDOR_IMPORT_CSV_HEADERS.join(',')
  const example = ['2001', 'Proveedor Demo SA', 'RI', 'true', '', '', '', ''].join(',')
  return `\uFEFF${header}\n${example}\n`
}

export function csvRowToRawProveedor(row: Record<string, string>): Record<string, unknown> {
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
