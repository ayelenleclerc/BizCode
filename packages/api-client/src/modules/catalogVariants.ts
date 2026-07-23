import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  ArticuloImagenRow,
  ArticuloOfertaCreateInput,
  ArticuloOfertaPatchInput,
  ArticuloOfertaRow,
  ArticuloStockFamiliaResponse,
  ArticuloVarianteRow,
  CategoriaArticuloCreateInput,
  CategoriaArticuloListResponse,
  CategoriaArticuloPatchInput,
  CategoriaArticuloRow,
  CategoriaAtributoCreateInput,
  CategoriaAtributoPatchInput,
  CategoriaAtributoRow,
  CategoriaAtributoValorCreateInput,
  CategoriaAtributoValorRow,
  GenerarVariantesInput,
  GenerarVariantesResult,
  PrecioCatalogoEfectivoResponse,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en HTTP client for hierarchical categories and article variants (#235).
 * @es Cliente HTTP para categorías jerárquicas y variantes de artículos (#235).
 * @pt-BR Cliente HTTP para categorias hierárquicas e variantes de artigos (#235).
 */
export function createCatalogVariantsAPI(http: AxiosInstance) {
  return {
    listCategorias: async (params?: {
      take?: number
      skip?: number
      padreId?: number | null
      activo?: boolean
    }): Promise<CategoriaArticuloListResponse> => {
      try {
        const response = await http.get<CategoriaArticuloListResponse>('/categorias-articulo', {
          params: {
            ...params,
            padreId: params?.padreId === null ? 'null' : params?.padreId,
          },
        })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getCategoria: async (id: number): Promise<CategoriaArticuloRow> => {
      try {
        const response = await http.get<{ success: boolean; data: CategoriaArticuloRow }>(
          `/categorias-articulo/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createCategoria: async (body: CategoriaArticuloCreateInput): Promise<CategoriaArticuloRow> => {
      try {
        const response = await http.post<{ success: boolean; data: CategoriaArticuloRow }>(
          '/categorias-articulo',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    updateCategoria: async (
      id: number,
      body: CategoriaArticuloPatchInput,
    ): Promise<CategoriaArticuloRow> => {
      try {
        const response = await http.patch<{ success: boolean; data: CategoriaArticuloRow }>(
          `/categorias-articulo/${id}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    removeCategoria: async (id: number): Promise<void> => {
      try {
        await http.delete(`/categorias-articulo/${id}`)
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    addAtributo: async (
      categoriaId: number,
      body: CategoriaAtributoCreateInput,
    ): Promise<CategoriaAtributoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: CategoriaAtributoRow }>(
          `/categorias-articulo/${categoriaId}/atributos`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    patchAtributo: async (
      categoriaId: number,
      atributoId: number,
      body: CategoriaAtributoPatchInput,
    ): Promise<CategoriaAtributoRow> => {
      try {
        const response = await http.patch<{ success: boolean; data: CategoriaAtributoRow }>(
          `/categorias-articulo/${categoriaId}/atributos/${atributoId}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    removeAtributo: async (categoriaId: number, atributoId: number): Promise<void> => {
      try {
        await http.delete(`/categorias-articulo/${categoriaId}/atributos/${atributoId}`)
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    addValor: async (
      categoriaId: number,
      atributoId: number,
      body: CategoriaAtributoValorCreateInput,
    ): Promise<CategoriaAtributoValorRow> => {
      try {
        const response = await http.post<{ success: boolean; data: CategoriaAtributoValorRow }>(
          `/categorias-articulo/${categoriaId}/atributos/${atributoId}/valores`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    removeValor: async (
      categoriaId: number,
      atributoId: number,
      valorId: number,
    ): Promise<void> => {
      try {
        await http.delete(
          `/categorias-articulo/${categoriaId}/atributos/${atributoId}/valores/${valorId}`,
        )
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listVariantes: async (padreId: number): Promise<ArticuloVarianteRow[]> => {
      try {
        const response = await http.get<{ success: boolean; data: ArticuloVarianteRow[] }>(
          `/articulos/${padreId}/variantes`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    generarVariantes: async (
      padreId: number,
      body: GenerarVariantesInput,
    ): Promise<GenerarVariantesResult> => {
      try {
        const response = await http.post<GenerarVariantesResult>(
          `/articulos/${padreId}/variantes/generar`,
          body,
        )
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    stockFamilia: async (padreId: number): Promise<ArticuloStockFamiliaResponse> => {
      try {
        const response = await http.get<ArticuloStockFamiliaResponse>(
          `/articulos/${padreId}/stock-familia`,
        )
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getPrecioCatalogoEfectivo: async (articuloId: number): Promise<PrecioCatalogoEfectivoResponse> => {
      try {
        const response = await http.get<PrecioCatalogoEfectivoResponse>(
          '/articulos/precio-catalogo-efectivo',
          { params: { articuloId } },
        )
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listOfertas: async (articuloId: number): Promise<ArticuloOfertaRow[]> => {
      try {
        const response = await http.get<{ success: boolean; data: ArticuloOfertaRow[] }>(
          `/articulos/${articuloId}/ofertas`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createOferta: async (
      articuloId: number,
      body: ArticuloOfertaCreateInput,
    ): Promise<ArticuloOfertaRow> => {
      try {
        const response = await http.post<{ success: boolean; data: ArticuloOfertaRow }>(
          `/articulos/${articuloId}/ofertas`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    updateOferta: async (
      articuloId: number,
      ofertaId: number,
      body: ArticuloOfertaPatchInput,
    ): Promise<ArticuloOfertaRow> => {
      try {
        const response = await http.patch<{ success: boolean; data: ArticuloOfertaRow }>(
          `/articulos/${articuloId}/ofertas/${ofertaId}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    removeOferta: async (articuloId: number, ofertaId: number): Promise<void> => {
      try {
        await http.delete(`/articulos/${articuloId}/ofertas/${ofertaId}`)
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listImagenes: async (articuloId: number): Promise<ArticuloImagenRow[]> => {
      try {
        const response = await http.get<{ success: boolean; data: ArticuloImagenRow[] }>(
          `/articulos/${articuloId}/imagenes`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    uploadImagen: async (articuloId: number, file: File | Blob): Promise<ArticuloImagenRow> => {
      try {
        const form = new FormData()
        form.append('file', file)
        const response = await http.post<{ success: boolean; data: ArticuloImagenRow }>(
          `/articulos/${articuloId}/imagenes`,
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    reorderImagenes: async (
      articuloId: number,
      ordenIds: number[],
    ): Promise<ArticuloImagenRow[]> => {
      try {
        const response = await http.put<{ success: boolean; data: ArticuloImagenRow[] }>(
          `/articulos/${articuloId}/imagenes/orden`,
          { ordenIds },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    removeImagen: async (articuloId: number, imagenId: number): Promise<void> => {
      try {
        await http.delete(`/articulos/${articuloId}/imagenes/${imagenId}`)
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const catalogVariantsAPI = createCatalogVariantsAPI(api)
