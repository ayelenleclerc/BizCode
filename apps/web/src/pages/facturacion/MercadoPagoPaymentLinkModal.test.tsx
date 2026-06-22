import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import MercadoPagoPaymentLinkModal from './MercadoPagoPaymentLinkModal'
import { facturasAPI } from '@/lib/api'
import type { Factura } from '@/types'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      const map: Record<string, string> = {
        'mercadopago.modalTitle': 'Link de pago',
        'mercadopago.modalSubtitle': `Factura ${opts?.ref ?? ''}`,
        'mercadopago.loading': 'Cargando…',
        'mercadopago.createLink': 'Generar link',
        'mercadopago.creating': 'Generando…',
        'mercadopago.estado.none': 'Sin link',
        'mercadopago.estado.pending': 'Pendiente',
        'mercadopago.linkLabel': 'Link',
        'mercadopago.copy': 'Copiar',
        'mercadopago.whatsapp': 'WhatsApp',
        'mercadopago.email': 'Email',
        'mercadopago.shareGroup': 'Compartir',
        'mercadopago.whatsappDisabled': 'Sin teléfono',
        'mercadopago.emailDisabled': 'Sin email',
        'detail.close': 'Cerrar',
      }
      return map[key] ?? key
    },
  }),
}))

vi.mock('@/lib/api', () => ({
  facturasAPI: {
    getMpStatus: vi.fn(),
    createMpPreference: vi.fn(),
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

describe('MercadoPagoPaymentLinkModal', () => {
  beforeEach(() => {
    vi.mocked(facturasAPI.getMpStatus).mockResolvedValue({
      estado: 'none',
      amount: '121.00',
    })
    vi.mocked(facturasAPI.createMpPreference).mockResolvedValue({
      estado: 'pending',
      paymentLink: 'https://mp.test/pay',
      amount: '121.00',
    })
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('loads status and creates preference', async () => {
    const user = userEvent.setup()
    render(
      <MercadoPagoPaymentLinkModal
        factura={factura}
        cliente={{ id: 2, codigo: 1, rsocial: 'ACME', condIva: 'RI', activo: true, telef: '5491112345678', email: 'a@b.com' } as never}
        onClose={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('btn-mp-create-preference')).toBeInTheDocument()
    })

    vi.mocked(facturasAPI.createMpPreference).mockClear()
    await user.click(screen.getByTestId('btn-mp-create-preference'))

    await waitFor(() => {
      expect(facturasAPI.createMpPreference).toHaveBeenCalledTimes(1)
      expect(facturasAPI.createMpPreference).toHaveBeenCalledWith(7)
    })
  })
})
