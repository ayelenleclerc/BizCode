import type { PrismaClient } from '@prisma/client'
import type { ArticuloInput, ClienteInput } from '../createApp.types'
import { articuloBodySchema, clienteBodySchema, safeParseBodySchema } from '../schemas/domain'
import { csvRowToRawArticulo, csvRowToRawCliente } from '../routes/restDomainShared'
import type { ImportPersistResult, ImportRowError } from './serviceResults'

type ValidatedImportRow<T> = {
  row: number
  input: T
}

/**
 * @en Bulk CSV import persistence for tenant-scoped catalog entities.
 * @es Persistencia de importaciones CSV masivas para entidades de catálogo por tenant.
 * @pt-BR Persistência de importações CSV em massa para entidades de catálogo por tenant.
 */
export class ImportService {
  constructor(private readonly prisma: PrismaClient) {}

  async importClientes(tenantId: number, records: Record<string, string>[]): Promise<ImportPersistResult> {
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

    return this.persistClientesByCodigo(tenantId, validatedRows, errors)
  }

  async importArticulos(tenantId: number, records: Record<string, string>[]): Promise<ImportPersistResult> {
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

    return this.persistArticulosByCodigo(tenantId, validatedRows, errors)
  }

  private async persistClientesByCodigo(
    tenantId: number,
    validatedRows: ValidatedImportRow<ClienteInput>[],
    errors: ImportRowError[],
  ): Promise<ImportPersistResult> {
    const codigos = validatedRows.map((r) => r.input.codigo)
    const existing =
      codigos.length === 0
        ? []
        : await this.prisma.cliente.findMany({
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
    await this.prisma.$transaction(async (tx) => {
      for (const data of toInsert) {
        await tx.cliente.create({ data: { ...data, tenantId } })
        created += 1
      }
    })

    return { created, errors }
  }

  private async persistArticulosByCodigo(
    tenantId: number,
    validatedRows: ValidatedImportRow<ArticuloInput>[],
    errors: ImportRowError[],
  ): Promise<ImportPersistResult> {
    const codigos = validatedRows.map((r) => r.input.codigo)
    const existing =
      codigos.length === 0
        ? []
        : await this.prisma.articulo.findMany({
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
    await this.prisma.$transaction(async (tx) => {
      for (const data of toInsert) {
        await tx.articulo.create({ data: { ...data, tenantId } })
        created += 1
      }
    })

    return { created, errors }
  }
}
