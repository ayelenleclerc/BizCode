export const MOTIVO_NO_ENTREGA_VALUES = [
  'ausente',
  'rechazo',
  'domicilio_incorrecto',
  'producto_dañado',
  'otro',
] as const

export type MotivoNoEntrega = (typeof MOTIVO_NO_ENTREGA_VALUES)[number]

export const POD_MAX_FIRMA_BYTES = 50 * 1024
export const POD_MAX_FOTO_BYTES = 200 * 1024

export type PodMediaPayload = {
  firmaBase64?: string
  fotoBase64?: string
}

/**
 * @en Decoded byte length of a data-URL or raw base64 string.
 * @es Tamaño en bytes decodificado de data-URL o base64.
 * @pt-BR Tamanho em bytes decodificado de data-URL ou base64.
 */
export function base64PayloadByteLength(value: string): number {
  const trimmed = value.trim()
  if (trimmed.length === 0) return 0
  const comma = trimmed.indexOf(',')
  const payload = comma >= 0 ? trimmed.slice(comma + 1) : trimmed
  const normalized = payload.replace(/\s/g, '')
  if (normalized.length === 0) return 0
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0
  return Math.floor((normalized.length * 3) / 4) - padding
}

export function isNonEmptyBase64(value: string | undefined | null): boolean {
  if (value == null || value.trim().length === 0) return false
  return base64PayloadByteLength(value) > 0
}

export function validatePodMediaSizes(media: PodMediaPayload): string | null {
  if (media.firmaBase64 != null && media.firmaBase64.trim().length > 0) {
    if (base64PayloadByteLength(media.firmaBase64) > POD_MAX_FIRMA_BYTES) {
      return 'POD_FIRMA_TOO_LARGE'
    }
  }
  if (media.fotoBase64 != null && media.fotoBase64.trim().length > 0) {
    if (base64PayloadByteLength(media.fotoBase64) > POD_MAX_FOTO_BYTES) {
      return 'POD_FOTO_TOO_LARGE'
    }
  }
  return null
}

export function parsePodMediaJson(raw: unknown): PodMediaPayload | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>
  const firmaBase64 = typeof obj.firmaBase64 === 'string' ? obj.firmaBase64 : undefined
  const fotoBase64 = typeof obj.fotoBase64 === 'string' ? obj.fotoBase64 : undefined
  if (firmaBase64 === undefined && fotoBase64 === undefined) return null
  return { firmaBase64, fotoBase64 }
}

export function itemHasPod(item: {
  podMedia: unknown
  receptorNombre?: string | null
}): boolean {
  const media = parsePodMediaJson(item.podMedia)
  return isNonEmptyBase64(media?.firmaBase64) || Boolean(item.receptorNombre?.trim())
}
