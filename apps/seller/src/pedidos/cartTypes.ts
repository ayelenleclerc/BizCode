/**
 * @en Cart line for App Seller order taking (#169).
 * @es Línea de carrito para toma de pedido App Seller (#169).
 * @pt-BR Linha do carrinho para tomada de pedido App Seller (#169).
 */
export type SellerCartLine = {
  articuloId: number
  descripcion: string
  precio: number
  stock: number
  cantidad: number
  /** Discount percent 0–100. */
  dscto: number
  condIva: string
}

export type PedidoCondicionCobroUi = 'contado' | 'cuenta_corriente' | 'plazo'
