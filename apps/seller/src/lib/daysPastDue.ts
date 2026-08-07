function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * @en Days past due from invoice date + credit days (0 if not yet due). Aligned with server `computeDaysPastDue`.
 * @es Días de mora desde fecha de factura + plazo de crédito (0 si no venció). Alineado al server.
 * @pt-BR Dias em atraso desde data da fatura + prazo de crédito (0 se não venceu). Alinhado ao server.
 */
export function computeDaysPastDue(invoiceDate: Date, creditDays: number, asOf: Date = new Date()): number {
  const due = startOfDay(invoiceDate)
  due.setDate(due.getDate() + Math.max(0, creditDays))
  const today = startOfDay(asOf)
  const diffMs = today.getTime() - due.getTime()
  if (diffMs <= 0) return 0
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

/**
 * @en Credit limit usage percentage capped at 100.
 * @es Porcentaje de uso del límite de crédito (tope 100).
 * @pt-BR Percentual de uso do limite de crédito (teto 100).
 */
export function creditUsagePercent(balance: number, creditLimit: number | null | undefined): number | null {
  if (creditLimit == null || creditLimit <= 0) return null
  return Math.min(100, Math.max(0, (balance / creditLimit) * 100))
}
