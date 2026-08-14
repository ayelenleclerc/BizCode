import { filterSellableArticulos } from '../catalog/filterSellable'

export type VoiceMatchItem = {
  id: number
  descripcion: string
  codigo?: number
  activo?: boolean
  esPadre?: boolean
}

export type RankedMatch<T extends VoiceMatchItem> = {
  item: T
  score: number
}

/**
 * @en Ranks sellable catalog rows by fuzzy similarity; returns top 3 (#266).
 * @es Rankea filas vendibles por similitud; devuelve top 3 (#266).
 * @pt-BR Classifica linhas vendáveis por similaridade; devolve top 3 (#266).
 */
export function rankArticuloMatches<T extends VoiceMatchItem>(phrase: string, items: T[]): RankedMatch<T>[] {
  const needle = fold(phrase)
  if (!needle) return []
  const sellable = filterSellableArticulos(items)
  const ranked = sellable
    .map((item) => ({ item, score: scoreMatch(needle, item) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.descripcion.localeCompare(b.item.descripcion))
  return ranked.slice(0, 3)
}

function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

function scoreMatch(needle: string, item: VoiceMatchItem): number {
  const desc = fold(item.descripcion)
  const codigo = item.codigo != null ? String(item.codigo) : ''
  if (desc === needle) return 100
  if (codigo && codigo === needle) return 95
  if (desc.includes(needle) || needle.includes(desc)) return 80
  const nTokens = needle.split(/\s+/).filter(Boolean)
  const dTokens = new Set(desc.split(/\s+/).filter(Boolean))
  let overlap = 0
  for (const t of nTokens) {
    if (dTokens.has(t)) overlap += 1
    else if ([...dTokens].some((d) => d.includes(t) || t.includes(d))) overlap += 0.5
  }
  if (overlap === 0) return 0
  return Math.min(70, 20 + overlap * 15)
}
