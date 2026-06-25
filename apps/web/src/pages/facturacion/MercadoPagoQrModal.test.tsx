import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import MercadoPagoQrModal from './MercadoPagoQrModal'
import { facturasAPI } from '@/lib/api'
import type { Factura } from '@bizcode/types'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      const map: Record<string, string> = {
        'mercadopago.qr.modalTitle': 'Cobrar con QR',
        'mercadopago.qr.modalSubtitle': `Factura ${opts?.ref ?? ''}`,
        'mercadopago.qr.loading': 'Cargando…',
        'mercadopago.qr.createQr': 'Generar QR',
        'mercadopago.qr.creating': 'Generando…',
        'mercadopago.qr.imageAlt': 'Código QR de pago',
        'mercadopago.qr.scanHint': 'Escaneá con la app de Mercado Pago',
        'mercadopago.estado.none': 'Sin cobro',
        'mercadopago.estado.pending': 'Pendiente',
        'detail.close': 'Cerrar',
      }
      return map[key] ?? key
    },
  }),
}))

vi.mock('@/lib/api', () => ({
  facturasAPI: {
    getMpStatus: vi.fn(),
    createMpQr: vi.fn(),
  },
}))

const factura: Factura = {
  id: 7,
  fecha: '2026-06-01',
  tipo: 'B',
  prefijo: '0001',
  numero: 99,
  clienteId: 2,
  neto1: 100,
  neto2: 0,
  neto3: 0,
  iva1: 21,
  iva2: 0,
  total: 121,
  estado: 'A',
}

describe('MercadoPagoQrModal', () => {
  beforeEach(() => {
    vi.mocked(facturasAPI.getMpStatus).mockResolvedValue({
      estado: 'none',
      amount: '121.00',
    })
    vi.mocked(facturasAPI.createMpQr).mockImplementation(async () => {
      const data = {
        estado: 'pending' as const,
        channel: 'qr' as const,
        qrImageBase64: 'abc123',
        amount: '121.00',
      }
      vi.mocked(facturasAPI.getMpStatus).mockResolvedValue(data)
      return data
    })
  })

  it('loads status and creates QR', async () => {
    const user = userEvent.setup()
    render(<MercadoPagoQrModal factura={factura} onClose={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByTestId('btn-mp-create-qr')).toBeInTheDocument()
    })

    vi.mocked(facturasAPI.createMpQr).mockClear()
    await user.click(screen.getByTestId('btn-mp-create-qr'))

    await waitFor(() => {
      expect(facturasAPI.createMpQr).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(screen.getByTestId('mp-qr-status-badge')).toHaveTextContent('Pendiente')
    })
  })
})
