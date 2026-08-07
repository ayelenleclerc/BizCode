/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Factura } from '@bizcode/types'

const { getMpStatus, createCheckout, tStable } = vi.hoisted(() => ({
  getMpStatus: vi.fn(),
  createCheckout: vi.fn(),
  tStable: (key: string) => key,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: tStable,
    i18n: { language: 'es' },
  }),
}))

vi.mock('@/lib/api', () => ({
  facturasAPI: {
    getMpStatus,
    createMpPreference: vi.fn(),
    getMpQr: vi.fn(),
    refundMp: vi.fn(),
  },
  paymentsAPI: {
    createCheckout,
  },
}))

import MercadoPagoPaymentLinkModal from './MercadoPagoPaymentLinkModal'

const factura: Factura = {
  id: 1,
  fecha: '2026-08-01',
  tipo: 'A',
  prefijo: '0001',
  numero: 1,
  clienteId: 10,
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
    getMpStatus.mockReset()
    createCheckout.mockReset()
    getMpStatus.mockResolvedValue({ estado: 'none' })
    createCheckout.mockResolvedValue({
      provider: 'mercadopago',
      preferenceId: 'pref-1',
      initPoint: 'https://mp.test/pay',
      sandboxInitPoint: null,
      externalReference: '1',
      invoiceId: 1,
    })
  })

  it('creates checkout via paymentsAPI and shows link', async () => {
    const user = userEvent.setup()
    let checkoutCreated = false
    createCheckout.mockImplementation(async () => {
      checkoutCreated = true
      return {
        provider: 'mercadopago',
        preferenceId: 'pref-1',
        initPoint: 'https://mp.test/pay',
        sandboxInitPoint: null,
        externalReference: '1',
        invoiceId: 1,
      }
    })
    getMpStatus.mockImplementation(async () =>
      checkoutCreated
        ? {
            estado: 'pending',
            preferenceId: 'pref-1',
            paymentLink: 'https://mp.test/pay',
          }
        : { estado: 'none' },
    )

    render(
      <MercadoPagoPaymentLinkModal
        factura={factura}
        cliente={undefined}
        onClose={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(getMpStatus).toHaveBeenCalledWith(1)
    })
    expect(await screen.findByTestId('btn-mp-create-preference')).toBeInTheDocument()

    await user.click(screen.getByTestId('btn-mp-create-preference'))

    await waitFor(() => {
      expect(createCheckout).toHaveBeenCalledWith(1)
    })
    expect(await screen.findByTestId('mp-payment-link-input')).toHaveValue('https://mp.test/pay')
  })

  it('calls onClose from close button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <MercadoPagoPaymentLinkModal factura={factura} cliente={undefined} onClose={onClose} />,
    )

    await screen.findByTestId('btn-mp-modal-close')
    await user.click(screen.getByTestId('btn-mp-modal-close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
