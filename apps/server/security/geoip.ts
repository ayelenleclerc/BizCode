/**
 * @en Resolves ISO country code from an IP using offline geoip-lite (#221).
 * @es Resuelve código ISO de país desde una IP con geoip-lite offline (#221).
 * @pt-BR Resolve código ISO do país a partir de um IP com geoip-lite offline (#221).
 */

import geoip from 'geoip-lite'

function isPrivateOrLocalIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return true
  }
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('fc') || ip.startsWith('fd')) {
    return true
  }
  const m = /^172\.(\d+)\./.exec(ip)
  if (m) {
    const second = Number.parseInt(m[1], 10)
    return second >= 16 && second <= 31
  }
  return false
}

/**
 * @en Returns a 2-letter country code or null for private/unknown IPs.
 * @es Devuelve código de país de 2 letras o null para IPs privadas/desconocidas.
 * @pt-BR Retorna código de país de 2 letras ou null para IPs privadas/desconhecidas.
 */
export function resolveCountryFromIp(ipAddress: string | null | undefined): string | null {
  if (!ipAddress || typeof ipAddress !== 'string') {
    return null
  }
  const ip = ipAddress.trim()
  if (ip.length === 0) {
    return null
  }
  const normalized = ip.startsWith('::ffff:') ? ip.slice('::ffff:'.length) : ip
  if (isPrivateOrLocalIp(normalized)) {
    return null
  }
  try {
    const hit = geoip.lookup(normalized)
    const country = hit?.country
    return typeof country === 'string' && country.length === 2 ? country.toUpperCase() : null
  } catch {
    return null
  }
}
