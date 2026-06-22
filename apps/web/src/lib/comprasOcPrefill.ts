/**
 * @en Location state for pre-filling purchase order form from comparator (#274).
 * @es Estado de navegación para precargar OC desde el comparador (#274).
 * @pt-BR Estado de navegação para pré-preencher OC a partir do comparador (#274).
 */
export type ComprasOcPrefillState = {
  ocPrefill?: {
    proveedorId: number
    articuloId: number
    costoUnitario?: string | null
    codigoProveedor?: string | null
    descripcionProveedor?: string | null
  }
}
