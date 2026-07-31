/**
 * @en Stable dedupe key for a bank movement (#190).
 * @es Clave de deduplicación estable de un movimiento bancario (#190).
 * @pt-BR Chave de deduplicação estável de um movimento bancário (#190).
 */
import { createHash } from 'node:crypto'

export function buildMovimientoDedupeKey(input: {
  fechaIso: string
  importe: string
  tipo: string
  referencia: string | null | undefined
  descripcion: string
}): string {
  const ref = (input.referencia ?? '').trim().toLowerCase()
  const desc = input.descripcion.trim().toLowerCase().slice(0, 80)
  const raw = `${input.fechaIso}|${input.importe}|${input.tipo}|${ref}|${desc}`
  return createHash('sha256').update(raw).digest('hex').slice(0, 64)
}
