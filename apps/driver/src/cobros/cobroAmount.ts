export function parseMoney(value: string | number | null | undefined): number {
  if (value == null) return 0
  const raw = typeof value === 'number' ? value : Number.parseFloat(String(value).replace(',', '.'))
  return Number.isFinite(raw) ? raw : 0
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function formatMoney(value: number): string {
  return roundMoney(value).toFixed(2)
}

export function todayYmd(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function sumSelectedPendiente(
  facturas: { facturaId: number; pendiente: string }[],
  selectedIds: ReadonlySet<number>,
): number {
  return roundMoney(
    facturas
      .filter((row) => selectedIds.has(row.facturaId))
      .reduce((sum, row) => sum + parseMoney(row.pendiente), 0),
  )
}

/**
 * @en True when the amount is greater than the AR balance (2-decimal compare) (#162).
 * @es True si el importe supera el saldo (comparación a 2 decimales) (#162).
 * @pt-BR True se o valor supera o saldo (comparação com 2 casas) (#162).
 */
export function needsOverSaldoConfirm(monto: number, saldo: number): boolean {
  return roundMoney(monto) > roundMoney(saldo)
}

export function canSubmitWithoutOverSaldoDialog(
  monto: number,
  saldo: number,
  overSaldoConfirmed: boolean,
): boolean {
  if (roundMoney(monto) <= 0) return false
  if (!needsOverSaldoConfirm(monto, saldo)) return true
  return overSaldoConfirmed
}
