/**
 * @en Bank account CRUD, CSV mappings, and statement import (#190).
 * @es CRUD de cuentas bancarias, mapeos CSV e importación de extractos (#190).
 * @pt-BR CRUD de contas bancárias, mapeamentos CSV e importação de extratos (#190).
 */
import type { BancoCsvMapping, CuentaBancaria, MovimientoBancario, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { decodeImportBuffer } from '../csvImport'
import type { ServiceResult } from './serviceResults'
import { DEFAULT_BANCO_CSV_MAPPINGS } from './bancos/defaultCsvMappings'
import { buildMovimientoDedupeKey } from './bancos/dedupeKey'
import { detectExtractoFormat } from './bancos/detectFormat'
import { parseCsvExtracto } from './bancos/parseCsvExtracto'
import { parseMt940Extracto } from './bancos/parseMt940'
import { parseOfxExtracto } from './bancos/parseOfx'
import type { ParsedMovimiento } from './bancos/types'

const IMPORT_BATCH_SIZE = 500
const CBU_RE = /^\d{22}$/

export type CuentaBancariaInput = {
  banco: string
  tipoCuenta: string
  cbu: string
  alias?: string | null
  moneda?: string
  activo?: boolean
}

export type BancoCsvMappingInput = {
  bancoCode: string
  columnaFecha: string
  columnaDescripcion: string
  columnaImporte: string
  columnaReferencia?: string | null
  columnaSaldo?: string | null
  separadorDecimal?: string
  formatoFecha?: string
  delimiter?: string
  signoDebitoCredito?: string
}

export type ImportExtractoResult = {
  imported: number
  skippedDuplicates: number
  errors: Array<{ row: number; message: string }>
  format: string
}

function money(value: Decimal | number | string | null | undefined): string | null {
  if (value == null) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toFixed(2)
  return value.toFixed(2)
}

function serializeCuenta(row: CuentaBancaria) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function serializeMovimiento(row: MovimientoBancario) {
  return {
    id: row.id,
    cuentaId: row.cuentaId,
    fecha: row.fecha.toISOString(),
    descripcion: row.descripcion,
    importe: money(row.importe) ?? '0.00',
    tipo: row.tipo,
    saldo: money(row.saldo),
    referencia: row.referencia,
    formatoOrigen: row.formatoOrigen,
    dedupeKey: row.dedupeKey,
    conciliadoId: row.conciliadoId,
    conciliadoAt: row.conciliadoAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

function serializeMapping(row: BancoCsvMapping) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export class BancoExtractoService {
  constructor(private readonly prisma: PrismaClient) {}

  async ensureDefaultMappings(tenantId: number): Promise<void> {
    for (const m of DEFAULT_BANCO_CSV_MAPPINGS) {
      await this.prisma.bancoCsvMapping.upsert({
        where: { tenantId_bancoCode: { tenantId, bancoCode: m.bancoCode } },
        create: {
          tenantId,
          bancoCode: m.bancoCode,
          columnaFecha: m.columnaFecha,
          columnaDescripcion: m.columnaDescripcion,
          columnaImporte: m.columnaImporte,
          columnaReferencia: m.columnaReferencia,
          columnaSaldo: m.columnaSaldo,
          separadorDecimal: m.separadorDecimal,
          formatoFecha: m.formatoFecha,
          delimiter: m.delimiter,
          signoDebitoCredito: m.signoDebitoCredito,
        },
        update: {},
      })
    }
  }

  async listCuentas(tenantId: number): Promise<ServiceResult<ReturnType<typeof serializeCuenta>[]>> {
    const rows = await this.prisma.cuentaBancaria.findMany({
      where: { tenantId },
      orderBy: [{ activo: 'desc' }, { banco: 'asc' }],
    })
    return { ok: true, data: rows.map(serializeCuenta) }
  }

  async createCuenta(
    tenantId: number,
    input: CuentaBancariaInput,
  ): Promise<ServiceResult<ReturnType<typeof serializeCuenta>>> {
    const cbu = input.cbu.trim()
    if (!CBU_RE.test(cbu)) {
      return { ok: false, status: 400, error: 'CBU must be exactly 22 digits' }
    }
    const banco = input.banco.trim().slice(0, 50)
    if (banco.length < 2) {
      return { ok: false, status: 400, error: 'banco is required' }
    }
    const tipoCuenta = input.tipoCuenta.trim().slice(0, 20) || 'corriente'
    try {
      const row = await this.prisma.cuentaBancaria.create({
        data: {
          tenantId,
          banco,
          tipoCuenta,
          cbu,
          alias: input.alias?.trim().slice(0, 60) || null,
          moneda: (input.moneda ?? 'ARS').slice(0, 3),
          activo: input.activo ?? true,
        },
      })
      return { ok: true, data: serializeCuenta(row) }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Unique constraint') || msg.includes('CuentaBancaria_tenantId_cbu')) {
        return { ok: false, status: 409, error: 'CBU already registered for this tenant' }
      }
      return { ok: false, status: 500, error: msg }
    }
  }

  async updateCuenta(
    tenantId: number,
    id: number,
    input: Partial<CuentaBancariaInput>,
  ): Promise<ServiceResult<ReturnType<typeof serializeCuenta>>> {
    const existing = await this.prisma.cuentaBancaria.findFirst({ where: { id, tenantId } })
    if (!existing) return { ok: false, status: 404, error: 'Bank account not found' }
    if (input.cbu != null && !CBU_RE.test(input.cbu.trim())) {
      return { ok: false, status: 400, error: 'CBU must be exactly 22 digits' }
    }
    try {
      const row = await this.prisma.cuentaBancaria.update({
        where: { id },
        data: {
          ...(input.banco != null ? { banco: input.banco.trim().slice(0, 50) } : {}),
          ...(input.tipoCuenta != null ? { tipoCuenta: input.tipoCuenta.trim().slice(0, 20) } : {}),
          ...(input.cbu != null ? { cbu: input.cbu.trim() } : {}),
          ...(input.alias !== undefined
            ? { alias: input.alias?.trim().slice(0, 60) || null }
            : {}),
          ...(input.moneda != null ? { moneda: input.moneda.slice(0, 3) } : {}),
          ...(input.activo != null ? { activo: input.activo } : {}),
        },
      })
      return { ok: true, data: serializeCuenta(row) }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Unique constraint')) {
        return { ok: false, status: 409, error: 'CBU already registered for this tenant' }
      }
      return { ok: false, status: 500, error: msg }
    }
  }

  async listMovimientos(
    tenantId: number,
    cuentaId: number,
    opts: { from?: string; to?: string; take: number; skip: number },
  ): Promise<
    ServiceResult<{ total: number; data: ReturnType<typeof serializeMovimiento>[] }>
  > {
    const cuenta = await this.prisma.cuentaBancaria.findFirst({ where: { id: cuentaId, tenantId } })
    if (!cuenta) return { ok: false, status: 404, error: 'Bank account not found' }

    const fechaFilter: { gte?: Date; lte?: Date } = {}
    if (opts.from) fechaFilter.gte = new Date(opts.from)
    if (opts.to) fechaFilter.lte = new Date(opts.to)
    const where = {
      cuentaId,
      ...(Object.keys(fechaFilter).length > 0 ? { fecha: fechaFilter } : {}),
    }

    const [total, rows] = await Promise.all([
      this.prisma.movimientoBancario.count({ where }),
      this.prisma.movimientoBancario.findMany({
        where,
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        take: opts.take,
        skip: opts.skip,
      }),
    ])
    return { ok: true, data: { total, data: rows.map(serializeMovimiento) } }
  }

  async listMappings(tenantId: number): Promise<ServiceResult<ReturnType<typeof serializeMapping>[]>> {
    await this.ensureDefaultMappings(tenantId)
    const rows = await this.prisma.bancoCsvMapping.findMany({
      where: { tenantId },
      orderBy: { bancoCode: 'asc' },
    })
    return { ok: true, data: rows.map(serializeMapping) }
  }

  async createMapping(
    tenantId: number,
    input: BancoCsvMappingInput,
  ): Promise<ServiceResult<ReturnType<typeof serializeMapping>>> {
    const bancoCode = input.bancoCode.trim().toLowerCase().slice(0, 30)
    if (!bancoCode) return { ok: false, status: 400, error: 'bancoCode is required' }
    try {
      const row = await this.prisma.bancoCsvMapping.create({
        data: {
          tenantId,
          bancoCode,
          columnaFecha: input.columnaFecha.trim(),
          columnaDescripcion: input.columnaDescripcion.trim(),
          columnaImporte: input.columnaImporte.trim(),
          columnaReferencia: input.columnaReferencia?.trim() || null,
          columnaSaldo: input.columnaSaldo?.trim() || null,
          separadorDecimal: input.separadorDecimal?.slice(0, 1) || ',',
          formatoFecha: input.formatoFecha?.trim() || 'dd/MM/yyyy',
          delimiter: input.delimiter?.slice(0, 1) || ';',
          signoDebitoCredito: input.signoDebitoCredito?.trim() || 'signed_importe',
        },
      })
      return { ok: true, data: serializeMapping(row) }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Unique constraint')) {
        return { ok: false, status: 409, error: 'Mapping for this bancoCode already exists' }
      }
      return { ok: false, status: 500, error: msg }
    }
  }

  async updateMapping(
    tenantId: number,
    id: number,
    input: Partial<BancoCsvMappingInput>,
  ): Promise<ServiceResult<ReturnType<typeof serializeMapping>>> {
    const existing = await this.prisma.bancoCsvMapping.findFirst({ where: { id, tenantId } })
    if (!existing) return { ok: false, status: 404, error: 'CSV mapping not found' }
    const row = await this.prisma.bancoCsvMapping.update({
      where: { id },
      data: {
        ...(input.bancoCode != null
          ? { bancoCode: input.bancoCode.trim().toLowerCase().slice(0, 30) }
          : {}),
        ...(input.columnaFecha != null ? { columnaFecha: input.columnaFecha.trim() } : {}),
        ...(input.columnaDescripcion != null
          ? { columnaDescripcion: input.columnaDescripcion.trim() }
          : {}),
        ...(input.columnaImporte != null ? { columnaImporte: input.columnaImporte.trim() } : {}),
        ...(input.columnaReferencia !== undefined
          ? { columnaReferencia: input.columnaReferencia?.trim() || null }
          : {}),
        ...(input.columnaSaldo !== undefined
          ? { columnaSaldo: input.columnaSaldo?.trim() || null }
          : {}),
        ...(input.separadorDecimal != null
          ? { separadorDecimal: input.separadorDecimal.slice(0, 1) }
          : {}),
        ...(input.formatoFecha != null ? { formatoFecha: input.formatoFecha.trim() } : {}),
        ...(input.delimiter != null ? { delimiter: input.delimiter.slice(0, 1) } : {}),
        ...(input.signoDebitoCredito != null
          ? { signoDebitoCredito: input.signoDebitoCredito.trim() }
          : {}),
      },
    })
    return { ok: true, data: serializeMapping(row) }
  }

  async importExtracto(
    tenantId: number,
    cuentaId: number,
    file: { buffer: Buffer; originalname: string },
    opts: { bancoCode?: string; mappingId?: number } = {},
  ): Promise<ServiceResult<ImportExtractoResult>> {
    const cuenta = await this.prisma.cuentaBancaria.findFirst({ where: { id: cuentaId, tenantId } })
    if (!cuenta) return { ok: false, status: 404, error: 'Bank account not found' }

    const { text } = decodeImportBuffer(file.buffer)
    const format = detectExtractoFormat(file.originalname, text)
    if (!format) {
      return { ok: false, status: 400, error: 'Unsupported statement format (use CSV, OFX, or MT940)' }
    }

    let parsed: ParsedMovimiento[]
    let parseErrors: Array<{ row: number; message: string }> = []

    if (format === 'csv') {
      await this.ensureDefaultMappings(tenantId)
      let mapping: BancoCsvMapping | null = null
      if (opts.mappingId != null) {
        mapping = await this.prisma.bancoCsvMapping.findFirst({
          where: { id: opts.mappingId, tenantId },
        })
      } else if (opts.bancoCode) {
        mapping = await this.prisma.bancoCsvMapping.findFirst({
          where: { tenantId, bancoCode: opts.bancoCode.trim().toLowerCase() },
        })
      }
      if (!mapping) {
        // Try match by account bank name
        const code = cuenta.banco.trim().toLowerCase()
        mapping = await this.prisma.bancoCsvMapping.findFirst({
          where: { tenantId, bancoCode: code },
        })
      }
      if (!mapping) {
        return {
          ok: false,
          status: 400,
          error: 'CSV mapping required: pass bancoCode or mappingId (or name the account after a known bank code)',
        }
      }
      const csv = parseCsvExtracto(text, mapping)
      if (!csv.ok) return { ok: false, status: 400, error: csv.error }
      parsed = csv.movimientos
      parseErrors = csv.errors
    } else if (format === 'ofx') {
      const ofx = parseOfxExtracto(text)
      if (!ofx.ok) return { ok: false, status: 400, error: ofx.error }
      parsed = ofx.movimientos
    } else {
      const mt = parseMt940Extracto(text)
      if (!mt.ok) return { ok: false, status: 400, error: mt.error }
      parsed = mt.movimientos
    }

    if (parsed.length === 0 && parseErrors.length > 0) {
      return {
        ok: true,
        data: { imported: 0, skippedDuplicates: 0, errors: parseErrors, format },
      }
    }

    const prepared = parsed.map((m) => {
      const fechaIso = m.fecha.toISOString().slice(0, 10)
      const dedupeKey = buildMovimientoDedupeKey({
        fechaIso,
        importe: m.importe,
        tipo: m.tipo,
        referencia: m.referencia,
        descripcion: m.descripcion,
      })
      return {
        cuentaId,
        fecha: m.fecha,
        descripcion: m.descripcion,
        importe: new Decimal(m.importe),
        tipo: m.tipo,
        saldo: m.saldo != null ? new Decimal(m.saldo) : null,
        referencia: m.referencia,
        formatoOrigen: format,
        dedupeKey,
      }
    })

    const keys = prepared.map((p) => p.dedupeKey)
    const existing = await this.prisma.movimientoBancario.findMany({
      where: { cuentaId, dedupeKey: { in: keys } },
      select: { dedupeKey: true },
    })
    const existingSet = new Set(existing.map((e) => e.dedupeKey))
    const toInsert = prepared.filter((p) => !existingSet.has(p.dedupeKey))
    const skippedDuplicates = prepared.length - toInsert.length

    for (let i = 0; i < toInsert.length; i += IMPORT_BATCH_SIZE) {
      const chunk = toInsert.slice(i, i + IMPORT_BATCH_SIZE)
      await this.prisma.movimientoBancario.createMany({ data: chunk })
    }

    return {
      ok: true,
      data: {
        imported: toInsert.length,
        skippedDuplicates,
        errors: parseErrors,
        format,
      },
    }
  }
}
