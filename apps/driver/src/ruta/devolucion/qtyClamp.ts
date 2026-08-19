/**
 * @en Clamps a return qty to (0, max] for a factura line (#163).
 * @es Acota la cantidad devuelta a (0, max] de la línea de factura (#163).
 * @pt-BR Limita a qtd devolvida a (0, max] da linha da fatura (#163).
 */
export function clampReturnQty(raw: number, max: number): number | null {
  if (!Number.isFinite(raw) || !Number.isFinite(max) || max <= 0) return null
  if (!(raw > 0) || raw > max) return null
  return raw
}
