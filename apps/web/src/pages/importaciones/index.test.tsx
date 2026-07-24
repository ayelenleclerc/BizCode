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
})
