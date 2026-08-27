/**
 * @en Pure keyword/regex intent classifier for customer-care WhatsApp bot (#201 MVP; no OpenAI).
 * @es Clasificador puro por keywords/regex del bot de atención WhatsApp (#201 MVP; sin OpenAI).
 * @pt-BR Classificador puro por keywords/regex do bot de atendimento WhatsApp (#201 MVP; sem OpenAI).
 */

import { normalizePhoneForWhatsApp } from '@bizcode/types'

export type AtencionBotIntent = 'saldo' | 'estado_pedido' | 'pagar' | 'unknown'

export type AtencionBotLocale = 'en' | 'es' | 'pt-BR'

export const ATENCION_BOT_SESSION_TTL_MS = 30 * 60 * 1000

const SALDO_RE =
  /\b(saldo|deuda|cuenta\s*corriente|balance|owing|owed|débito|debito|conta\s*corrente|meu\s*saldo)\b/i
const PEDIDO_RE =
  /\b(pedido|order|entrega|delivery|estado\s*(del?\s*)?pedido|status\s*(do\s*)?(pedido|order)|tracking|rastreo|rastreamento)\b/i
const PAGAR_RE =
  /\b(pagar|pago|pay|payment|link\s*(de\s*)?pago|checkout|mercadopago|\bmp\b|preferencia)\b/i

/**
 * @en Digits-only CUIT/CUIL (strips separators).
 * @es CUIT/CUIL solo dígitos (quita separadores).
 * @pt-BR CUIT/CUIL só dígitos (remove separadores).
 */
export function normalizeCuitDigits(raw: string): string {
  return raw.replace(/\D/g, '')
}

/**
 * @en True when the message is primarily an 11-digit tax id (CUIT/CUIL).
 * @es True si el mensaje es principalmente un CUIT/CUIL de 11 dígitos.
 * @pt-BR True se a mensagem é principalmente um CUIT/CUIL de 11 dígitos.
 */
export function looksLikeCuitMessage(raw: string): boolean {
  const digits = normalizeCuitDigits(raw)
  return digits.length === 11 && /^\d{11}$/.test(digits)
}

/**
 * @en Phone match: exact normalized digits or shared last 10 digits (AR mobile variants).
 * @es Match de teléfono: dígitos normalizados exactos o últimos 10 compartidos (variantes AR).
 * @pt-BR Match de telefone: dígitos normalizados exatos ou últimos 10 compartilhados (variantes AR).
 */
export function phonesMatchNormalized(a: string, b: string): boolean {
  const na = normalizePhoneForWhatsApp(a)
  const nb = normalizePhoneForWhatsApp(b)
  if (!na || !nb) return false
  if (na === nb) return true
  const minLen = 10
  if (na.length >= minLen && nb.length >= minLen) {
    return na.slice(-minLen) === nb.slice(-minLen)
  }
  return false
}

/**
 * @en Heuristic locale from message (defaults to fallback).
 * @es Locale heurístico desde el mensaje (default = fallback).
 * @pt-BR Locale heurístico a partir da mensagem (padrão = fallback).
 */
export function detectAtencionBotLocale(
  message: string,
  fallback: AtencionBotLocale = 'es',
): AtencionBotLocale {
  const m = message.toLowerCase()
  if (/\b(hello|hi|balance|order|pay|payment|please)\b/.test(m)) return 'en'
  if (/\b(olá|ola|pedido|pagar|saldo|obrigad[oa]|por\s+favor)\b/.test(m) && /[ãõçáéíóú]/i.test(message)) {
    return 'pt-BR'
  }
  if (/\b(olá|ola|obrigad[oa]|conta\s*corrente)\b/.test(m)) return 'pt-BR'
  if (/\b(hola|buenas|saldo|pedido|pagar|gracias)\b/.test(m)) return 'es'
  return fallback
}

/**
 * @en Classify inbound customer message into a bot intent (keyword MVP).
 * @es Clasifica el mensaje entrante en una intención del bot (MVP keywords).
 * @pt-BR Classifica a mensagem de entrada em uma intenção do bot (MVP keywords).
 */
export function classifyAtencionBotIntent(message: string): AtencionBotIntent {
  const text = message.trim()
  if (!text) return 'unknown'
  // Pay before balance (messages like "quiero pagar el saldo")
  if (PAGAR_RE.test(text)) return 'pagar'
  if (PEDIDO_RE.test(text)) return 'estado_pedido'
  if (SALDO_RE.test(text)) return 'saldo'
  return 'unknown'
}

/**
 * @en Session is expired when updatedAt is older than TTL.
 * @es La sesión expira si updatedAt es más antiguo que el TTL.
 * @pt-BR A sessão expira se updatedAt for mais antigo que o TTL.
 */
export function isAtencionBotSessionExpired(
  updatedAt: Date,
  now: Date = new Date(),
  ttlMs: number = ATENCION_BOT_SESSION_TTL_MS,
): boolean {
  return now.getTime() - updatedAt.getTime() > ttlMs
}
