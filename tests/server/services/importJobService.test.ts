import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { ImportJobService } from '../../../apps/server/services/ImportJobService'

function jobRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 7,
    tenantId: 1,
    entity: 'clientes',
    estado: 'ready',
    modo: 'mejores_esfuerzos',
    duplicateMode: 'skip',
    totalRows: 1,
    processedRows: 0,
    okCount: 1,
    errorCount: 0,
    duplicateCount: 0,
    createdCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    reportJson: { issues: [] },
    createdById: 3,
    createdAt: new Date('2026-07-24T00:00:00.000Z'),
    updatedAt: new Date('2026-07-24T00:00:00.000Z'),
    completedAt: null,
    ...overrides,
  }
}

describe('ImportJobService (#238)', () => {
  let prisma: PrismaClient
  let service: ImportJobService

  beforeEach(() => {
    prisma = {
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 1 }),
        update: vi.fn().mockResolvedValue({ id: 1 }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      articulo: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 1 }),
        update: vi.fn().mockResolvedValue({ id: 1 }),
      },
      proveedor: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 1 }),
        update: vi.fn().mockResolvedValue({ id: 1 }),
      },
      rubro: { findMany: vi.fn().mockResolvedValue([{ id: 1, codigo: 10 }]) },
      movimientoClienteCC: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: 1,
          tipo: 'saldo_inicial',
          monto: 250.25,
          saldoPost: 250.25,
        }),
      },
      importJob: {
        create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
          jobRow(data),
        ),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
          jobRow({ ...data, id: 7, estado: data.estado ?? 'completed' }),
        ),
      },
      $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) => fn(prisma)),
    } as unknown as PrismaClient
    service = new ImportJobService(prisma)
  })

  it('getById returns 404 when missing', async () => {
    vi.mocked(prisma.importJob.findFirst).mockResolvedValue(null)
    const result = await service.getById(1, 99)
    expect(result).toEqual({ ok: false, status: 404, error: 'Import job not found' })
  })

  it('buildReportCsv includes issues and summary', async () => {
    vi.mocked(prisma.importJob.findFirst).mockResolvedValue(
      jobRow({
        estado: 'completed',
        reportJson: {
          issues: [{ row: 2, code: 'VALIDATION', message: 'bad', kind: 'error' }],
          final: { created: 1, updated: 0, skipped: 0, errors: [{ row: 3, message: 'x' }] },
        },
      }) as never,
    )
    const result = await service.buildReportCsv(1, 7)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toContain('VALIDATION')
    expect(result.data).toContain('summary')
  })

  it('createAndStart runs clientes job and emits subscribe events', async () => {
    const csv = Buffer.from(
      [
        'codigo,rsocial,condIva,activo,fantasia,cuit,domicilio,localidad,cpost,telef,email,creditLimit,creditDays,suspended,deliveryZoneId',
        '1001,Demo SA,RI,true,,,,,,,,,,,,,,',
      ].join('\n'),
      'utf8',
    )
    const events: Array<{ estado: string }> = []
    const unsub = service.subscribe(7, (ev) => events.push({ estado: ev.estado }))

    vi.mocked(prisma.importJob.findUnique).mockResolvedValue(jobRow({ entity: 'clientes' }) as never)

    const created = await service.createAndStart({
      tenantId: 1,
      userId: 3,
      entity: 'clientes',
      modo: 'mejores_esfuerzos',
      duplicateMode: 'skip',
      buffer: csv,
      filename: 'c.csv',
    })
    expect(created.ok).toBe(true)

    await vi.waitFor(() => {
      expect(events.some((e) => e.estado === 'completed' || e.estado === 'running')).toBe(true)
    })
    unsub()
  })

  it('createAndStart imports saldos iniciales', async () => {
    const csv = Buffer.from(
      ['codigo,clienteId,importe,fecha,concepto', '1001,,250.25,2026-01-15,Inicial'].join('\n'),
      'utf8',
    )
    vi.mocked(prisma.cliente.findFirst).mockResolvedValue({ id: 11, codigo: 1001 } as never)
    vi.mocked(prisma.importJob.findUnique).mockResolvedValue(
      jobRow({ entity: 'saldos', totalRows: 1 }) as never,
    )
    vi.mocked(prisma.cliente.findMany).mockResolvedValue([])

    const created = await service.createAndStart({
      tenantId: 1,
      userId: 3,
      entity: 'saldos',
      modo: 'mejores_esfuerzos',
      duplicateMode: 'skip',
      buffer: csv,
      filename: 's.csv',
    })
    expect(created.ok).toBe(true)
    await vi.waitFor(() => {
      expect(prisma.importJob.update).toHaveBeenCalled()
    })
  })
})
