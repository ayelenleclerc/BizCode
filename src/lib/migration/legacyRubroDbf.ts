function trimRequiredString(value: unknown, maxLen: number): string | undefined {
  if (value == null) return undefined
  const trimmed = String(value).trim()
  if (trimmed === '') return undefined
  return trimmed.slice(0, maxLen)
}

/**
 * @en Builds a plain object for `rubroBodySchema` from a `RUBROS.DBF` row (no business validation).
 * @es Arma un objeto plano para `rubroBodySchema` desde una fila de `RUBROS.DBF` (sin validación de negocio).
 * @pt-BR Monta um objeto simples para `rubroBodySchema` a partir de uma linha de `RUBROS.DBF` (sem validação de negócio).
 */
export function dbfRowToRawRubro(row: Record<string, unknown>): Record<string, unknown> {
  const raw: Record<string, unknown> = {}

  const codigo = Math.round(Number(row.COD_RUBRO))
  if (Number.isFinite(codigo)) {
    raw.codigo = codigo
  }

  const nombre = trimRequiredString(row.NOMBRE, 20)
  if (nombre !== undefined) {
    raw.nombre = nombre
  }

  return raw
}
