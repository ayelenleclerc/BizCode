import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '@/i18n/config'
import ReconciliacionMpPage from './ReconciliacionMpPage'
import { clientesAPI, mercadopagoAPI } from '@/lib/api'

const sampleEntry = {
  mpPaymentId: '9001',
  transactionAmount: '1500.00',
  currencyId: 'ARS',
  paymentDate: '2026-06-10T12:00:00.000Z',
  payerName: 'Juan Perez',
  payerEmail: 'payer@example.com',
  payerIdentification: '20123456789',
  preferenceId: null,
  externalReference: null,
  createdAt: '2026-06-10T12:00:00.000Z',
}

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    mercadopagoAPI: {
      getConfig: vi.fn(),
      putConfig: vi.fn(),
      testCredentials: vi.fn(),
      listUnreconciled: vi.fn(),
      reconcile: vi.fn(),
      ignore: vi.fn(),
      runReconciliationJob: vi.fn(),
    },
    clientesAPI: {
      ...actual.clientesAPI,
      facturasPendientes: vi.fn(),
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    claims: { role: 'owner', tenantId: 1, userId: 1, permissions: ['reports.financial.read'] },
  }),
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const featureFlagsMock = vi.fn(() => ({
  status: 'ready' as const,
  modules: [] as string[],
  integrations: ['mercadopago'] as string[],
  hasModule: (): boolean => true,
  hasIntegration: (id: string): boolean => id === 'mercadopago',
  refreshFeatures: vi.fn(),
}))

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: () => featureFlagsMock(),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ReconciliacionMpPage />
    </MemoryRouter>,
  )
}

describe('ReconciliacionMpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    featureFlagsMock.mockReturnValue({
      status: 'ready',
      modules: [],
      integrations: ['mercadopago'],
      hasModule: (): boolean => true,
      hasIntegration: (id: string): boolean => id === 'mercadopago',
      refreshFeatures: vi.fn(),
    })
    vi.mocked(mercadopagoAPI.listUnreconciled).mockResolvedValue([sampleEntry])
    vi.mocked(clientesAPI.facturasPendientes).mockResolvedValue([
      {
        facturaId: 42,
        facturaRef: 'FA 0001-00000042',
        fecha: '2026-06-01T00:00:00.000Z',
        total: '1500.00',
        pagado: '0.00',
        pendiente: '1500.00',
      },
    ])
    vi.mocked(mercadopagoAPI.reconcile).mockResolvedValue(sampleEntry)
    vi.mocked(mercadopagoAPI.ignore).mockResolvedValue({ mpPaymentId: '9001' })
    vi.mocked(mercadopagoAPI.runReconciliationJob).mockResolvedValue({
      processed: 1,
      autoReconciled: 0,
      queued: 1,
      skipped: 0,
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('carga la cola de pagos sin reconciliar', async () => {
    renderPage()
    expect(await screen.findByTestId('reconciliacion-mp-page')).toBeInTheDocument()
    expect(screen.getByTestId('reconciliacion-mp-table')).toBeInTheDocument()
    expect(screen.getByTestId('reconciliacion-mp-row-9001')).toBeInTheDocument()
  })

  it('muestra vacío sin pagos pendientes', async () => {
    vi.mocked(mercadopagoAPI.listUnreconciled).mockResolvedValue([])
    renderPage()
    expect(await screen.findByTestId('reconciliacion-mp-empty')).toBeInTheDocument()
  })

  it('reconcilia un pago con factura seleccionada', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByTestId('reconciliacion-mp-row-9001')
    await user.type(screen.getByTestId('reconciliacion-mp-row-9001-cliente-input'), '7')
    await user.click(screen.getByTestId('reconciliacion-mp-row-9001-load-invoices'))
    await waitFor(() => {
      expect(clientesAPI.facturasPendientes).toHaveBeenCalledWith(7)
    })
    await user.selectOptions(screen.getByTestId('reconciliacion-mp-row-9001-factura-select'), '42')
    await user.click(screen.getByTestId('reconciliacion-mp-row-9001-reconcile'))
    await waitFor(() => {
      expect(mercadopagoAPI.reconcile).toHaveBeenCalledWith({ mpPaymentId: '9001', facturaId: 42 })
    })
  })

  it('ignora un pago pendiente', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByTestId('reconciliacion-mp-row-9001')
    await user.click(screen.getByTestId('reconciliacion-mp-row-9001-ignore'))
    await waitFor(() => {
      expect(mercadopagoAPI.ignore).toHaveBeenCalledWith('9001')
    })
  })

  it('ejecuta el job manual de reconciliación', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByTestId('reconciliacion-mp-page')
    await user.click(screen.getByTestId('reconciliacion-mp-run-job'))
    await waitFor(() => {
      expect(mercadopagoAPI.runReconciliationJob).toHaveBeenCalled()
    })
  })

  it('muestra mensaje si la integración no está habilitada', async () => {
    featureFlagsMock.mockReturnValue({
      status: 'ready',
      modules: [],
      integrations: [],
      hasModule: (): boolean => true,
      hasIntegration: (): boolean => false,
      refreshFeatures: vi.fn(),
    })
    renderPage()
    expect(await screen.findByTestId('reconciliacion-mp-integration-disabled')).toBeInTheDocument()
  })
})
