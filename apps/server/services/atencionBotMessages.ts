/**
 * @en i18n reply templates for customer-care WhatsApp bot (#201).
 * @es Plantillas i18n de respuesta del bot de atención WhatsApp (#201).
 * @pt-BR Modelos i18n de resposta do bot de atendimento WhatsApp (#201).
 */

import type { AtencionBotLocale } from './atencionBotIntentMath'

type MsgTable = Record<AtencionBotLocale, string>

function pick(table: MsgTable, locale: AtencionBotLocale): string {
  return table[locale] ?? table.es
}

export function msgBotInactive(locale: AtencionBotLocale): string {
  return pick(
    {
      en: 'WhatsApp customer care is not available for this account right now.',
      es: 'La atención por WhatsApp no está disponible para esta cuenta en este momento.',
      'pt-BR': 'O atendimento por WhatsApp não está disponível para esta conta no momento.',
    },
    locale,
  )
}

export function msgAskCuit(locale: AtencionBotLocale): string {
  return pick(
    {
      en: 'We could not identify your account by phone. Please reply with your CUIT/CUIL (11 digits).',
      es: 'No pudimos identificar su cuenta por teléfono. Responda con su CUIT/CUIL (11 dígitos).',
      'pt-BR':
        'Não foi possível identificar sua conta pelo telefone. Responda com seu CUIT/CUIL (11 dígitos).',
    },
    locale,
  )
}

export function msgCuitNotFound(locale: AtencionBotLocale): string {
  return pick(
    {
      en: 'We could not find an active customer with that CUIT. A staff member will contact you.',
      es: 'No encontramos un cliente activo con ese CUIT. Un agente se pondrá en contacto.',
      'pt-BR':
        'Não encontramos um cliente ativo com esse CUIT. Um atendente entrará em contato.',
    },
    locale,
  )
}

export function msgHelp(locale: AtencionBotLocale): string {
  return pick(
    {
      en: 'You can ask about: balance, order status, or pay (payment link).',
      es: 'Puede consultar: saldo, estado de pedido o pagar (link de pago).',
      'pt-BR': 'Você pode consultar: saldo, status do pedido ou pagar (link de pagamento).',
    },
    locale,
  )
}

export function msgEscalate(locale: AtencionBotLocale): string {
  return pick(
    {
      en: 'We could not resolve that automatically. A staff member has been notified and will contact you.',
      es: 'No pudimos resolver eso automáticamente. Un agente fue notificado y se pondrá en contacto.',
      'pt-BR':
        'Não foi possível resolver isso automaticamente. Um atendente foi notificado e entrará em contato.',
    },
    locale,
  )
}

export function msgSaldo(locale: AtencionBotLocale, input: {
  deudaTotal: string
  deudaVencida: string
  pendientesCount: number
}): string {
  const base = pick(
    {
      en: `Your balance is ${input.deudaTotal}. Overdue: ${input.deudaVencida}. Pending invoices: ${input.pendientesCount}.`,
      es: `Su saldo es ${input.deudaTotal}. Vencido: ${input.deudaVencida}. Facturas pendientes: ${input.pendientesCount}.`,
      'pt-BR': `Seu saldo é ${input.deudaTotal}. Vencido: ${input.deudaVencida}. Faturas pendentes: ${input.pendientesCount}.`,
    },
    locale,
  )
  return base
}

export function msgPedido(locale: AtencionBotLocale, input: {
  pedidoId: number
  estado: string
  total: string
}): string {
  return pick(
    {
      en: `Your latest order #${input.pedidoId} is «${input.estado}» (total ${input.total}).`,
      es: `Su último pedido #${input.pedidoId} está en estado «${input.estado}» (total ${input.total}).`,
      'pt-BR': `Seu último pedido #${input.pedidoId} está «${input.estado}» (total ${input.total}).`,
    },
    locale,
  )
}

export function msgNoPedido(locale: AtencionBotLocale): string {
  return pick(
    {
      en: 'We found no orders for your account.',
      es: 'No encontramos pedidos para su cuenta.',
      'pt-BR': 'Não encontramos pedidos para sua conta.',
    },
    locale,
  )
}

export function msgPayLink(locale: AtencionBotLocale, input: { facturaId: number; url: string }): string {
  return pick(
    {
      en: `Payment link for invoice #${input.facturaId}:\n${input.url}`,
      es: `Link de pago para la factura #${input.facturaId}:\n${input.url}`,
      'pt-BR': `Link de pagamento da fatura #${input.facturaId}:\n${input.url}`,
    },
    locale,
  )
}

export function msgPayUnavailable(locale: AtencionBotLocale): string {
  return pick(
    {
      en: 'Online payment is not available right now. A staff member can help you pay.',
      es: 'El pago en línea no está disponible en este momento. Un agente puede ayudarle a pagar.',
      'pt-BR':
        'O pagamento online não está disponível no momento. Um atendente pode ajudar você a pagar.',
    },
    locale,
  )
}

export function msgNoPendingInvoice(locale: AtencionBotLocale): string {
  return pick(
    {
      en: 'You have no pending invoices to pay.',
      es: 'No tiene facturas pendientes para pagar.',
      'pt-BR': 'Você não tem faturas pendentes para pagar.',
    },
    locale,
  )
}
