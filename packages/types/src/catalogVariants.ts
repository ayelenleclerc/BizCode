/**
 * @en Types for article variants, hierarchical categories, offers and images (#235).
 * @es Tipos para variantes de artículos, categorías jerárquicas, ofertas e imágenes (#235).
 * @pt-BR Tipos para variantes de artigos, categorias hierárquicas, ofertas e imagens (#235).
 */
import type { PaginatedResponse } from './api-contracts'

export type CategoriaAtributoValorRow = {
  id: number
  atributoId: number
  valor: string
  orden: number
}

export type CategoriaAtributoRow = {
  id: number
  tenantId: number
  categoriaId: number
  nombre: string
  orden: number
  valores: CategoriaAtributoValorRow[]
}

export type CategoriaArticuloRow = {
  id: number
  tenantId: number
  nombre: string
  codigo: string | null
  padreId: number | null
  precioDefault: number | null
  activo: boolean
  createdAt: string
  updatedAt: string
  atributos?: CategoriaAtributoRow[]
  hijos?: CategoriaArticuloRow[]
}

export type CategoriaArticuloCreateInput = {
  nombre: string
  codigo?: string | null
  padreId?: number | null
  precioDefault?: number | null
  activo?: boolean
}

export type CategoriaArticuloPatchInput = Partial<CategoriaArticuloCreateInput>

export type CategoriaAtributoCreateInput = {
  nombre: string
  orden?: number
  valores?: Array<{ valor: string; orden?: number }>
}

export type CategoriaAtributoPatchInput = {
  nombre?: string
  orden?: number
}

export type CategoriaAtributoValorCreateInput = {
  valor: string
  orden?: number
}

export type ArticuloAtributoValorRow = {
  id: number
  articuloId: number
  atributoValorId: number
  atributoNombre?: string
  valor?: string
}

export type ArticuloOfertaRow = {
  id: number
  tenantId: number
  articuloId: number
  precioOferta: number
  vigenciaDesde: string
  vigenciaHasta: string
  activa: boolean
  createdAt: string
  updatedAt: string
}

export type ArticuloOfertaCreateInput = {
  precioOferta: number
  vigenciaDesde: string
  vigenciaHasta: string
  activa?: boolean
}

export type ArticuloOfertaPatchInput = Partial<ArticuloOfertaCreateInput>

export type ArticuloImagenRow = {
  id: number
  tenantId: number
  articuloId: number
  pathOriginal: string
  pathMedium: string
  pathThumb: string
  urlOriginal: string
  urlMedium: string
  urlThumb: string
  orden: number
  esPrincipal: boolean
  createdAt: string
}

export type GenerarVariantesInput = {
  /** @en Attribute value IDs grouped by attribute; cartesian product is generated. */
  atributoValorIdsPorAtributo: number[][]
  codigoInicio?: number
}

export type GenerarVariantesResult = {
  success: boolean
  creadas: number
  variantes: ArticuloVarianteRow[]
}

export type ArticuloVarianteRow = {
  id: number
  codigo: number
  descripcion: string
  padreId: number | null
  esPadre: boolean
  categoriaId: number | null
  heredaPrecio: boolean
  precioOverride: number | null
  costoOverride: number | null
  precioLista1: number
  costo: number
  stock: number
  activo: boolean
  atributoValores: ArticuloAtributoValorRow[]
}

export type ArticuloStockFamiliaResponse = {
  success: boolean
  padreId: number
  stockFamilia: number
  variantes: Array<{ id: number; codigo: number; descripcion: string; stock: number; activo: boolean }>
}

/**
 * @en Catalog-level price origin before optional customer price lists (#235).
 * @es Origen de precio a nivel catálogo antes de listas de cliente opcionales (#235).
 * @pt-BR Origem de preço em nível de catálogo antes de listas de cliente opcionais (#235).
 */
export type PrecioCatalogoOrigen =
  | 'oferta'
  | 'override_variante'
  | 'precio_subfamilia'
  | 'precio_familia'
  | 'precio_lista1'

export type PrecioCatalogoEfectivoResponse = {
  success: boolean
  articuloId: number
  precio: number
  origen: PrecioCatalogoOrigen
  ofertaId: number | null
}

export type CategoriaArticuloListResponse = PaginatedResponse<CategoriaArticuloRow>
