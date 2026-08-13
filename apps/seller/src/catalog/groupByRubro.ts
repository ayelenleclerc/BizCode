import type { ArticuloListItem } from '@bizcode/api-client'

export type CatalogGridRow =
  | { kind: 'header'; key: string; title: string }
  | { kind: 'pair'; key: string; items: ArticuloListItem[] }

/**
 * @en Groups sellable articles by rubro into header + pairs of cards (#257).
 * @es Agrupa artículos vendibles por rubro en header + pares de tarjetas (#257).
 * @pt-BR Agrupa artigos vendáveis por rubro em header + pares de cards (#257).
 */
export function buildCatalogGridRows(
  items: ArticuloListItem[],
  rubroId: number | null,
  allLabel: string,
  chunkSize = 2,
): CatalogGridRow[] {
  const size = chunkSize >= 3 ? 3 : 2
  if (rubroId != null) {
    return toChunks(items, `rubro-${rubroId}`, size)
  }
  const groups = new Map<string, ArticuloListItem[]>()
  for (const item of items) {
    const title = item.rubro?.nombre?.trim() || allLabel
    const list = groups.get(title) ?? []
    list.push(item)
    groups.set(title, list)
  }
  const rows: CatalogGridRow[] = []
  for (const [title, group] of groups) {
    rows.push({ kind: 'header', key: `h-${title}`, title })
    rows.push(...toChunks(group, `g-${title}`, size))
  }
  return rows
}

function toChunks(items: ArticuloListItem[], prefix: string, size: number): CatalogGridRow[] {
  const rows: CatalogGridRow[] = []
  for (let i = 0; i < items.length; i += size) {
    rows.push({
      kind: 'pair',
      key: `${prefix}-${items[i]!.id}`,
      items: items.slice(i, i + size),
    })
  }
  return rows
}
