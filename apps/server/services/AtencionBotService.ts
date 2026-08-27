/**
 * @en Orchestrates WhatsApp customer-care bot: resolve client, intents, outbound (#201).
 * @es Orquesta el bot de atención WhatsApp: resolver cliente, intenciones, outbound (#201).
 * @pt-BR Orquestra o bot de atendimento WhatsApp: resolver cliente, intenções, outbound (#201).
 */

import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { normalizePhoneForWhatsApp } from '@bizcode/types'
import { isTwilioConfigured, sendWhatsAppMessage } from '../channels'
import { notifyManagers } from '../notifications'
import { logger } from '../logger'
import { PaymentService } from '../payments/PaymentService'
import {
  classifyAtencionBotIntent,
  detectAtencionBotLocale,
  isAtencionBotSessionExpired,
  looksLikeCuitMessage,
  normalizeCuitDigits,
  phonesMatchNormalized,
  type AtencionBotLocale,
} from './atencionBotIntentMath'
import {
  msgAskCuit,
  msgBotInactive,
  msgCuitNotFound,
  msgEscalate,
  msgHelp,
  msgNoPendingInvoice,
  msgNoPedido,
  msgPayLink,
  msgPayUnavailable,
  msgPedido,
  msgSaldo,
} from './atencionBotMessages'
import { modulesInclude, TenantConfigService } from './TenantConfigService'
import { SellerAlertService } from './SellerAlertService'

type ClienteMatch = {
  id: number
  tenantId: number
  cuit: string | null
  rsocial: string
  telef: string | null
}

export type AtencionBotInbound = {
  fromRaw: string
  body: string
}

export class AtencionBotService {
  private readonly tenantConfig: TenantConfigService
  private readonly sellerAlerts: SellerAlertService
  private readonly payments: PaymentService

  constructor(private readonly prisma: PrismaClient) {
    this.tenantConfig = new TenantConfigService(prisma)
    this.sellerAlerts = new SellerAlertService(prisma)
    this.payments = new PaymentService(prisma)
  }

