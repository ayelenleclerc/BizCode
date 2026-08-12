/**
 * @en Order-suggestion types for App Seller check mode (#254).
 * @es Tipos de sugerencias de pedido para modo check App Seller (#254).
 * @pt-BR Tipos de sugestões de pedido para modo check App Seller (#254).
 */

export type SugerenciasPedidoSource = 'historial' | 'ultimo_pedido' | 'vacio'

export type SugerenciaOrigenPrecio = 'lista' | 'oferta'

export type SugerenciaHabitual = {
  articuloId: number
  descripcion: string
  cantidadSugerida: number
  diasDesdeUltima: number
  frecuenciaDias: number | null
  anomalia: boolean
  precio: number
  stock: number
  condIva: string
  origenPrecio: SugerenciaOrigenPrecio
}

export type SugerenciaOferta = {
  articuloId: number
  descripcion: string
  precioOferta: number
  precioLista: number
  descuentoPct: number
  stock: number
  condIva: string
  vigenciaHasta: string
}

export type SugerenciasPedido = {
  source: SugerenciasPedidoSource
  habituales: SugerenciaHabitual[]
  ofertas: SugerenciaOferta[]
}
