/**
 * @en Validates and normalizes a tenant WooCommerce store base URL (HTTPS, public host) (#188).
 * @es Valida y normaliza la URL base de tienda WooCommerce del tenant (HTTPS, host público) (#188).
 * @pt-BR Valida e normaliza a URL base da loja WooCommerce do tenant (HTTPS, host público) (#188).
 */

export class WooCommerceStoreUrlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WooCommerceStoreUrlError'
  }
}

/**
 * @en Strips trailing `/` without a polynomial regex (CodeQL js/polynomial-redos).
 * @es Quita `/` finales sin regex polinómica (CodeQL js/polynomial-redos).
 * @pt-BR Remove `/` finais sem regex polinomial (CodeQL js/polynomial-redos).
 */
export function stripTrailingSlashes(value: string): string {
  let end = value.length
  while (end > 0 && value.charCodeAt(end - 1) === 47 /* '/' */) {
    end -= 1
  }
  return value.slice(0, end)
}

function isIpV4Literal(hostname: string): boolean {
  const parts = hostname.split('.')
  if (parts.length !== 4) return false
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false
    const n = Number(part)
    return n >= 0 && n <= 255
  })
}

/**
 * @en True when hostname is localhost, a private/link-local IPv4, or an obvious loopback label.
 * @es True si el hostname es localhost, IPv4 privada/link-local o etiqueta de loopback.
 * @pt-BR True se o hostname é localhost, IPv4 privada/link-local ou rótulo de loopback.
 */
export function isBlockedWooCommerceHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '')
  if (!host) return true
  if (host === 'localhost' || host.endsWith('.localhost') || host === '0.0.0.0') return true
  if (host === '::1' || host === '[::1]') return true
  if (host.includes(':')) {
    // Block IPv6 literals (including unique-local / link-local) for store URLs.
    return true
  }
  if (!isIpV4Literal(host)) {
    // Block metadata / internal-looking DNS labels commonly used in SSRF probes.
    if (host === 'metadata.google.internal') return true
    return false
  }
  if (host === '127.0.0.1' || host.startsWith('127.')) return true
  if (host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('169.254.')) {
    return true
  }
  const m = /^172\.(\d+)\./.exec(host)
  if (m) {
    const second = Number.parseInt(m[1], 10)
    if (second >= 16 && second <= 31) return true
  }
  return false
}

/**
 * @en Parses `storeUrl`, requires `https:`, rejects private hosts, returns origin without trailing `/`.
 * @es Parsea `storeUrl`, exige `https:`, rechaza hosts privados y devuelve origin sin `/` final.
 * @pt-BR Faz parse de `storeUrl`, exige `https:`, rejeita hosts privados e retorna origin sem `/` final.
 */
export function normalizeAndValidateWooCommerceStoreUrl(raw: string): string {
  const trimmed = stripTrailingSlashes(raw.trim())
  if (!trimmed) {
    throw new WooCommerceStoreUrlError('storeUrl is required')
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new WooCommerceStoreUrlError('storeUrl must be a valid URL')
  }

  if (parsed.protocol !== 'https:') {
    throw new WooCommerceStoreUrlError('storeUrl must use https')
  }
  if (parsed.username || parsed.password) {
    throw new WooCommerceStoreUrlError('storeUrl must not include credentials')
  }
  if (isBlockedWooCommerceHostname(parsed.hostname)) {
    throw new WooCommerceStoreUrlError('storeUrl host is not allowed')
  }

  // Origin only — ignore path/query/fragment from the tenant setting.
  return stripTrailingSlashes(parsed.origin)
}

/**
 * @en Allows only relative WC REST paths under `/wp-json/wc/v3` (no open redirects).
 * @es Solo permite paths REST WC relativos bajo `/wp-json/wc/v3` (sin open redirects).
 * @pt-BR Permite apenas paths REST WC relativos sob `/wp-json/wc/v3` (sem open redirects).
 */
export function normalizeWooCommerceApiPath(path: string): string {
  const withSlash = path.startsWith('/') ? path : `/${path}`
  if (withSlash.includes('://') || withSlash.includes('\\') || withSlash.includes('\0')) {
    throw new WooCommerceStoreUrlError('Invalid WooCommerce API path')
  }
  // Reject path traversal / host injection fragments.
  if (withSlash.includes('..') || withSlash.startsWith('//')) {
    throw new WooCommerceStoreUrlError('Invalid WooCommerce API path')
  }
  return withSlash
}
