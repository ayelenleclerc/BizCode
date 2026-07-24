import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { importacionesAPI } from '@/lib/api'
import ImportacionesPage from './index'

vi.mock('@/lib/api', () => ({
  importacionesAPI: {
    downloadTemplate: vi.fn(),
    validate: vi.fn(),
    startJob: vi.fn(),
    getJob: vi.fn(),
    downloadReport: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('ImportacionesPage (#238)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(importacionesAPI.validate).mockResolvedValue({
      entity: 'clientes',
      totalRows: 1,
      okCount: 1,
      errorCount: 0,
      duplicateCount: 0,
      issues: [],
    })
  })

  it('renders wizard and validates a file', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <ImportacionesPage />
      </I18nextProvider>,
    )
    expect(screen.getByTestId('importaciones-page')).toBeInTheDocument()
    const file = new File(
      [
        'codigo,rsocial,condIva,activo,fantasia,cuit,domicilio,localidad,cpost,telef,email,creditLimit,creditDays,suspended,deliveryZoneId\n1,A,RI,true,,,,,,,,,,\n',
      ],
      'c.csv',
      { type: 'text/csv' },
    )
    await user.upload(screen.getByTestId('importaciones-file'), file)
    await user.click(screen.getByTestId('importaciones-validate'))
    await waitFor(() => {
      expect(importacionesAPI.validate).toHaveBeenCalled()
      expect(screen.getByTestId('importaciones-summary')).toBeInTheDocument()
    })
  })

  it('downloads templates and starts job with poll fallback', async () => {
    const user = userEvent.setup()
    const createObjectURL = vi.fn(() => 'blob:mock')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    class FakeEventSource {
      onmessage: ((ev: MessageEvent) => void) | null = null
      onerror: (() => void) | null = null
      close = vi.fn()
      constructor(_url: string) {
        throw new Error('SSE unavailable')
      }
    }
    vi.stubGlobal('EventSource', FakeEventSource)

    vi.mocked(importacionesAPI.downloadTemplate).mockResolvedValue(new Blob(['csv']))
    vi.mocked(importacionesAPI.startJob).mockResolvedValue({
      id: 5,
      tenantId: 1,
      entity: 'clientes',
      estado: 'running',
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
      createdById: 1,
      createdAt: '2026-07-24T00:00:00.000Z',
      updatedAt: '2026-07-24T00:00:00.000Z',
      completedAt: null,
    })
    vi.mocked(importacionesAPI.getJob).mockResolvedValue({
      id: 5,
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
    })
    vi.mocked(importacionesAPI.downloadReport).mockResolvedValue(new Blob(['report']))

    render(
      <I18nextProvider i18n={i18n}>
        <ImportacionesPage />
      </I18nextProvider>,
    )

    await user.click(screen.getByTestId('importaciones-template-csv'))
    await waitFor(() => expect(importacionesAPI.downloadTemplate).toHaveBeenCalled())

    const file = new File(['x'], 'c.csv', { type: 'text/csv' })
    await user.upload(screen.getByTestId('importaciones-file'), file)
    await user.click(screen.getByTestId('importaciones-validate'))
    await waitFor(() => expect(screen.getByTestId('importaciones-summary')).toBeInTheDocument())
    await user.click(screen.getByTestId('importaciones-start'))
    await waitFor(() => expect(importacionesAPI.startJob).toHaveBeenCalled())
    await waitFor(() => expect(importacionesAPI.getJob).toHaveBeenCalled())
    await user.click(screen.getByTestId('importaciones-report'))
    await waitFor(() => expect(importacionesAPI.downloadReport).toHaveBeenCalledWith(5))
  })
})
