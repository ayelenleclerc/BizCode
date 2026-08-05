import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import '@/i18n/config'
import WooCommerceOrdenesPanel from './WooCommerceOrdenesPanel'
import { woocommerceAPI } from '@/lib/api'

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    woocommerceAPI: {
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
  wcOrderId: 'WC-100',
  status: 'processing',
  buyerNickname: 'BUYER_WC',
  cuitPending: true,
  stockAppliedAt: null as string | null,
  lastSyncedAt: '2026-08-01T12:00:00.000Z',
  pedidoId: 50,
  pedidoEstado: 'confirmed',
  pedidoTotal: '2500.50',
  facturaId: null as number | null,
  clienteId: 20,
  clienteRsocial: 'BUYER WC',
  clienteCuit: null as string | null,
}

describe('WooCommerceOrdenesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    vi.mocked(woocommerceAPI.listOrdenes).mockResolvedValue({
      data: [sampleOrden],
      total: 1,
      limit: 100,
      offset: 0,
    })
    vi.mocked(woocommerceAPI.facturarOrden).mockResolvedValue({ pedidoId: 50, facturaId: 9 })
  })

  it('lista órdenes pendientes', async () => {
    render(<WooCommerceOrdenesPanel />)
    expect(await screen.findByTestId('woocommerce-ordenes-table')).toBeInTheDocument()
    expect(screen.getByTestId('woocommerce-orden-row-WC-100')).toBeInTheDocument()
    expect(screen.getByTestId('woocommerce-cuit-pending-WC-100')).toBeInTheDocument()
    expect(woocommerceAPI.listOrdenes).toHaveBeenCalledWith({ estado: 'pendiente' })
  })

  it('muestra vacío sin órdenes', async () => {
    vi.mocked(woocommerceAPI.listOrdenes).mockResolvedValue({
      data: [],
      total: 0,
      limit: 100,
      offset: 0,
    })
    render(<WooCommerceOrdenesPanel />)
    expect(await screen.findByTestId('woocommerce-ordenes-empty')).toBeInTheDocument()
  })

  it('cambia filtro y refresca', async () => {
    const user = userEvent.setup()
    render(<WooCommerceOrdenesPanel />)
    await screen.findByTestId('woocommerce-ordenes-table')
    await user.selectOptions(screen.getByTestId('woocommerce-ordenes-filter'), 'facturada')
    await waitFor(() => {
      expect(woocommerceAPI.listOrdenes).toHaveBeenCalledWith({ estado: 'facturada' })
    })
    await user.click(screen.getByTestId('woocommerce-ordenes-refresh-btn'))
    await waitFor(() => {
      expect(vi.mocked(woocommerceAPI.listOrdenes).mock.calls.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('factura una orden', async () => {
    const user = userEvent.setup()
    render(<WooCommerceOrdenesPanel />)
    await screen.findByTestId('woocommerce-facturar-WC-100')
    await user.click(screen.getByTestId('woocommerce-facturar-WC-100'))
    await waitFor(() => {
      expect(woocommerceAPI.facturarOrden).toHaveBeenCalledWith(
        'WC-100',
        expect.objectContaining({ tipo: 'B', numero: 1, prefijo: '0001' }),
      )
    })
  })

  it('muestra error de facturación', async () => {
    vi.mocked(woocommerceAPI.facturarOrden).mockRejectedValue(new Error('sin stock'))
    const user = userEvent.setup()
    render(<WooCommerceOrdenesPanel />)
    await screen.findByTestId('woocommerce-facturar-WC-100')
    await user.click(screen.getByTestId('woocommerce-facturar-WC-100'))
    expect(await screen.findByTestId('woocommerce-ordenes-action-error')).toHaveTextContent(
      'sin stock',
    )
  })

  it('muestra error de carga', async () => {
    vi.mocked(woocommerceAPI.listOrdenes).mockRejectedValue(new Error('red'))
    render(<WooCommerceOrdenesPanel />)
    expect(await screen.findByTestId('async-wrapper-error')).toBeInTheDocument()
  })
})
