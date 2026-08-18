import { describe, expect, it } from 'vitest'
import {
  canSubmitWithoutOverSaldoDialog,
  formatMoney,
  needsOverSaldoConfirm,
  parseMoney,
  sumSelectedPendiente,
} from './cobroAmount'
import { isChequeForma, isEfectivoForma, isTransferForma, pickDefaultFormaPagoId } from './formaPagoMatch'
import { buildCobroReceiptText, buildCobroWaMeUrl } from './whatsappReceipt'
import { digitsOnly } from '../ruta/stopView'

describe('cobroAmount (#162)', () => {
  it('defaults monto to the sum of selected pending invoices', () => {
    expect(
      sumSelectedPendiente(
        [
          { facturaId: 1, pendiente: '10.50' },
          { facturaId: 2, pendiente: '5.00' },
          { facturaId: 3, pendiente: '20.00' },
        ],
        new Set([1, 3]),
      ),
    ).toBe(30.5)
  })

  it('blocks submit over saldo until explicit confirm', () => {
    expect(needsOverSaldoConfirm(100.01, 100)).toBe(true)
    expect(canSubmitWithoutOverSaldoDialog(100.01, 100, false)).toBe(false)
    expect(canSubmitWithoutOverSaldoDialog(100.01, 100, true)).toBe(true)
    expect(canSubmitWithoutOverSaldoDialog(50, 100, false)).toBe(true)
    expect(canSubmitWithoutOverSaldoDialog(0, 100, false)).toBe(false)
  })

  it('parses and formats money', () => {
    expect(parseMoney('12,5')).toBe(12.5)
    expect(formatMoney(10)).toBe('10.00')
  })
})

describe('formaPagoMatch (#162)', () => {
  it('maps cash/transfer/cheque from flags and description', () => {
    expect(isEfectivoForma({ id: 1, descripcion: 'Tarjeta', esEfectivo: true })).toBe(true)
    expect(isChequeForma({ id: 2, descripcion: 'Cheque 30 días' })).toBe(true)
    expect(isTransferForma({ id: 3, descripcion: 'Transferencia' })).toBe(true)
    expect(pickDefaultFormaPagoId([{ id: 9, descripcion: 'Cheque' }, { id: 1, descripcion: 'Efectivo' }])).toBe(1)
  })
})

describe('whatsappReceipt (#162)', () => {
  it('fills the receipt template and builds wa.me from digitsOnly', () => {
    expect(digitsOnly('+54 (11) 4444-5555')).toBe('541144445555')
    const text = buildCobroReceiptText({
      template: '{{empresa}} / {{cliente}} / {{fecha}} / {{importe}} / {{forma}} / Nº {{numero}}',
      empresa: 'BizCode',
      cliente: 'ACME',
      fecha: '2026-08-18',
      importe: '100.00',
      forma: 'Efectivo',
      numero: 10,
    })
    expect(text).toBe('BizCode / ACME / 2026-08-18 / 100.00 / Efectivo / Nº 10')
    expect(buildCobroWaMeUrl('+54 11 4444-5555', text)).toBe(
      `https://wa.me/541144445555?text=${encodeURIComponent(text)}`,
    )
    expect(buildCobroWaMeUrl(null, text)).toBeNull()
  })
})
