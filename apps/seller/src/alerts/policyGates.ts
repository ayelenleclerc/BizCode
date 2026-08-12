import type { SellerAlertAction, SellerCreditNivel, SellerPolicies } from '@bizcode/types'
import type { SellerCartLine } from '../pedidos/cartTypes'

/**
 * @en True when credit nivel + policies require blocking continue (#256).
 * @es True si el nivel de crédito y políticas bloquean continuar (#256).
 * @pt-BR True se o nível de crédito e políticas bloqueiam continuar (#256).
 */
export function isCreditBlocked(
  nivel: SellerCreditNivel | null | undefined,
  policies: Pick<SellerPolicies, 'sellerCreditOverLimitAction' | 'sellerCreditOverdueAction'> | null | undefined,
): boolean {
  if (!nivel || !policies) return false
  if (nivel === 'rojo' && policies.sellerCreditOverLimitAction === 'block') return true
  if (nivel === 'naranja' && policies.sellerCreditOverdueAction === 'block') return true
  return false
}

/**
 * @en True when zero-stock lines exist and policy is block (#256).
 * @es True si hay líneas sin stock y la política es block (#256).
 * @pt-BR True se há linhas sem estoque e a política é block (#256).
 */
export function isStockZeroBlocked(
  lines: SellerCartLine[],
  stockZeroAction: SellerAlertAction | null | undefined,
): boolean {
  if (stockZeroAction !== 'block') return false
  return lines.some((line) => line.stock <= 0 && line.cantidad > 0)
}

/**
 * @en Caps quantity to available stock when policy requires it (#256).
 * @es Limita la cantidad al stock disponible según política (#256).
 * @pt-BR Limita a quantidade ao estoque disponível conforme a política (#256).
 */
export function capQtyToStock(qty: number, stock: number, capEnabled: boolean): number {
  if (!capEnabled) return qty
  if (stock <= 0) return 0
  return Math.min(qty, stock)
}

/**
 * @en True when confirm must be blocked by stock policy (#256).
 * @es True si el confirm debe bloquearse por política de stock (#256).
 * @pt-BR True se o confirm deve ser bloqueado pela política de estoque (#256).
 */
export function shouldBlockConfirmForStock(
  lines: SellerCartLine[],
  policies: Pick<SellerPolicies, 'sellerStockZeroAction'> | null | undefined,
): boolean {
  return isStockZeroBlocked(lines, policies?.sellerStockZeroAction)
}