  /**
   * @en Process one inbound WhatsApp message; soft-fails outbound send.
   * @es Procesa un mensaje WhatsApp entrante; soft-fail en el envío.
   * @pt-BR Processa uma mensagem WhatsApp de entrada; soft-fail no envio.
   */
  async handleInbound(input: AtencionBotInbound): Promise<{ handled: boolean; reply?: string }> {
    if (!isTwilioConfigured()) {
      return { handled: false }
    }

    const phoneDigits = normalizePhoneForWhatsApp(input.fromRaw)
    if (!phoneDigits) {
      return { handled: false }
    }

    const body = (input.body ?? '').trim()
    let session = await this.prisma.atencionBotSession.findUnique({
      where: { phoneDigits },
    })

    if (session && isAtencionBotSessionExpired(session.updatedAt)) {
      await this.prisma.atencionBotSession.delete({ where: { id: session.id } }).catch(() => undefined)
      session = null
    }

    let locale: AtencionBotLocale = (session?.locale as AtencionBotLocale) || 'es'
    locale = detectAtencionBotLocale(body, locale)

    if (!session) {
      session = await this.prisma.atencionBotSession.create({
        data: { phoneDigits, locale, pendingStep: null },
      })
    } else if (session.locale !== locale) {
      session = await this.prisma.atencionBotSession.update({
        where: { id: session.id },
        data: { locale },
      })
    }

    // Resolve identity (phone unique match, else CUIT)
    if (!session.clienteId || !session.tenantId) {
      if (session.pendingStep === 'await_cuit') {
        if (!looksLikeCuitMessage(body)) {
          const reply = msgAskCuit(locale)
          await this.prisma.atencionBotSession.update({
            where: { id: session.id },
            data: { pendingStep: 'await_cuit', locale },
          })
          await this.reply(phoneDigits, reply)
          return { handled: true, reply }
        }
        const resolved = await this.resolveByCuit(normalizeCuitDigits(body), phoneDigits)
        if (!resolved || resolved.length === 0) {
          const reply = msgCuitNotFound(locale)
          await this.reply(phoneDigits, reply)
          return { handled: true, reply }
        }
        if (resolved.length > 1) {
          const reply = msgAskCuit(locale)
          await this.prisma.atencionBotSession.update({
            where: { id: session.id },
            data: { pendingStep: 'await_cuit', locale },
          })
          await this.reply(phoneDigits, reply)
          return { handled: true, reply }
        }
        const c = resolved[0]!
        const modulesForCuit = await this.tenantConfig.getModulesForTenant(c.tenantId)
        if (!modulesInclude(modulesForCuit, 'comms.whatsapp')) {
          const reply = msgBotInactive(locale)
          await this.reply(phoneDigits, reply)
          return { handled: true, reply }
        }
        await this.prisma.atencionBotSession.update({
          where: { id: session.id },
          data: {
            tenantId: c.tenantId,
            clienteId: c.id,
            pendingStep: null,
            locale,
          },
        })
        // CUIT-only turn: acknowledge identity with help (no intent in same message)
        const reply = msgHelp(locale)
        await this.reply(phoneDigits, reply)
        return { handled: true, reply }
      }

      const matches = await this.findClientesByPhone(phoneDigits)
      if (matches.length === 1) {
        const c = matches[0]!
        const modulesForPhone = await this.tenantConfig.getModulesForTenant(c.tenantId)
        if (!modulesInclude(modulesForPhone, 'comms.whatsapp')) {
          const reply = msgBotInactive(locale)
          await this.reply(phoneDigits, reply)
          return { handled: true, reply }
        }
        session = await this.prisma.atencionBotSession.update({
          where: { id: session.id },
          data: {
            tenantId: c.tenantId,
            clienteId: c.id,
            pendingStep: null,
            locale,
          },
        })
      } else {
        const reply = msgAskCuit(locale)
        await this.prisma.atencionBotSession.update({
          where: { id: session.id },
          data: { pendingStep: 'await_cuit', locale },
        })
        await this.reply(phoneDigits, reply)
        return { handled: true, reply }
      }
    }

    if (!session.clienteId || !session.tenantId) {
      const reply = msgAskCuit(locale)
      await this.reply(phoneDigits, reply)
      return { handled: true, reply }
    }

    const modules = await this.tenantConfig.getModulesForTenant(session.tenantId)
    if (!modulesInclude(modules, 'comms.whatsapp')) {
      const reply = msgBotInactive(locale)
      await this.reply(phoneDigits, reply)
      return { handled: true, reply }
    }

    const intent = classifyAtencionBotIntent(body)
    const tenantId = session.tenantId
    const clienteId = session.clienteId

    let reply: string
    switch (intent) {
      case 'saldo':
        reply = await this.handleSaldo(tenantId, clienteId, locale)
        break
      case 'estado_pedido':
        reply = await this.handlePedido(tenantId, clienteId, locale)
        break
      case 'pagar':
        reply = await this.handlePagar(tenantId, clienteId, locale)
        break
      default: {
        reply = msgEscalate(locale)
        const cliente = await this.prisma.cliente.findFirst({
          where: { id: clienteId, tenantId },
          select: { rsocial: true },
        })
        await notifyManagers(this.prisma, tenantId, 'atencion_bot_escalation', {
          clienteId,
          rsocial: cliente?.rsocial,
          preview: body.slice(0, 200),
          detail: `WhatsApp bot escalation from ${phoneDigits}`,
        }).catch((err) => {
          logger.warn(
            { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
            '[atencion-bot] notifyManagers failed',
          )
        })
        break
      }
    }

    if (!body || intent === 'unknown') {
      // unknown already set escalate; empty → help
      if (!body) reply = `${msgHelp(locale)}\n${msgEscalate(locale)}`
    }

    await this.reply(phoneDigits, reply)
    await this.prisma.atencionBotSession.update({
      where: { id: session.id },
      data: { locale, updatedAt: new Date() },
    })
    return { handled: true, reply }
  }

  private async reply(phoneDigits: string, text: string): Promise<void> {
    await sendWhatsAppMessage(phoneDigits, text)
  }

  private async findClientesByPhone(phoneDigits: string): Promise<ClienteMatch[]> {
    try {
      const suffix = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits
      const rows = await this.prisma.$queryRaw<ClienteMatch[]>`
        SELECT id, "tenantId", cuit, rsocial, telef
        FROM "Cliente"
        WHERE activo = true
          AND "anonymizedAt" IS NULL
          AND telef IS NOT NULL
          AND (
            regexp_replace(telef, '[^0-9]', '', 'g') = ${phoneDigits}
            OR right(regexp_replace(telef, '[^0-9]', '', 'g'), 10) = ${suffix}
          )
        LIMIT 25
      `
      return rows.filter((r) => r.telef && phonesMatchNormalized(phoneDigits, r.telef))
    } catch (err) {
      logger.warn(
        { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
        '[atencion-bot] phone lookup failed; falling back',
      )
      const candidates = await this.prisma.cliente.findMany({
        where: { activo: true, anonymizedAt: null, telef: { not: null } },
        select: { id: true, tenantId: true, cuit: true, rsocial: true, telef: true },
        take: 200,
      })
      return candidates.filter((c) => c.telef && phonesMatchNormalized(phoneDigits, c.telef))
    }
  }

  private async resolveByCuit(cuitDigits: string, phoneDigits: string): Promise<ClienteMatch[] | null> {
    const rows = await this.prisma.cliente.findMany({
      where: {
        activo: true,
        anonymizedAt: null,
        cuit: { not: null },
      },
      select: { id: true, tenantId: true, cuit: true, rsocial: true, telef: true },
      take: 50,
    })
    const matches = rows.filter((r) => r.cuit && normalizeCuitDigits(r.cuit) === cuitDigits)
    if (matches.length === 0) return null
    // Prefer phone-aligned when multiple tenants share CUIT (rare)
    const phoneAligned = matches.filter((m) => m.telef && phonesMatchNormalized(phoneDigits, m.telef))
    return phoneAligned.length > 0 ? phoneAligned : matches
  }

  private async handleSaldo(
    tenantId: number,
    clienteId: number,
    locale: AtencionBotLocale,
  ): Promise<string> {
    const estado = await this.sellerAlerts.getEstadoCredito(tenantId, clienteId)
    if (!estado) {
      return msgEscalate(locale)
    }
    return msgSaldo(locale, {
      deudaTotal: estado.deudaTotal,
      deudaVencida: estado.deudaVencida,
      pendientesCount: estado.facturasPendientes.length,
    })
  }

  private async handlePedido(
    tenantId: number,
    clienteId: number,
    locale: AtencionBotLocale,
  ): Promise<string> {
    const pedido = await this.prisma.pedido.findFirst({
      where: { tenantId, clienteId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, estado: true, total: true },
    })
    if (!pedido) return msgNoPedido(locale)
    const total =
      pedido.total instanceof Prisma.Decimal
        ? pedido.total.toFixed(2)
        : Number(pedido.total).toFixed(2)
    return msgPedido(locale, { pedidoId: pedido.id, estado: pedido.estado, total })
  }

  private async handlePagar(
    tenantId: number,
    clienteId: number,
    locale: AtencionBotLocale,
  ): Promise<string> {
    const estado = await this.sellerAlerts.getEstadoCredito(tenantId, clienteId)
    if (!estado) return msgEscalate(locale)
    const oldest = [...estado.facturasPendientes].sort((a, b) => a.id - b.id)[0]
    if (!oldest) return msgNoPendingInvoice(locale)

    const result = await this.payments.createPaymentForInvoice(tenantId, oldest.id)
    if (!result.ok || !result.data.checkoutUrl) {
      return msgPayUnavailable(locale)
    }
    return msgPayLink(locale, { facturaId: oldest.id, url: result.data.checkoutUrl })
  }
}
