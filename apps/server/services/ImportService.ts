import type { PrismaClient } from '@prisma/client'
import type {
  ArticuloInput,
  ClienteInput,
  ImportDuplicateMode,
  ImportModo,
  ProveedorInput,
  RubroInput,
} from '@bizcode/types'
import {
  articuloBodySchema,
  clienteBodySchema,
  proveedorBodySchema,
  rubroBodySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import {
  csvRowToRawArticulo,
  csvRowToRawCliente,
  csvRowToRawProveedor,
} from '../routes/restDomainShared'
import { dbfRowToRawArticulo } from '../../web/src/lib/migration/legacyArticuloDbf'
import { dbfRowToRawRubro } from '../../web/src/lib/migration/legacyRubroDbf'
import type { ImportPersistResult, ImportRowError } from './serviceResults'

type ValidatedImportRow<T> = {
  row: number
  input: T
}

export type ImportPersistOptions = {
  duplicateMode?: ImportDuplicateMode
  modo?: ImportModo
  onProgress?: (processed: number, total: number) => void | Promise<void>
}

/**
 * @en Bulk CSV/XLSX import persistence for tenant-scoped catalog entities (#238).
 * @es Persistencia de importaciones CSV/XLSX masivas para entidades de catálogo por tenant (#238).
 * @pt-BR Persistência de importações CSV/XLSX em massa para entidades de catálogo por tenant (#238).
 */
export class ImportService {
  constructor(private readonly prisma: PrismaClient) {}

  async importClientes(
    tenantId: number,
    records: Record<string, string>[],
    options: ImportPersistOptions = {},
  ): Promise<ImportPersistResult> {
    const errors: ImportRowError[] = []
    const seenCodigos = new Map<number, number>()
    const validatedRows: ValidatedImportRow<ClienteInput>[] = []

    for (const [i, row] of records.entries()) {
      const rowNum = i + 2
      const raw = csvRowToRawCliente(row)
      const parsed = safeParseBodySchema(clienteBodySchema, raw)
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

    return this.persistByCodigo(
      tenantId,
      validatedRows,
      errors,
      options,
      'cliente',
      async (tx, input) => {
        await tx.cliente.create({ data: { ...input, tenantId } })
      },
      async (tx, id, input) => {
        await tx.cliente.update({ where: { id }, data: { ...input } })
      },
      async () =>
        this.prisma.cliente.findMany({
          where: { tenantId, codigo: { in: validatedRows.map((r) => r.input.codigo) } },
          select: { id: true, codigo: true },
        }),
    )
  }

  async importArticulos(
    tenantId: number,
    records: Record<string, string>[],
    options: ImportPersistOptions = {},
  ): Promise<ImportPersistResult> {
    const rubrosDb = await this.prisma.rubro.findMany({
      where: { tenantId },
      select: { id: true, codigo: true },
    })
    const rubroByCodigo = new Map(rubrosDb.map((r) => [r.codigo, r.id]))
    const errors: ImportRowError[] = []
    const seenCodigos = new Map<number, number>()
    const validatedRows: ValidatedImportRow<ArticuloInput>[] = []

    for (const [i, row] of records.entries()) {
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
      const parsed = safeParseBodySchema(articuloBodySchema, forValidate)
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

    return this.persistByCodigo(
      tenantId,
      validatedRows,
      errors,
      options,
      'articulo',
      async (tx, input) => {
        await tx.articulo.create({ data: { ...input, tenantId } })
      },
      async (tx, id, input) => {
        await tx.articulo.update({
          where: { id },
          data: {
            descripcion: input.descripcion,
            rubroId: input.rubroId,
            condIva: input.condIva,
            umedida: input.umedida,
            precioLista1: input.precioLista1,
            precioLista2: input.precioLista2,
            costo: input.costo,
            stock: input.stock,
            minimo: input.minimo,
            activo: input.activo,
          },
        })
      },
      async () =>
        this.prisma.articulo.findMany({
          where: { tenantId, codigo: { in: validatedRows.map((r) => r.input.codigo) } },
          select: { id: true, codigo: true },
        }),
    )
  }

  async importProveedores(
    tenantId: number,
    records: Record<string, string>[],
    options: ImportPersistOptions = {},
  ): Promise<ImportPersistResult> {
    const errors: ImportRowError[] = []
    const seenCodigos = new Map<number, number>()
    const validatedRows: ValidatedImportRow<ProveedorInput>[] = []

    for (const [i, row] of records.entries()) {
      const rowNum = i + 2
      const raw = csvRowToRawProveedor(row)
      const parsed = safeParseBodySchema(proveedorBodySchema, raw)
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

    return this.persistByCodigo(
      tenantId,
      validatedRows,
      errors,
      options,
      'proveedor',
      async (tx, input) => {
        await tx.proveedor.create({ data: { ...input, tenantId } })
      },
      async (tx, id, input) => {
        await tx.proveedor.update({ where: { id }, data: { ...input } })
      },
      async () =>
        this.prisma.proveedor.findMany({
          where: { tenantId, codigo: { in: validatedRows.map((r) => r.input.codigo) } },
          select: { id: true, codigo: true },
        }),
    )
  }

  /**
   * @en Upserts rubros from legacy DBF rows (`RUBROS.DBF`).
   * @es Hace upsert de rubros desde filas DBF legacy (`RUBROS.DBF`).
   * @pt-BR Faz upsert de rubros a partir de linhas DBF legado (`RUBROS.DBF`).
   */
  async importRubrosFromDbf(tenantId: number, dbfRows: Record<string, unknown>[]): Promise<ImportPersistResult> {
    const errors: ImportRowError[] = []
    const seenCodigos = new Map<number, number>()
    const validatedRows: ValidatedImportRow<RubroInput>[] = []

    for (const [i, row] of dbfRows.entries()) {
      const rowNum = i + 1
      const raw = dbfRowToRawRubro(row)
      const parsed = safeParseBodySchema(rubroBodySchema, raw)
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

    let created = 0
    let updated = 0
    await this.prisma.$transaction(async (tx) => {
      for (const { input } of validatedRows) {
        const existing = await tx.rubro.findUnique({
          where: { tenantId_codigo: { tenantId, codigo: input.codigo } },
          select: { id: true },
        })
        await tx.rubro.upsert({
          where: { tenantId_codigo: { tenantId, codigo: input.codigo } },
          create: { ...input, tenantId },
          update: { nombre: input.nombre },
        })
        if (existing) updated += 1
        else created += 1
      }
    })

    return { created, updated, errors }
  }

  /**
   * @en Upserts artículos from legacy DBF rows; requires rubro codigo to exist in tenant.
   * @es Hace upsert de artículos desde DBF; exige que el código de rubro exista en el tenant.
   * @pt-BR Faz upsert de artigos a partir de DBF; exige rubro existente no tenant.
   */
  async importArticulosFromDbf(
    tenantId: number,
    dbfRows: Record<string, unknown>[],
  ): Promise<ImportPersistResult> {
    const rubrosDb = await this.prisma.rubro.findMany({
      where: { tenantId },
      select: { id: true, codigo: true },
    })
    const rubroByCodigo = new Map(rubrosDb.map((r) => [r.codigo, r.id]))
    const errors: ImportRowError[] = []
    const seenCodigos = new Map<number, number>()
    const validatedRows: ValidatedImportRow<ArticuloInput>[] = []

    for (const [i, row] of dbfRows.entries()) {
      const rowNum = i + 1
      const raw = dbfRowToRawArticulo(row)
      const rubroCodigo = raw.rubroCodigo
      if (typeof rubroCodigo !== 'number' || !Number.isInteger(rubroCodigo)) {
        errors.push({ row: rowNum, message: 'COD_RUBRO must be a valid integer' })
        continue
      }
      const rubroId = rubroByCodigo.get(rubroCodigo)
      if (rubroId === undefined) {
        errors.push({ row: rowNum, message: `Unknown rubro codigo ${rubroCodigo}` })
        continue
      }
      const { rubroCodigo: _rc, ...rest } = raw
      const forValidate = { ...rest, rubroId }
      const parsed = safeParseBodySchema(articuloBodySchema, forValidate)
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

    let created = 0
    let updated = 0
    await this.prisma.$transaction(async (tx) => {
      for (const { input } of validatedRows) {
        const existing = await tx.articulo.findUnique({
          where: { tenantId_codigo: { tenantId, codigo: input.codigo } },
          select: { id: true },
        })
        await tx.articulo.upsert({
          where: { tenantId_codigo: { tenantId, codigo: input.codigo } },
          create: { ...input, tenantId },
          update: {
            descripcion: input.descripcion,
            rubroId: input.rubroId,
            condIva: input.condIva,
            umedida: input.umedida,
            precioLista1: input.precioLista1,
            precioLista2: input.precioLista2,
            costo: input.costo,
            stock: input.stock,
            minimo: input.minimo,
            activo: input.activo,
          },
        })
        if (existing) updated += 1
        else created += 1
      }
    })

    return { created, updated, errors }
  }

  private async persistByCodigo<T extends { codigo: number }>(
    _tenantId: number,
    validatedRows: ValidatedImportRow<T>[],
    errors: ImportRowError[],
    options: ImportPersistOptions,
    _kind: string,
    createOne: (tx: PrismaClient, input: T) => Promise<void>,
    updateOne: (tx: PrismaClient, id: number, input: T) => Promise<void>,
    loadExisting: () => Promise<Array<{ id: number; codigo: number }>>,
  ): Promise<ImportPersistResult> {
    const duplicateMode = options.duplicateMode
    const existing = validatedRows.length === 0 ? [] : await loadExisting()
    const existingByCodigo = new Map(existing.map((e) => [e.codigo, e.id]))
    const toCreate: ValidatedImportRow<T>[] = []
    const toUpdate: Array<ValidatedImportRow<T> & { id: number }> = []
    let skipped = 0

    for (const vr of validatedRows) {
      const hasExisting = existingByCodigo.has(vr.input.codigo)
      const existingId = existingByCodigo.get(vr.input.codigo)
      if (hasExisting) {
        if (duplicateMode === 'skip') {
          skipped += 1
          continue
        }
        if (duplicateMode === 'update') {
          toUpdate.push({ ...vr, id: existingId as number })
          continue
        }
        errors.push({ row: vr.row, message: `codigo ${vr.input.codigo} already exists` })
        continue
      }
      toCreate.push(vr)
    }

    if (options.modo === 'todo_o_nada' && errors.length > 0) {
      return { created: 0, updated: 0, skipped: 0, errors }
    }

    let created = 0
    let updated = 0
    const total = toCreate.length + toUpdate.length
    let processed = 0

    const run = async (tx: PrismaClient) => {
      for (const vr of toCreate) {
        await createOne(tx, vr.input)
        created += 1
        processed += 1
        await options.onProgress?.(processed, total)
      }
      for (const vr of toUpdate) {
        await updateOne(tx, vr.id, vr.input)
        updated += 1
        processed += 1
        await options.onProgress?.(processed, total)
      }
    }

    await this.prisma.$transaction(async (tx) => run(tx as unknown as PrismaClient))

    return { created, updated, skipped, errors }
  }
}
