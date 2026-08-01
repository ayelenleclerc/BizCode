import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import RepartosTrackingPanel from './RepartosTrackingPanel'
import { repartosAPI, type Reparto } from '@/lib/api'

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: () => ({
    hasModule: (key: string) => key === 'logistics.pod',
    modules: ['logistics.pod'],
    integrations: [],
    hasIntegration: () => false,
    status: 'ready',
    refreshFeatures: vi.fn(),
  }),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    repartosAPI: {
      ...actual.repartosAPI,
      iniciar: vi.fn(),
      cerrar: vi.fn(),
      getItemPod: vi.fn(),
    },
  }
})

const reparto: Reparto = {
  id: 1,
  tenantId: 1,
  fecha: '2026-05-20',
  choferId: 2,
  estado: 'on_route',
  vehiculo: null,
  observaciones: null,
  closedAt: null,
  chofer: { id: 2, username: 'driver1', role: 'driver' },
  items: [
    {
      id: 10,
      ordenEntregaId: 5,
      secuencia: 1,
      estado: 'delivered',
      entregadoAt: '2026-05-20T12:00:00.000Z',
      motivoNoEntrega: null,
      receptorNombre: 'Ana',
      receptorDni: null,
      notasEntrega: null,
      hasPod: true,
      ordenEntrega: {
        id: 5,
        tenantId: 1,
        clienteId: 1,
        zonaId: null,
        driverId: 2,
        pickerUserId: null,
        pickingIniciadoAt: null,
        pickingListoAt: null,
        items: [],
        facturaId: null,
        fecha: '2026-05-20',
        estado: 'delivered',
        nota: null,
        transportista: null,
        nroSeguimiento: null,
        estadoEnvio: null,
        ultimoEventoAt: null,
        trackingEventos: null,
        cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
        zona: null,
        driver: { id: 2, username: 'd', role: 'driver' },
        factura: null,
      },
    },
  ],
  progress: { total: 1, delivered: 1, pending: 0 },
}

describe('RepartosTrackingPanel POD', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows POD badge and opens view dialog', async () => {
    vi.mocked(repartosAPI.getItemPod).mockResolvedValue({
      ...reparto.items[0],
      podMedia: null,
    })
    const user = userEvent.setup()
    render(<RepartosTrackingPanel reparto={reparto} canDispatch={false} onUpdated={vi.fn()} />)
    expect(screen.getByTestId('reparto-item-pod-badge-10')).toBeInTheDocument()
    await user.click(screen.getByTestId('reparto-view-pod-10'))
    expect(await screen.findByTestId('pod-view-dialog')).toBeInTheDocument()
  })
})
