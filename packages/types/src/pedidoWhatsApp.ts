/**
 * @en WhatsApp order-confirmation preview/send types and pure message builder (#265).
 * @es Tipos de preview/envío WhatsApp de pedido y builder puro de mensaje (#265).
 * @pt-BR Tipos de preview/envio WhatsApp de pedido e builder puro de mensagem (#265).
 */

export const WHATSAPP_MESSAGE_MAX = 1024

export type SellerWhatsAppLocale = 'en' | 'es' | 'pt-BR'

export type WhatsAppCanal = 'link' | 'twilio'

export type WhatsAppShareReason = 'no_phone'

export type WhatsAppSharePreview = {
  phone: string
  text: string
  waMeUrl: string | null
  twilioAvailable: boolean
  reason?: WhatsAppShareReason
}

export type WhatsAppSendInput = {
  canal: WhatsAppCanal
}

export type WhatsAppSendResult = {
  canal: WhatsAppCanal
  sent: boolean
}

export type PedidoWhatsAppItem = {
  descripcion: string
  cantidad: number
  precio: number
  dscto?: number
  subtotal?: number
}

export const DEFAULT_SELLER_WHATSAPP_TEMPLATES: Record<SellerWhatsAppLocale, string> = {
  es: `Pedido #{{numero}} — {{fecha}}

{{items}}

Total: {{total}}

Gracias por su compra — {{empresa}}`,
  en: `Order #{{numero}} — {{fecha}}

{{items}}

Total: {{total}}

Thank you for your purchase — {{empresa}}`,
  'pt-BR': `Pedido #{{numero}} — {{fecha}}

{{items}}

Total: {{total}}

Obrigado pela sua compra — {{empresa}}`,
}

/**
 * @en Digits-only phone, same rule as Mercado Pago wa.me share.
 * @es Teléfono solo dígitos, misma regla que el share wa.me de Mercado Pago.
 * @pt-BR Telefone só dígitos, mesma regra do share wa.me do Mercado Pago.
 */
export function normalizePhoneForWhatsApp(telef: string): string {
  return telef.replace(/\D/g, '')
}

export function resolveSellerWhatsAppLocale(raw?: string | null): SellerWhatsAppLocale {
  const v = (raw ?? '').trim().toLowerCase()
  if (v === 'en' || v.startsWith('en-')) return 'en'
  if (v === 'pt-br' || v === 'pt' || v.startsWith('pt-')) return 'pt-BR'
  return 'es'
}

export function formatWhatsAppMoney(value: number): string {
  if (!Number.isFinite(value)) return '$0.00'
  return `$${value.toFixed(2)}`
}

export function formatWhatsAppFecha(value: Date | string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  const parsed = new Date(String(value))
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }
  const s = String(value).trim()
  return s.length >= 10 ? s.slice(0, 10) : s
}

export function formatPedidoWhatsAppItemLine(item: PedidoWhatsAppItem): string {
  const qty = Number.isFinite(item.cantidad) ? item.cantidad : 0
  const precio = Number.isFinite(item.precio) ? item.precio : 0
  const dscto = Number.isFinite(item.dscto) ? Number(item.dscto) : 0
  const desc = (item.descripcion || '').trim() || '—'
  const sub =
    item.subtotal != null && Number.isFinite(item.subtotal)
      ? Number(item.subtotal)
      : Math.round(qty * precio * (1 - dscto / 100) * 100) / 100
  if (dscto > 0) {
    return `${qty} x ${desc} (-${dscto}%) ${formatWhatsAppMoney(sub)}`
  }
  return `${qty} x ${desc} ${formatWhatsAppMoney(sub)}`
}

function applyTemplate(
  template: string,
  vars: { numero: string; fecha: string; total: string; empresa: string; items: string },
): string {
  return template
    .split('{{numero}}').join(vars.numero)
    .split('{{fecha}}').join(vars.fecha)
    .split('{{total}}').join(vars.total)
    .split('{{empresa}}').join(vars.empresa)
    .split('{{items}}').join(vars.items)
}

/**
 * @en Builds a WhatsApp body, trimming {{items}} until length ≤ 1024.
 * @es Arma el cuerpo WhatsApp recortando {{items}} hasta ≤ 1024 caracteres.
 * @pt-BR Monta o corpo WhatsApp cortando {{items}} até ≤ 1024 caracteres.
 */
export function buildPedidoWhatsAppMessage(input: {
  template: string
  numero: string
  fecha: string
  total: string
  empresa: string
  items: PedidoWhatsAppItem[]
}): string {
  const lines = input.items.map(formatPedidoWhatsAppItemLine)
  const varsBase = {
    numero: input.numero,
    fecha: input.fecha,
    total: input.total,
    empresa: input.empresa,
  }
  let text = applyTemplate(input.template, { ...varsBase, items: lines.join('\n') })
  let keep = lines.length
  while (text.length > WHATSAPP_MESSAGE_MAX && keep > 0) {
    keep -= 1
    const sliced = lines.slice(0, keep)
    const itemsText = keep < lines.length ? [...sliced, '…'].join('\n') : sliced.join('\n')
    text = applyTemplate(input.template, { ...varsBase, items: itemsText })
  }
  if (text.length > WHATSAPP_MESSAGE_MAX) {
    return text.slice(0, WHATSAPP_MESSAGE_MAX)
  }
  return text
}

export function buildWaMeUrl(phoneDigits: string, text: string): string | null {
  if (!phoneDigits) return null
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`
}

export function buildPedidoWhatsAppShare(input: {
  numero: number | string
  fecha: Date | string
  total: number | string
  empresa: string
  items: PedidoWhatsAppItem[]
  telef?: string | null
  template?: string | null
  locale?: string | null
  twilioAvailable: boolean
}): WhatsAppSharePreview {
  const locale = resolveSellerWhatsAppLocale(input.locale)
  const template = input.template?.trim() || DEFAULT_SELLER_WHATSAPP_TEMPLATES[locale]
  const totalNum = typeof input.total === 'number' ? input.total : Number.parseFloat(String(input.total))
  const text = buildPedidoWhatsAppMessage({
    template,
    numero: String(input.numero),
    fecha: formatWhatsAppFecha(input.fecha),
    total: formatWhatsAppMoney(Number.isFinite(totalNum) ? totalNum : 0),
    empresa: (input.empresa ?? '').trim(),
    items: input.items,
  })
  const phone = normalizePhoneForWhatsApp(input.telef ?? '')
  return {
    phone,
    text,
    waMeUrl: buildWaMeUrl(phone, text),
    twilioAvailable: input.twilioAvailable,
    ...(phone ? {} : { reason: 'no_phone' as const }),
  }
}
