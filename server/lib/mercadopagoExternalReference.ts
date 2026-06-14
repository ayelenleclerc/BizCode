/**
 * @en Parses Mercado Pago external_reference tenantId:facturaId (#176, #178).
 * @es Parsea external_reference tenantId:facturaId de Mercado Pago (#176, #178).
 * @pt-BR Faz parse de external_reference tenantId:facturaId do Mercado Pago (#176, #178).
 */
export function parseMercadoPagoExternalReference(
  ref: string | null | undefined,
): { tenantId: number; facturaId: number } | null {
  if (!ref?.trim()) return null
  const [tenantPart, facturaPart] = ref.split(':')
  const tenantId = Number.parseInt(tenantPart ?? '', 10)
  const facturaId = Number.parseInt(facturaPart ?? '', 10)
  if (!Number.isInteger(tenantId) || tenantId < 1 || !Number.isInteger(facturaId) || facturaId < 1) {
    return null
  }
  return { tenantId, facturaId }
}
