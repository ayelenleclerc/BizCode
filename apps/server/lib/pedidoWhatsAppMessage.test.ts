import { describe, expect, it } from 'vitest'
import {
  WHATSAPP_MESSAGE_MAX,
  DEFAULT_SELLER_WHATSAPP_TEMPLATES,
  buildPedidoWhatsAppMessage,
  buildPedidoWhatsAppShare,
  normalizePhoneForWhatsApp,
} from './pedidoWhatsAppMessage'

describe('pedidoWhatsAppMessage (#265)', () => {
  it('normalizes phone to digits only (same as Mercado Pago wa.me)', () => {
    expect(normalizePhoneForWhatsApp('+54 9 11 5555-1234')).toBe('5491155551234')
    expect(normalizePhoneForWhatsApp('')).toBe('')
  })

  it('builds ES message with items, discount and total', () => {
    const text = buildPedidoWhatsAppMessage({
      template: DEFAULT_SELLER_WHATSAPP_TEMPLATES.es,
      numero: '42',
      fecha: '2026-08-13',
      total: '$150.00',
      empresa: 'Acme SA',
      items: [
        { descripcion: 'Widget', cantidad: 2, precio: 50, dscto: 0, subtotal: 100 },
        { descripcion: 'Gadget', cantidad: 1, precio: 60, dscto: 10, subtotal: 54 },
      ],
    })
    expect(text).toContain('Pedido #42')
    expect(text).toContain('2026-08-13')
    expect(text).toContain('2 x Widget $100.00')
    expect(text).toContain('1 x Gadget (-10%) $54.00')
    expect(text).toContain('Total: $150.00')
    expect(text).toContain('Gracias por su compra — Acme SA')
    expect(text.length).toBeLessThanOrEqual(WHATSAPP_MESSAGE_MAX)
  })

  it('uses EN / pt-BR default templates', () => {
    const en = buildPedidoWhatsAppMessage({
      template: DEFAULT_SELLER_WHATSAPP_TEMPLATES.en,
      numero: '1',
      fecha: '2026-01-01',
      total: '$10.00',
      empresa: 'Co',
      items: [{ descripcion: 'A', cantidad: 1, precio: 10, subtotal: 10 }],
    })
    expect(en).toContain('Order #1')
    expect(en).toContain('Thank you for your purchase')

    const pt = buildPedidoWhatsAppMessage({
      template: DEFAULT_SELLER_WHATSAPP_TEMPLATES['pt-BR'],
      numero: '1',
      fecha: '2026-01-01',
      total: '$10.00',
      empresa: 'Co',
      items: [{ descripcion: 'A', cantidad: 1, precio: 10, subtotal: 10 }],
    })
    expect(pt).toContain('Pedido #1')
    expect(pt).toContain('Obrigado pela sua compra')
  })

  it('trims items so the message stays within 1024 characters', () => {
    const items = Array.from({ length: 80 }, (_, i) => ({
      descripcion: `Artículo con descripción larga número ${i} extra extra extra`,
      cantidad: 12,
      precio: 999.99,
      dscto: 15,
      subtotal: 10199.9,
    }))
    const text = buildPedidoWhatsAppMessage({
      template: DEFAULT_SELLER_WHATSAPP_TEMPLATES.es,
      numero: '9999',
      fecha: '2026-08-13',
      total: '$99999.00',
      empresa: 'Empresa Muy Larga S.A.',
      items,
    })
    expect(text.length).toBeLessThanOrEqual(WHATSAPP_MESSAGE_MAX)
    expect(text).toContain('…')
  })

  it('preview without phone sets reason no_phone and null waMeUrl', () => {
    const preview = buildPedidoWhatsAppShare({
      numero: 7,
      fecha: new Date('2026-08-13T12:00:00.000Z'),
      total: 20,
      empresa: 'Acme',
      items: [{ descripcion: 'X', cantidad: 1, precio: 20, subtotal: 20 }],
      telef: null,
      twilioAvailable: false,
    })
    expect(preview.phone).toBe('')
    expect(preview.waMeUrl).toBeNull()
    expect(preview.reason).toBe('no_phone')
    expect(preview.text).toContain('Pedido #7')
  })

  it('preview with phone builds wa.me url and honors tenant template', () => {
    const preview = buildPedidoWhatsAppShare({
      numero: 8,
      fecha: '2026-08-13T15:00:00.000Z',
      total: '33.5',
      empresa: 'Acme',
      items: [{ descripcion: 'Y', cantidad: 1, precio: 33.5, subtotal: 33.5 }],
      telef: '(11) 4444-0000',
      template: 'Hola {{numero}} / {{total}} / {{items}} / {{empresa}}',
      locale: 'en',
      twilioAvailable: true,
    })
    expect(preview.phone).toBe('1144440000')
    expect(preview.twilioAvailable).toBe(true)
    expect(preview.reason).toBeUndefined()
    expect(preview.text).toBe('Hola 8 / $33.50 / 1 x Y $33.50 / Acme')
    expect(preview.waMeUrl).toBe(
      `https://wa.me/1144440000?text=${encodeURIComponent(preview.text)}`,
    )
  })
})
