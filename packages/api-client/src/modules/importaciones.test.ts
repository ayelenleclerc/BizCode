import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createImportacionesAPI } from './importaciones'

describe('createImportacionesAPI (#238)', () => {
  const job = {
    id: 1,
    tenantId: 1,
    entity: 'clientes' as const,
    estado: 'completed' as const,
    modo: 'mejores_esfuerzos' as const,
    duplicateMode: 'skip' as const,
    totalRows: 1,
    processedRows: 1,
    okCount: 1,
    errorCount: 0,
    duplicateCount: 0,
    createdCount: 1,
    updatedCount: 0,
    skippedCount: 0,
    createdById: 1,
    createdAt: '2026-07-24T00:00:00.000Z',
    updatedAt: '2026-07-24T00:00:00.000Z',
    completedAt: '2026-07-24T00:00:00.000Z',
  }

  it('covers template, validate, startJob and report helpers', async () => {
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: new Blob(['csv']) })
        .mockResolvedValueOnce({ data: { success: true, data: job } })
        .mockResolvedValueOnce({ data: new Blob(['report']) }),
      post: vi
        .fn()
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              entity: 'clientes',
              totalRows: 1,
              okCount: 1,
              errorCount: 0,
              duplicateCount: 0,
              issues: [],
            },
          },
        })
        .mockResolvedValueOnce({ data: { success: true, data: job } }),
    } as unknown as AxiosInstance
    const api = createImportacionesAPI(http)
    await expect(api.downloadTemplate('clientes', 'csv')).resolves.toBeInstanceOf(Blob)
    await expect(
      api.validate({
        entity: 'clientes',
        file: new File(['x'], 'x.csv'),
        duplicateMode: 'skip',
      }),
    ).resolves.toMatchObject({ totalRows: 1 })
    await expect(
      api.startJob({
        entity: 'clientes',
        file: new File(['x'], 'x.csv'),
        modo: 'todo_o_nada',
        duplicateMode: 'update',
      }),
    ).resolves.toMatchObject({ id: 1 })
    await expect(api.getJob(1)).resolves.toMatchObject({ id: 1 })
    await expect(api.downloadReport(1)).resolves.toBeInstanceOf(Blob)
  })

  it('propagates handleError on failures', async () => {
    const boom = Object.assign(new Error('boom'), {
      isAxiosError: true,
      response: { status: 500, data: { error: 'boom' } },
    })
    const http = {
      get: vi.fn().mockRejectedValue(boom),
      post: vi.fn().mockRejectedValue(boom),
    } as unknown as AxiosInstance
    const api = createImportacionesAPI(http)
    await expect(api.downloadTemplate('saldos', 'xlsx')).rejects.toBeTruthy()
    await expect(
      api.validate({ entity: 'saldos', file: new File(['x'], 'x.csv') }),
    ).rejects.toBeTruthy()
    await expect(
      api.startJob({ entity: 'saldos', file: new File(['x'], 'x.csv') }),
    ).rejects.toBeTruthy()
    await expect(api.getJob(9)).rejects.toBeTruthy()
    await expect(api.downloadReport(9)).rejects.toBeTruthy()
  })
})
