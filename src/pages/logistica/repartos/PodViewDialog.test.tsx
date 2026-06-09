import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@/i18n/config'
import PodViewDialog from './PodViewDialog'
import { repartosAPI } from '@/lib/api'

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    repartosAPI: {
      ...actual.repartosAPI,
      getItemPod: vi.fn(),
    },
  }
})

const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('PodViewDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and shows POD detail', async () => {
    vi.mocked(repartosAPI.getItemPod).mockResolvedValue({
      id: 10,
      ordenEntregaId: 1,
      secuencia: 1,
      estado: 'delivered',
      entregadoAt: null,
      motivoNoEntrega: null,
      receptorNombre: 'Ana',
      receptorDni: null,
      notasEntrega: null,
      hasPod: true,
      podMedia: { firmaBase64: TINY_PNG },
      ordenEntrega: {
        id: 1,
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
        cliente: { id: 1, codigo: 1, rsocial: 'ACME' },
        zona: null,
        driver: null,
        factura: null,
      },
    })

    render(<PodViewDialog repartoId={1} itemId={10} open onClose={vi.fn()} />)
    expect(await screen.findByTestId('pod-view-firma')).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
  })

  it('shows error when fetch fails', async () => {
    vi.mocked(repartosAPI.getItemPod).mockRejectedValue(new Error('fail'))
    render(<PodViewDialog repartoId={1} itemId={10} open onClose={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
