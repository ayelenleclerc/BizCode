/**
 * @en SIFERE WEB province codes (COMARB) (#242). Minimum CABA + Buenos Aires.
 * @es Códigos de provincia SIFERE WEB (COMARB) (#242). Mínimo CABA + Buenos Aires.
 * @pt-BR Códigos de província SIFERE WEB (COMARB) (#242).
 */

const PROVINCIA_CODE: Record<string, string> = {
  CABA: '902',
  'CIUDAD AUTONOMA DE BUENOS AIRES': '902',
  'CAPITAL FEDERAL': '902',
  BA: '901',
  'BUENOS AIRES': '901',
  PBA: '901',
}

export function resolveSifereProvinciaCode(provincia: string | null | undefined): string {
  if (!provincia) return '000'
  const key = provincia
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .trim()
  return PROVINCIA_CODE[key] ?? '000'
}
