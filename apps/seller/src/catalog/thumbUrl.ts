import { SELLER_API_BASE_URL } from '../config'

/**
 * @en Initials placeholder when an article has no thumbnail (#257).
 * @es Iniciales placeholder cuando el artículo no tiene thumb (#257).
 * @pt-BR Iniciais placeholder quando o artigo não tem thumb (#257).
 */
export function articuloInitials(descripcion: string): string {
  const parts = descripcion.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase()
}

/**
 * @en Absolute URL for `/uploads/articulos/...` thumbs from seller API base (#257). No CDN.
 * @es URL absoluta de thumbs `/uploads/articulos/...` desde la base API seller (#257). Sin CDN.
 * @pt-BR URL absoluta de thumbs `/uploads/articulos/...` a partir da base API seller (#257). Sem CDN.
 */
export function toAbsoluteUploadUrl(
  urlThumb: string | null | undefined,
  apiBaseUrl = SELLER_API_BASE_URL,
): string | null {
  if (urlThumb == null || urlThumb.trim() === '') return null
  const trimmed = urlThumb.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const origin = apiBaseUrl.replace(/\/api\/?$/i, '').replace(/\/$/, '')
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${origin}${path}`
}
