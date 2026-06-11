/**
 * @en SICORE tax and regime code mapping (#242). Extend as regimens are seeded.
 * @es Mapeo de códigos impuesto/régimen SICORE (#242). Extender según regímenes seed.
 * @pt-BR Mapeamento de códigos imposto/regime SICORE (#242).
 */

/** AFIP impuesto code (3 digits) by regimen tipo. */
const IMPUESTO_BY_TIPO: Record<string, string> = {
  ganancias: '217',
  iva: '767',
}

/** Default régimen code (3 digits) by regimen tipo when no specific match. */
const REGIMEN_DEFAULT_BY_TIPO: Record<string, string> = {
  ganancias: '217',
  iva: '767',
}

/** Optional overrides by normalized regimen nombre (uppercase, no accents). */
const REGIMEN_BY_NOMBRE: Record<string, string> = {
  'RETENCION GANANCIAS': '217',
  'RETENCION IVA': '767',
  'PERCEPCION IVA': '767',
}

export function resolveSicoreImpuestoCode(regimenTipo: string): string {
  return IMPUESTO_BY_TIPO[regimenTipo] ?? '000'
}

export function resolveSicoreRegimenCode(regimenTipo: string, regimenNombre?: string): string {
  if (regimenNombre) {
    const key = regimenNombre
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toUpperCase()
      .trim()
    const byName = REGIMEN_BY_NOMBRE[key]
    if (byName) return byName
  }
  return REGIMEN_DEFAULT_BY_TIPO[regimenTipo] ?? '000'
}

export function resolveSicoreOperacionCode(operacionTipo: 'retencion' | 'percepcion'): 'R' | 'P' {
  return operacionTipo === 'percepcion' ? 'P' : 'R'
}
