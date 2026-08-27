/**
 * @en Unit fixtures for #201 customer-care bot keyword classifier (Opción A).
 * @es Fixtures unitarios del clasificador keywords del bot #201 (Opción A).
 * @pt-BR Fixtures unitários do classificador keywords do bot #201 (Opção A).
 */

import { describe, expect, it } from 'vitest'
import {
  classifyAtencionBotIntent,
  detectAtencionBotLocale,
  isAtencionBotSessionExpired,
  looksLikeCuitMessage,
  normalizeCuitDigits,
  phonesMatchNormalized,
  ATENCION_BOT_SESSION_TTL_MS,
} from '../../apps/server/services/atencionBotIntentMath'

describe('atencionBotIntentMath (#201)', () => {
  describe('classifyAtencionBotIntent', () => {
    it('maps saldo keywords ES/EN/PT-BR', () => {
      expect(classifyAtencionBotIntent('Quiero mi saldo')).toBe('saldo')
      expect(classifyAtencionBotIntent('What is my balance?')).toBe('saldo')
      expect(classifyAtencionBotIntent('Qual é o meu saldo na conta corrente?')).toBe('saldo')
      expect(classifyAtencionBotIntent('cuánto debo')).toBe('unknown') // no keyword "deuda" alone as verb form
      expect(classifyAtencionBotIntent('consulta deuda')).toBe('saldo')
    })

    it('maps order-status keywords', () => {
      expect(classifyAtencionBotIntent('estado del pedido')).toBe('estado_pedido')
      expect(classifyAtencionBotIntent('Where is my order?')).toBe('estado_pedido')
      expect(classifyAtencionBotIntent('status do pedido')).toBe('estado_pedido')
      expect(classifyAtencionBotIntent('tracking de entrega')).toBe('estado_pedido')
    })

    it('maps pay keywords before balance', () => {
      expect(classifyAtencionBotIntent('quiero pagar')).toBe('pagar')
      expect(classifyAtencionBotIntent('pay my invoice')).toBe('pagar')
      expect(classifyAtencionBotIntent('link de pago mercadopago')).toBe('pagar')
      expect(classifyAtencionBotIntent('quiero pagar el saldo')).toBe('pagar')
    })

    it('returns unknown for free text (escalation path)', () => {
      expect(classifyAtencionBotIntent('hablame con un humano')).toBe('unknown')
      expect(classifyAtencionBotIntent('???')).toBe('unknown')
      expect(classifyAtencionBotIntent('')).toBe('unknown')
    })
  })

  describe('CUIT / phone helpers', () => {
    it('normalizes and detects CUIT messages', () => {
      expect(normalizeCuitDigits('20-12345678-9')).toBe('20123456789')
      expect(looksLikeCuitMessage('20-12345678-9')).toBe(true)
      expect(looksLikeCuitMessage('hola')).toBe(false)
      expect(looksLikeCuitMessage('12345')).toBe(false)
    })

    it('matches phone variants by last 10 digits', () => {
      expect(phonesMatchNormalized('+5491155551234', '11-5555-1234')).toBe(true)
      expect(phonesMatchNormalized('5491155551234', '5491155551234')).toBe(true)
      expect(phonesMatchNormalized('1155551234', '1155559999')).toBe(false)
    })
  })

  describe('locale + TTL', () => {
    it('detects locale heuristically', () => {
      expect(detectAtencionBotLocale('Hello, balance please', 'es')).toBe('en')
      expect(detectAtencionBotLocale('Hola, saldo por favor', 'en')).toBe('es')
      expect(detectAtencionBotLocale('Olá, conta corrente', 'es')).toBe('pt-BR')
    })

    it('expires sessions after TTL', () => {
      const now = new Date('2026-08-27T12:00:00.000Z')
      const fresh = new Date(now.getTime() - 5 * 60 * 1000)
      const stale = new Date(now.getTime() - ATENCION_BOT_SESSION_TTL_MS - 1)
      expect(isAtencionBotSessionExpired(fresh, now)).toBe(false)
      expect(isAtencionBotSessionExpired(stale, now)).toBe(true)
    })
  })

  describe('sample conversation fixture (AC)', () => {
    const turns: Array<{ text: string; intent: ReturnType<typeof classifyAtencionBotIntent> }> = [
      { text: 'Hola, quiero saber mi saldo', intent: 'saldo' },
      { text: 'estado del pedido', intent: 'estado_pedido' },
      { text: 'quiero pagar con mercadopago', intent: 'pagar' },
      { text: 'necesito hablar con alguien', intent: 'unknown' },
    ]

    it('classifies a multi-turn sample conversation', () => {
      for (const turn of turns) {
        expect(classifyAtencionBotIntent(turn.text)).toBe(turn.intent)
      }
    })
  })
})
