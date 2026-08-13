import { offlineMeta } from '../offline/meta'

export type CatalogViewMode = 'list' | 'grid'

const KEY_CATALOG_VIEW = 'seller.catalogView'

/**
 * @en Reads seller catalog view mode: list (default) vs grid (#257).
 * @es Lee modo de vista del catálogo seller: lista (default) vs grilla (#257).
 * @pt-BR Lê modo de visualização do catálogo seller: lista (padrão) vs grade (#257).
 */
export function getCatalogViewPreference(): CatalogViewMode {
  return offlineMeta.getString(KEY_CATALOG_VIEW) === 'grid' ? 'grid' : 'list'
}

/**
 * @en Persists seller catalog view mode (#257).
 * @es Persiste el modo de vista del catálogo seller (#257).
 * @pt-BR Persiste o modo de visualização do catálogo seller (#257).
 */
export function setCatalogViewPreference(mode: CatalogViewMode): void {
  offlineMeta.setString(KEY_CATALOG_VIEW, mode === 'grid' ? 'grid' : 'list')
}
