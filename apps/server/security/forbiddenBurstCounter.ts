/**
 * @en In-memory 403 burst counter by IP for security monitoring (#221).
 * @es Contador en memoria de ráfagas 403 por IP para monitoreo (#221).
 * @pt-BR Contador em memória de rajadas 403 por IP para monitoramento (#221).
 */

const WINDOW_MS = 60_000
const DEFAULT_THRESHOLD = 10

type Bucket = { timestamps: number[] }

const buckets = new Map<string, Bucket>()

/**
 * @en Records a 403 response for an IP (call from middleware on response finish).
 * @es Registra un 403 para una IP (llamar desde middleware al finalizar la respuesta).
 * @pt-BR Registra um 403 para um IP (chamar do middleware ao finalizar a resposta).
 */
export function recordForbiddenResponse(ipAddress: string | null | undefined): void {
  const ip = (ipAddress ?? 'unknown').trim() || 'unknown'
  const now = Date.now()
  const bucket = buckets.get(ip) ?? { timestamps: [] }
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS)
  bucket.timestamps.push(now)
  buckets.set(ip, bucket)
}

/**
 * @en Returns IPs that exceeded the 403 threshold in the sliding window and clears them.
 * @es Devuelve IPs que superaron el umbral 403 en la ventana y las limpia.
 * @pt-BR Retorna IPs que ultrapassaram o limiar 403 na janela e as limpa.
 */
export function drainForbiddenBursts(threshold: number = DEFAULT_THRESHOLD): Array<{
  ipAddress: string
  count: number
}> {
  const now = Date.now()
  const hits: Array<{ ipAddress: string; count: number }> = []
  for (const [ip, bucket] of buckets.entries()) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS)
    if (bucket.timestamps.length >= threshold) {
      hits.push({ ipAddress: ip, count: bucket.timestamps.length })
      buckets.delete(ip)
    } else if (bucket.timestamps.length === 0) {
      buckets.delete(ip)
    }
  }
  return hits
}

/** @en Test helper to clear counters. @es Helper de test para limpiar contadores. @pt-BR Helper de teste para limpar contadores. */
export function resetForbiddenBurstCountersForTests(): void {
  buckets.clear()
}
