import type { Request } from 'express'
import { validateCUIT } from '../../src/lib/validators'
import { csvImportUploadSingle } from '../csvImport'
import type { AuthenticatedRequest } from '../auth'
import type {
  ArticuloInput,
  ClienteInput,
  ProveedorInput,
  RubroInput,
} from '../createApp.types'

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export function getTenantId(req: Request): number {
  return (req as AuthenticatedRequest).auth!.claims.tenantId
}

export type ValidationSuccess<T> = { ok: true; value: T }
export type ValidationFailure = { ok: false; error: string }
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

export function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseOptionalString(value: unknown, maxLength: number, field: string): ValidationResult<string | null | undefined> {
  if (value === undefined) return { ok: true, value: undefined }
  if (value === null) return { ok: true, value: null }
  if (typeof value !== 'string') return { ok: false, error: `${field} must be a string` }
  const trimmed = value.trim()
  if (trimmed.length === 0) return { ok: true, value: null }
  if (trimmed.length > maxLength) return { ok: false, error: `${field} must be at most ${maxLength} characters` }
  return { ok: true, value: trimmed }
}

export function parseOptionalNumber(value: unknown, field: string, min?: number): ValidationResult<number | null | undefined> {
  if (value === undefined) return { ok: true, value: undefined }
  if (value === null) return { ok: true, value: null }
  if (typeof value !== 'number' || Number.isNaN(value)) return { ok: false, error: `${field} must be a number` }
  if (min !== undefined && value < min) return { ok: false, error: `${field} must be >= ${min}` }
  return { ok: true, value }
}

export function parseRequiredNumber(value: unknown, field: string, min?: number): ValidationResult<number> {
  if (typeof value !== 'number' || Number.isNaN(value)) return { ok: false, error: `${field} must be a number` }
  if (min !== undefined && value < min) return { ok: false, error: `${field} must be >= ${min}` }
  return { ok: true, value }
}

export function parseRequiredInteger(value: unknown, field: string, min?: number): ValidationResult<number> {
  if (typeof value !== 'number' || !Number.isInteger(value)) return { ok: false, error: `${field} must be an integer` }
  if (min !== undefined && value < min) return { ok: false, error: `${field} must be >= ${min}` }
  return { ok: true, value }
}

export function validateClienteInput(raw: unknown): ValidationResult<ClienteInput> {
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

export function validateArticuloInput(raw: unknown): ValidationResult<ArticuloInput> {
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

export function validateRubroInput(raw: unknown): ValidationResult<RubroInput> {
  if (!isObjectRecord(raw)) return { ok: false, error: 'Request body must be an object' }
  const codigo = parseRequiredInteger(raw.codigo, 'codigo', 1)
  if (!codigo.ok) return codigo
  if (typeof raw.nombre !== 'string' || raw.nombre.trim().length === 0 || raw.nombre.trim().length > 20) {
    return { ok: false, error: 'nombre must be a string between 1 and 20 characters' }
  }
  return { ok: true, value: { codigo: codigo.value, nombre: raw.nombre.trim() } }
}

export function validateProveedorInput(raw: unknown): ValidationResult<ProveedorInput> {
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
    'CÃ³rdoba',
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
  if (['true', '1', 'yes', 'sÃ­', 'si'].includes(v)) return true
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
