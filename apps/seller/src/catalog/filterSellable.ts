/**
 * @en Sellable catalog rows: active and not parent SKUs (#257 / #169).
 * @es Filas vendibles: activos y no padres (#257 / #169).
 * @pt-BR Linhas vendáveis: ativos e não pais (#257 / #169).
 */
export function filterSellableArticulos<T extends { activo?: boolean; esPadre?: boolean }>(items: T[]): T[] {
  return items.filter((a) => a.activo !== false && !a.esPadre)
}

/**
 * @en Maps offer discount % by article id from check-mode suggestions (#257 / #254).
 * @es Mapea % de oferta por artículo desde sugerencias modo check (#257 / #254).
 * @pt-BR Mapeia % de oferta por artigo a partir das sugestões modo check (#257 / #254).
 */
export function offerPctByArticuloId(
  ofertas: Array<{ articuloId: number; descuentoPct: number }> | null | undefined,
): Map<number, number> {
  const map = new Map<number, number>()
  for (const o of ofertas ?? []) {
    map.set(o.articuloId, o.descuentoPct)
  }
  return map
}
