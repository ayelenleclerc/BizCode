import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  ImportDuplicateMode,
  ImportEntity,
  ImportJobEstado,
  ImportJobProgressEvent,
  ImportJobRow,
  ImportModo,
  ImportRowIssue,
} from '@bizcode/types'
import { parseImportFile } from '../csvImport'
import { csvRowToRawSaldo } from '../routes/restDomainShared'
import { BulkImportValidateService } from './BulkImportValidateService'
import { ClienteCuentaCorrienteService } from './ClienteCuentaCorrienteService'
import { ImportService } from './ImportService'

type Listener = (event: ImportJobProgressEvent) => void

const jobListeners = new Map<number, Set<Listener>>()
const jobPayloads = new Map<number, { buffer: Buffer; filename: string }>()

function mapJob(row: {
  id: number
  tenantId: number
  entity: string
  estado: string
  modo: string
  duplicateMode: string
  totalRows: number
  processedRows: number
  okCount: number
  errorCount: number
  duplicateCount: number
  createdCount: number
  updatedCount: number
  skippedCount: number
  createdById: number
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}): ImportJobRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    entity: row.entity as ImportEntity,
    estado: row.estado as ImportJobEstado,
    modo: row.modo as ImportModo,
    duplicateMode: row.duplicateMode as ImportDuplicateMode,
    totalRows: row.totalRows,
    processedRows: row.processedRows,
    okCount: row.okCount,
    errorCount: row.errorCount,
    duplicateCount: row.duplicateCount,
    createdCount: row.createdCount,
    updatedCount: row.updatedCount,
    skippedCount: row.skippedCount,
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  }
}

function emit(jobId: number, event: ImportJobProgressEvent): void {
  const set = jobListeners.get(jobId)
  if (!set) return
  for (const listener of set) listener(event)
}

function parseFecha(value: unknown): Date {
  if (typeof value !== 'string' || value.trim() === '') return new Date()
  const s = value.trim()
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(s)
  if (iso) return new Date(`${iso[0]}T12:00:00.000Z`)
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s)
  if (dmy) {
    return new Date(Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]), 12))
  }
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

/**
 * @en Creates and runs async bulk import jobs with SSE progress (#238).
 * @es Crea y ejecuta trabajos de importación masiva con progreso SSE (#238).
 * @pt-BR Cria e executa trabalhos de importação em massa com progresso SSE (#238).
 */
export class ImportJobService {
  private readonly validateService: BulkImportValidateService
  private readonly importService: ImportService
  private readonly ccService: ClienteCuentaCorrienteService

  constructor(private readonly prisma: PrismaClient) {
    this.validateService = new BulkImportValidateService(prisma)
    this.importService = new ImportService(prisma)
    this.ccService = new ClienteCuentaCorrienteService(prisma)
  }

  subscribe(jobId: number, listener: Listener): () => void {
    let set = jobListeners.get(jobId)
    if (!set) {
      set = new Set()
      jobListeners.set(jobId, set)
    }
    set.add(listener)
    return () => {
      set!.delete(listener)
      if (set!.size === 0) jobListeners.delete(jobId)
    }
  }

  async getById(
    tenantId: number,
    id: number,
  ): Promise<{ ok: true; data: ImportJobRow } | { ok: false; status: number; error: string }> {
    const row = await this.prisma.importJob.findFirst({ where: { id, tenantId } })
    if (!row) return { ok: false, status: 404, error: 'Import job not found' }
    return { ok: true, data: mapJob(row) }
  }

