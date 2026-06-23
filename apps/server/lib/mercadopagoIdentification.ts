/**
 * @en Normalizes tax identification digits for Mercado Pago payer matching (#178).
 * @es Normaliza dígitos de identificación fiscal para matching de pagador MP (#178).
 * @pt-BR Normaliza dígitos de identificação fiscal para matching de pagador MP (#178).
 */
export function normalizeMercadoPagoIdentification(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const digits = value.replace(/\D/g, '')
  return digits.length > 0 ? digits : null
}
