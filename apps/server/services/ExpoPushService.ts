/**
 * @en Sends mobile push messages via Expo Push API (#172; shared with #165).
 * @es Envía push móvil vía Expo Push API (#172; compartido con #165).
 * @pt-BR Envia push móvel via Expo Push API (#172; compartilhado com #165).
 */

export const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export type ExpoPushMessage = {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
}

export type ExpoPushTicket = {
  status: 'ok' | 'error'
  id?: string
  message?: string
  details?: { error?: string }
}

export type ExpoPushSendResult = {
  tickets: ExpoPushTicket[]
  invalidTokens: string[]
}

type FetchLike = typeof fetch

/**
 * @en POSTs push messages to Expo; collects DeviceNotRegistered tokens for cleanup.
 * @es Envía mensajes a Expo; recolecta tokens DeviceNotRegistered para limpieza.
 * @pt-BR Envia mensagens ao Expo; coleta tokens DeviceNotRegistered para limpeza.
 */
export async function sendExpoPushMessages(
  messages: ExpoPushMessage[],
  fetchImpl: FetchLike = fetch,
): Promise<ExpoPushSendResult> {
  if (messages.length === 0) {
    return { tickets: [], invalidTokens: [] }
  }

  const invalidTokens: string[] = []
  const tickets: ExpoPushTicket[] = []

  // Expo accepts batches; keep chunks small for predictable tests.
  const chunkSize = 100
  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize)
    try {
      const res = await fetchImpl(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      })
      if (!res.ok) {
        continue
      }
      const json = (await res.json()) as { data?: ExpoPushTicket[] }
      const batchTickets = Array.isArray(json.data) ? json.data : []
      tickets.push(...batchTickets)
      for (let j = 0; j < batchTickets.length; j += 1) {
        const ticket = batchTickets[j]
        const token = chunk[j]?.to
        if (
          ticket?.status === 'error' &&
          ticket.details?.error === 'DeviceNotRegistered' &&
          typeof token === 'string'
        ) {
          invalidTokens.push(token)
        }
      }
    } catch {
      /* Push failures must never break business transactions */
    }
  }

  return { tickets, invalidTokens }
}
