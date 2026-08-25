/**
 * @en Location state for pre-filling purchase order form from comparator (#274) or replenishment (#198).
 * @es Estado de navegación para precargar OC desde el comparador (#274) o reposición (#198).
 * @pt-BR Estado de navegação para pré-preencher OC a partir do comparador (#274) ou reposição (#198).
 */
export type ComprasOcPrefillLine = {
  articuloId: number
  cantidad?: number
  costoUnitario?: string | null
  codigoProveedor?: string | null
  descripcionProveedor?: string | null
}

export type ComprasOcPrefillState = {
  ocPrefill?: {
    proveedorId: number
    /**
     * @en Single-line prefill (#274). Prefer `lines` when multiple SKUs.
     * @es Prefill de una línea (#274). Preferir `lines` con varios SKUs.
     * @pt-BR Prefill de uma linha (#274). Prefira `lines` com vários SKUs.
     */
    articuloId?: number
    costoUnitario?: string | null
    codigoProveedor?: string | null
    descripcionProveedor?: string | null
    /** @en Multi-line prefill (#198). @es Prefill multi-línea (#198). @pt-BR Prefill multi-linha (#198). */
    lines?: ComprasOcPrefillLine[]
  }
}