  async createAndStart(params: {
    tenantId: number
    userId: number
    entity: ImportEntity
    modo: ImportModo
    duplicateMode: ImportDuplicateMode
    buffer: Buffer
    filename: string
  }): Promise<{ ok: true; data: ImportJobRow } | { ok: false; status: number; error: string }> {
    const dry = await this.validateService.validateFile(
      params.tenantId,
      params.entity,
      params.buffer,
      params.filename,
      params.duplicateMode,
    )
    if (!dry.ok) return dry

    const job = await this.prisma.importJob.create({
      data: {
        tenantId: params.tenantId,
        entity: params.entity,
        estado: 'ready',
        modo: params.modo,
        duplicateMode: params.duplicateMode,
        totalRows: dry.data.totalRows,
        okCount: dry.data.okCount,
        errorCount: dry.data.errorCount,
        duplicateCount: dry.data.duplicateCount,
        reportJson: { issues: dry.data.issues } as Prisma.InputJsonValue,
        createdById: params.userId,
      },
    })

    jobPayloads.set(job.id, { buffer: params.buffer, filename: params.filename })
    void this.runJob(job.id).catch(async (err: unknown) => {
      await this.prisma.importJob.update({
        where: { id: job.id },
        data: {
          estado: 'failed',
          completedAt: new Date(),
          reportJson: {
            error: err instanceof Error ? err.message : String(err),
          } as Prisma.InputJsonValue,
        },
      })
      emit(job.id, {
        jobId: job.id,
        estado: 'failed',
        processedRows: 0,
        totalRows: job.totalRows,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        message: err instanceof Error ? err.message : String(err),
      })
    })

    return { ok: true, data: mapJob(job) }
  }

  async buildReportCsv(
    tenantId: number,
    id: number,
  ): Promise<{ ok: true; data: string } | { ok: false; status: number; error: string }> {
    const row = await this.prisma.importJob.findFirst({ where: { id, tenantId } })
    if (!row) return { ok: false, status: 404, error: 'Import job not found' }
    const report = (row.reportJson ?? {}) as {
      issues?: ImportRowIssue[]
      final?: { created: number; updated: number; skipped: number; errors: Array<{ row: number; message: string }> }
    }
    const lines = ['kind,row,code,message']
    for (const issue of report.issues ?? []) {
      lines.push(
        [issue.kind, issue.row, JSON.stringify(issue.code), JSON.stringify(issue.message)].join(','),
      )
    }
    for (const err of report.final?.errors ?? []) {
      lines.push(['error', err.row, '"PERSIST"', JSON.stringify(err.message)].join(','))
    }
    lines.push(
      [
        'summary',
        '',
        '"COUNTS"',
        JSON.stringify({
          estado: row.estado,
          created: row.createdCount,
          updated: row.updatedCount,
          skipped: row.skippedCount,
          errors: row.errorCount,
        }),
      ].join(','),
    )
    return { ok: true, data: `${lines.join('\n')}\n` }
  }

