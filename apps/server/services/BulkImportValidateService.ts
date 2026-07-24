import type { PrismaClient } from '@prisma/client'
import type {
  BulkImportValidateSummary,
  ImportDuplicateMode,
  ImportEntity,
  ImportRowIssue,
} from '@bizcode/types'
import {
  articuloBodySchema,
  clienteBodySchema,
  proveedorBodySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import {
  ARTICULO_IMPORT_CSV_HEADERS,
  CLIENTE_IMPORT_CSV_HEADERS,
  PROVEEDOR_IMPORT_CSV_HEADERS,
  SALDO_IMPORT_CSV_HEADERS,
  csvRowToRawArticulo,
  csvRowToRawCliente,
  csvRowToRawProveedor,
  csvRowToRawSaldo,
} from '../routes/restDomainShared'
import { parseImportFile } from '../csvImport'

const MAX_ISSUES = 200

/**
 * @en Dry-run validation for bulk import files without persistence (#238).
 * @es Validación previa de archivos de importación masiva sin persistir (#238).
 * @pt-BR Validação prévia de arquivos de importação em massa sem persistir (#238).
 */
export class BulkImportValidateService {
  constructor(private readonly prisma: PrismaClient) {}

  headersFor(entity: ImportEntity): readonly string[] {
    switch (entity) {
      case 'clientes':
        return CLIENTE_IMPORT_CSV_HEADERS
      case 'articulos':
        return ARTICULO_IMPORT_CSV_HEADERS
      case 'proveedores':
        return PROVEEDOR_IMPORT_CSV_HEADERS
      case 'saldos':
        return SALDO_IMPORT_CSV_HEADERS
      default: {
        const _exhaustive: never = entity
        return _exhaustive
      }
    }
  }

  async validateFile(
    tenantId: number,
    entity: ImportEntity,
    buffer: Buffer,
    filename: string,
    duplicateMode: ImportDuplicateMode = 'skip',
  ): Promise<{ ok: true; data: BulkImportValidateSummary } | { ok: false; status: number; error: string }> {
    const parsed = await parseImportFile(buffer, filename, this.headersFor(entity))
    if (!parsed.ok) {
      return { ok: false, status: 400, error: parsed.error }
    }

    const issues: ImportRowIssue[] = []
    let okCount: number
    let errorCount: number
    let duplicateCount: number

    if (entity === 'clientes') {
      const result = await this.validateClientes(tenantId, parsed.records, duplicateMode)
      issues.push(...result.issues)
      okCount = result.okCount
      errorCount = result.errorCount
      duplicateCount = result.duplicateCount
    } else if (entity === 'articulos') {
      const result = await this.validateArticulos(tenantId, parsed.records, duplicateMode)
      issues.push(...result.issues)
      okCount = result.okCount
      errorCount = result.errorCount
      duplicateCount = result.duplicateCount
    } else if (entity === 'proveedores') {
      const result = await this.validateProveedores(tenantId, parsed.records, duplicateMode)
      issues.push(...result.issues)
      okCount = result.okCount
      errorCount = result.errorCount
      duplicateCount = result.duplicateCount
    } else {
      const result = await this.validateSaldos(tenantId, parsed.records, duplicateMode)
      issues.push(...result.issues)
      okCount = result.okCount
      errorCount = result.errorCount
      duplicateCount = result.duplicateCount
    }

    return {
      ok: true,
      data: {
        entity,
        totalRows: parsed.records.length,
        okCount,
        errorCount,
        duplicateCount,
        issues: issues.slice(0, MAX_ISSUES),
      },
    }
  }

  private pushIssue(
    issues: ImportRowIssue[],
    row: number,
    code: string,
    message: string,
    kind: 'error' | 'duplicate',
  ): void {
    if (issues.length < MAX_ISSUES) {
      issues.push({ row, code, message, kind })
    }
  }

  private async validateClientes(
    tenantId: number,
    records: Record<string, string>[],
    duplicateMode: ImportDuplicateMode,
  ) {
    const issues: ImportRowIssue[] = []
    const seen = new Map<number, number>()
    let okCount = 0
    let errorCount = 0
    let duplicateCount = 0
    const validCodigos: number[] = []

    for (const [i, row] of records.entries()) {
      const rowNum = i + 2
      const raw = csvRowToRawCliente(row)
      const parsed = safeParseBodySchema(clienteBodySchema, raw)
      if (!parsed.ok) {
        errorCount += 1
        this.pushIssue(issues, rowNum, 'VALIDATION', parsed.error, 'error')
        continue
      }
      const first = seen.get(parsed.value.codigo)
      if (first !== undefined) {
        errorCount += 1
        this.pushIssue(
          issues,
          rowNum,
          'DUPLICATE_IN_FILE',
          `Duplicate codigo ${parsed.value.codigo} (first on row ${first})`,
          'error',
        )
        continue
      }
      seen.set(parsed.value.codigo, rowNum)
      validCodigos.push(parsed.value.codigo)
      okCount += 1
    }

    if (validCodigos.length > 0) {
      const existing = await this.prisma.cliente.findMany({
        where: { tenantId, codigo: { in: validCodigos } },
        select: { codigo: true },
      })
      duplicateCount = existing.length
      for (const e of existing) {
        const row = seen.get(e.codigo) ?? 0
        this.pushIssue(
          issues,
          row,
          'DUPLICATE_IN_DB',
          `codigo ${e.codigo} already exists (${duplicateMode})`,
          'duplicate',
        )
      }
      if (duplicateMode === 'skip') {
        okCount = Math.max(0, okCount - duplicateCount)
      }
    }

    return { issues, okCount, errorCount, duplicateCount }
  }

  private async validateArticulos(
    tenantId: number,
    records: Record<string, string>[],
    duplicateMode: ImportDuplicateMode,
  ) {
    const rubros = await this.prisma.rubro.findMany({
      where: { tenantId },
      select: { id: true, codigo: true },
    })
    const rubroByCodigo = new Map(rubros.map((r) => [r.codigo, r.id]))
    const issues: ImportRowIssue[] = []
    const seen = new Map<number, number>()
    let okCount = 0
    let errorCount = 0
    let duplicateCount = 0
    const validCodigos: number[] = []

    for (const [i, row] of records.entries()) {
      const rowNum = i + 2
      const raw = csvRowToRawArticulo(row)
      const rubroCodigo = raw.rubroCodigo
      if (typeof rubroCodigo !== 'number' || !Number.isInteger(rubroCodigo)) {
        errorCount += 1
        this.pushIssue(issues, rowNum, 'RUBRO', 'rubroCodigo must be a valid integer', 'error')
        continue
      }
      if (!rubroByCodigo.has(rubroCodigo)) {
        errorCount += 1
        this.pushIssue(issues, rowNum, 'RUBRO', `Unknown rubroCodigo ${rubroCodigo}`, 'error')
        continue
      }
      const { rubroCodigo: _rc, ...rest } = raw
      const parsed = safeParseBodySchema(articuloBodySchema, {
        ...rest,
        rubroId: rubroByCodigo.get(rubroCodigo),
      })
      if (!parsed.ok) {
        errorCount += 1
        this.pushIssue(issues, rowNum, 'VALIDATION', parsed.error, 'error')
        continue
      }
      const first = seen.get(parsed.value.codigo)
      if (first !== undefined) {
        errorCount += 1
        this.pushIssue(
          issues,
          rowNum,
          'DUPLICATE_IN_FILE',
          `Duplicate codigo ${parsed.value.codigo} (first on row ${first})`,
          'error',
        )
        continue
      }
      seen.set(parsed.value.codigo, rowNum)
      validCodigos.push(parsed.value.codigo)
      okCount += 1
    }

    if (validCodigos.length > 0) {
      const existing = await this.prisma.articulo.findMany({
        where: { tenantId, codigo: { in: validCodigos } },
        select: { codigo: true },
      })
      duplicateCount = existing.length
      for (const e of existing) {
        const row = seen.get(e.codigo) ?? 0
        this.pushIssue(
          issues,
          row,
          'DUPLICATE_IN_DB',
          `codigo ${e.codigo} already exists (${duplicateMode})`,
          'duplicate',
        )
      }
      if (duplicateMode === 'skip') {
        okCount = Math.max(0, okCount - duplicateCount)
      }
    }

    return { issues, okCount, errorCount, duplicateCount }
  }

  private async validateProveedores(
    tenantId: number,
    records: Record<string, string>[],
    duplicateMode: ImportDuplicateMode,
  ) {
    const issues: ImportRowIssue[] = []
    const seen = new Map<number, number>()
    let okCount = 0
    let errorCount = 0
    let duplicateCount = 0
    const validCodigos: number[] = []

    for (const [i, row] of records.entries()) {
      const rowNum = i + 2
      const raw = csvRowToRawProveedor(row)
      const parsed = safeParseBodySchema(proveedorBodySchema, raw)
      if (!parsed.ok) {
        errorCount += 1
        this.pushIssue(issues, rowNum, 'VALIDATION', parsed.error, 'error')
        continue
      }
      const first = seen.get(parsed.value.codigo)
      if (first !== undefined) {
        errorCount += 1
        this.pushIssue(
          issues,
          rowNum,
          'DUPLICATE_IN_FILE',
          `Duplicate codigo ${parsed.value.codigo} (first on row ${first})`,
          'error',
        )
        continue
      }
      seen.set(parsed.value.codigo, rowNum)
      validCodigos.push(parsed.value.codigo)
      okCount += 1
    }

    if (validCodigos.length > 0) {
      const existing = await this.prisma.proveedor.findMany({
        where: { tenantId, codigo: { in: validCodigos } },
        select: { codigo: true },
      })
      duplicateCount = existing.length
      for (const e of existing) {
        const row = seen.get(e.codigo) ?? 0
        this.pushIssue(
          issues,
          row,
          'DUPLICATE_IN_DB',
          `codigo ${e.codigo} already exists (${duplicateMode})`,
          'duplicate',
        )
      }
      if (duplicateMode === 'skip') {
        okCount = Math.max(0, okCount - duplicateCount)
      }
    }

    return { issues, okCount, errorCount, duplicateCount }
  }

  private async validateSaldos(
    tenantId: number,
    records: Record<string, string>[],
    duplicateMode: ImportDuplicateMode,
  ) {
    const issues: ImportRowIssue[] = []
    let okCount = 0
    let errorCount = 0
    let duplicateCount = 0

    for (const [i, row] of records.entries()) {
      const rowNum = i + 2
      const raw = csvRowToRawSaldo(row)
      if (raw.importe == null || Number.isNaN(raw.importe as number)) {
        errorCount += 1
        this.pushIssue(issues, rowNum, 'IMPORTE', 'importe must be numeric', 'error')
        continue
      }
      const codigo =
        typeof raw.codigo === 'number' && Number.isInteger(raw.codigo) ? raw.codigo : null
      const clienteId =
        typeof raw.clienteId === 'number' && Number.isInteger(raw.clienteId) ? raw.clienteId : null
      if (codigo == null && clienteId == null) {
        errorCount += 1
        this.pushIssue(issues, rowNum, 'CLIENTE', 'codigo or clienteId required', 'error')
        continue
      }
      const cliente = await this.prisma.cliente.findFirst({
        where: {
          tenantId,
          ...(clienteId != null ? { id: clienteId } : { codigo: codigo! }),
        },
        select: { id: true, codigo: true },
      })
      if (!cliente) {
        errorCount += 1
        this.pushIssue(issues, rowNum, 'CLIENTE', 'Cliente not found', 'error')
        continue
      }
      const ref = `import_saldo:${cliente.codigo}:${String(raw.fecha ?? 'na')}`
      const existingMov = await this.prisma.movimientoClienteCC.findFirst({
        where: { tenantId, clienteId: cliente.id, tipo: 'saldo_inicial', referencia: ref },
        select: { id: true },
      })
      if (existingMov) {
        duplicateCount += 1
        this.pushIssue(
          issues,
          rowNum,
          'DUPLICATE_IN_DB',
          `saldo_inicial already exists (${duplicateMode})`,
          'duplicate',
        )
        if (duplicateMode === 'skip') continue
      }
      okCount += 1
    }

    return { issues, okCount, errorCount, duplicateCount }
  }
}
