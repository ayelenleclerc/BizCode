import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createImportacionesAPI } from './importaciones'

describe('createImportacionesAPI (#238)', () => {
  it('covers template, validate and job helpers', async () => {
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: new Blob(['csv']) })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              id: 1,
              tenantId: 1,
              entity: 'clientes',
              estado: 'completed',
              modo: 'mejores_esfuerzos',
              duplicateMode: 'skip',
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
            },
          },
        })
        .mockResolvedValueOnce({ data: new Blob(['report']) }),
      post: vi.fn().mockResolvedValue({
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
      }),
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
    await expect(api.getJob(1)).resolves.toMatchObject({ id: 1 })
    await expect(api.downloadReport(1)).resolves.toBeInstanceOf(Blob)
  })
})
