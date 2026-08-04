import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import '@/i18n/config'
import TiendanubeOrdenesPanel from './TiendanubeOrdenesPanel'
import { tiendanubeAPI } from '@/lib/api'

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    tiendanubeAPI: {
      listOrdenes: vi.fn(),
      facturarOrden: vi.fn(),
    },
  }
})

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const sampleOrden = {
  id: 1,
  tnOrderId: 'TN-100',
  status: 'paid',
  buyerNickname: 'BUYER_TN',
  cuitPending: true,
  stockAppliedAt: null as string | null,
  lastSyncedAt: '2026-08-01T12:00:00.000Z',
  pedidoId: 50,
  pedidoEstado: 'confirmed',
  pedidoTotal: '2500.50',
  facturaId: null as number | null,
  clienteId: 20,
  clienteRsocial: 'BUYER TN',
  clienteCuit: null as string | null,
}

describe('TiendanubeOrdenesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    vi.mocked(tiendanubeAPI.listOrdenes).mockResolvedValue({
      data: [sampleOrden],
      total: 1,
      limit: 100,
      offset: 0,
    })
    vi.mocked(tiendanubeAPI.facturarOrden).mockResolvedValue({ pedidoId: 50, facturaId: 9 })
  })

  it('lista órdenes pendientes', async () => {
    render(<TiendanubeOrdenesPanel />)
    expect(await screen.findByTestId('tiendanube-ordenes-table')).toBeInTheDocument()
    expect(screen.getByTestId('tiendanube-orden-row-TN-100')).toBeInTheDocument()
    expect(screen.getByTestId('tiendanube-cuit-pending-TN-100')).toBeInTheDocument()
    expect(tiendanubeAPI.listOrdenes).toHaveBeenCalledWith({ estado: 'pendiente' })
  })

  it('muestra vacío sin órdenes', async () => {
    vi.mocked(tiendanubeAPI.listOrdenes).mockResolvedValue({
      data: [],
      total: 0,
      limit: 100,
      offset: 0,
    })
    render(<TiendanubeOrdenesPanel />)
    expect(await screen.findByTestId('tiendanube-ordenes-empty')).toBeInTheDocument()
  })

  it('cambia filtro y refresca', async () => {
    const user = userEvent.setup()
    render(<TiendanubeOrdenesPanel />)
    await screen.findByTestId('tiendanube-ordenes-table')
    await user.selectOptions(screen.getByTestId('tiendanube-ordenes-filter'), 'facturada')
    await waitFor(() => {
      expect(tiendanubeAPI.listOrdenes).toHaveBeenCalledWith({ estado: 'facturada' })
    })
    await user.click(screen.getByTestId('tiendanube-ordenes-refresh-btn'))
    await waitFor(() => {
      expect(vi.mocked(tiendanubeAPI.listOrdenes).mock.calls.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('factura una orden', async () => {
    const user = userEvent.setup()
    render(<TiendanubeOrdenesPanel />)
    await screen.findByTestId('tiendanube-facturar-TN-100')
    await user.click(screen.getByTestId('tiendanube-facturar-TN-100'))
    await waitFor(() => {
      expect(tiendanubeAPI.facturarOrden).toHaveBeenCalledWith(
        'TN-100',
        expect.objectContaining({ tipo: 'B', numero: 1, prefijo: '0001' }),
      )
    })
  })

  it('muestra error de facturación', async () => {
    vi.mocked(tiendanubeAPI.facturarOrden).mockRejectedValue(new Error('sin stock'))
    const user = userEvent.setup()
    render(<TiendanubeOrdenesPanel />)
    await screen.findByTestId('tiendanube-facturar-TN-100')
    await user.click(screen.getByTestId('tiendanube-facturar-TN-100'))
    expect(await screen.findByTestId('tiendanube-ordenes-action-error')).toHaveTextContent(
      'sin stock',
    )
  })

  it('muestra error de carga', async () => {
    vi.mocked(tiendanubeAPI.listOrdenes).mockRejectedValue(new Error('red'))
    render(<TiendanubeOrdenesPanel />)
    expect(await screen.findByTestId('async-wrapper-error')).toBeInTheDocument()
  })
})