  private async runJob(jobId: number): Promise<void> {
    const job = await this.prisma.importJob.findUnique({ where: { id: jobId } })
    if (!job) return
    const payload = jobPayloads.get(jobId)
    if (!payload) {
      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { estado: 'failed', completedAt: new Date() },
      })
      return
    }

    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { estado: 'running', processedRows: 0 },
    })
    emit(jobId, {
      jobId,
      estado: 'running',
      processedRows: 0,
      totalRows: job.totalRows,
      createdCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: job.errorCount,
    })

    const entity = job.entity as ImportEntity
    const headers = this.validateService.headersFor(entity)
    const parsed = await parseImportFile(payload.buffer, payload.filename, headers)
    if (!parsed.ok) {
      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { estado: 'failed', completedAt: new Date(), reportJson: { error: parsed.error } },
      })
      return
    }

    const options = {
      modo: job.modo as ImportModo,
      duplicateMode: job.duplicateMode as ImportDuplicateMode,
      onProgress: async (processed: number, total: number) => {
        await this.prisma.importJob.update({
          where: { id: jobId },
          data: { processedRows: processed, totalRows: Math.max(job.totalRows, total) },
        })
        emit(jobId, {
          jobId,
          estado: 'running',
          processedRows: processed,
          totalRows: Math.max(job.totalRows, total),
          createdCount: 0,
          updatedCount: 0,
          skippedCount: 0,
          errorCount: job.errorCount,
        })
      },
    }

    let created: number
    let updated: number
    let skipped: number
    let persistErrors: Array<{ row: number; message: string }>

    if (entity === 'clientes') {
      const result = await this.importService.importClientes(job.tenantId, parsed.records, options)
      created = result.created
      updated = result.updated ?? 0
      skipped = result.skipped ?? 0
      persistErrors = result.errors
    } else if (entity === 'articulos') {
      const result = await this.importService.importArticulos(job.tenantId, parsed.records, options)
      created = result.created
      updated = result.updated ?? 0
      skipped = result.skipped ?? 0
      persistErrors = result.errors
    } else if (entity === 'proveedores') {
      const result = await this.importService.importProveedores(job.tenantId, parsed.records, options)
      created = result.created
      updated = result.updated ?? 0
      skipped = result.skipped ?? 0
      persistErrors = result.errors
    } else {
      const saldoResult = await this.importSaldos(
        job.tenantId,
        job.createdById,
        parsed.records,
        job.duplicateMode as ImportDuplicateMode,
        options.onProgress,
      )
      created = saldoResult.created
      updated = 0
      skipped = saldoResult.skipped
      persistErrors = saldoResult.errors
    }

    const prevIssues =
      ((job.reportJson as { issues?: ImportRowIssue[] } | null)?.issues as ImportRowIssue[] | undefined) ??
      []

    const updatedJob = await this.prisma.importJob.update({
      where: { id: jobId },
      data: {
        estado: 'completed',
        processedRows: job.totalRows,
        createdCount: created,
        updatedCount: updated,
        skippedCount: skipped,
        errorCount: persistErrors.length,
        completedAt: new Date(),
        reportJson: {
          issues: prevIssues,
          final: { created, updated, skipped, errors: persistErrors },
        } as Prisma.InputJsonValue,
      },
    })

    jobPayloads.delete(jobId)
    emit(jobId, {
      jobId,
      estado: 'completed',
      processedRows: updatedJob.processedRows,
      totalRows: updatedJob.totalRows,
      createdCount: created,
      updatedCount: updated,
      skippedCount: skipped,
      errorCount: persistErrors.length,
    })
  }

  private async importSaldos(
    tenantId: number,
    userId: number,
    records: Record<string, string>[],
    duplicateMode: ImportDuplicateMode,
    onProgress?: (processed: number, total: number) => void | Promise<void>,
  ): Promise<{ created: number; skipped: number; errors: Array<{ row: number; message: string }> }> {
    let created = 0
    let skipped = 0
    const errors: Array<{ row: number; message: string }> = []
    const total = records.length

    for (const [i, row] of records.entries()) {
      const rowNum = i + 2
      try {
        const raw = csvRowToRawSaldo(row)
        const importe = raw.importe
        if (typeof importe !== 'number' || Number.isNaN(importe) || importe === 0) {
          errors.push({ row: rowNum, message: 'importe must be a non-zero number' })
          await onProgress?.(i + 1, total)
          continue
        }
        const codigo =
          typeof raw.codigo === 'number' && Number.isInteger(raw.codigo) ? raw.codigo : null
        const clienteId =
          typeof raw.clienteId === 'number' && Number.isInteger(raw.clienteId)
            ? raw.clienteId
            : null
        const cliente = await this.prisma.cliente.findFirst({
          where: {
            tenantId,
            ...(clienteId != null ? { id: clienteId } : { codigo: codigo! }),
          },
          select: { id: true, codigo: true },
        })
        if (!cliente) {
          errors.push({ row: rowNum, message: 'Cliente not found' })
          await onProgress?.(i + 1, total)
          continue
        }
        const fecha = parseFecha(raw.fecha)
        const fechaKey = fecha.toISOString().slice(0, 10)
        const referencia = `import_saldo:${cliente.codigo}:${fechaKey}`
        const existing = await this.prisma.movimientoClienteCC.findFirst({
          where: { tenantId, clienteId: cliente.id, tipo: 'saldo_inicial', referencia },
          select: { id: true },
        })
        if (existing) {
          if (duplicateMode === 'skip') {
            skipped += 1
            await onProgress?.(i + 1, total)
            continue
          }
          skipped += 1
          await onProgress?.(i + 1, total)
          continue
        }
        await this.ccService.recordMovimiento({
          tenantId,
          clienteId: cliente.id,
          tipo: 'saldo_inicial',
          monto: importe,
          referencia,
          fecha,
          usuarioId: userId,
          notas: typeof raw.concepto === 'string' ? raw.concepto : 'Importacion saldo inicial',
        })
        await this.prisma.cliente.update({
          where: { id: cliente.id },
          data: { balanceInicial: importe },
        })
        created += 1
      } catch (e: unknown) {
        errors.push({ row: rowNum, message: e instanceof Error ? e.message : String(e) })
      }
      await onProgress?.(i + 1, total)
    }

    return { created, skipped, errors }
  }
}
