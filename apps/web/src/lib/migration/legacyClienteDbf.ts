export type ClienteCondIva = 'RI' | 'Mono' | 'CF' | 'Exento'

const LEGACY_COND_TO_COND_IVA: Readonly<Record<string, ClienteCondIva>> = {
  I: 'RI',
  M: 'Mono',
  E: 'Exento',
  N: 'CF',
  C: 'CF',
  X: 'Exento',
}

/**
 * @en Maps legacy `CLIENTES.DBF` `COND` codes to BizCode `condIva` enum values.
 * @es Mapea códigos legacy `COND` de `CLIENTES.DBF` a valores `condIva` de BizCode.
 * @pt-BR Mapeia códigos legacy `COND` de `CLIENTES.DBF` para valores `condIva` do BizCode.
 */
export function mapLegacyCondToCondIva(cond: string): ClienteCondIva | null {
  const key = cond.trim().toUpperCase()
  if (key === '') return null
  return LEGACY_COND_TO_COND_IVA[key] ?? null
}

function trimOptionalString(value: unknown, maxLen: number): string | undefined {
  if (value == null) return undefined
  const trimmed = String(value).trim()
  if (trimmed === '') return undefined
  return trimmed.slice(0, maxLen)
}

/**
 * @en Interprets FoxPro logical DBF values for `BAJA` / `ACTIVO`.
 * @es Interpreta valores lógicos FoxPro del DBF para `BAJA` / `ACTIVO`.
 * @pt-BR Interpreta valores lógicos FoxPro do DBF para `BAJA` / `ACTIVO`.
 */
export function parseDbfLogical(value: unknown): boolean | undefined {
  if (value === true || value === false) return value
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase()
    if (normalized === 'T' || normalized === 'Y' || normalized === '1') return true
    if (normalized === 'F' || normalized === 'N' || normalized === '0' || normalized === '') return false
  }
  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
  }
  return undefined
}

/**
 * @en Builds a plain object for `clienteBodySchema` from a `CLIENTES.DBF` row (no business validation).
 * @es Arma un objeto plano para `clienteBodySchema` desde una fila de `CLIENTES.DBF` (sin validación de negocio).
 * @pt-BR Monta um objeto simples para `clienteBodySchema` a partir de uma linha de `CLIENTES.DBF` (sem validação de negócio).
 */
export function dbfRowToRawCliente(row: Record<string, unknown>): Record<string, unknown> {
  const raw: Record<string, unknown> = {}

  const codigo = Math.round(Number(row.CODIG))
  if (Number.isFinite(codigo)) {
    raw.codigo = codigo
  }

  const rsocial = trimOptionalString(row.RSOCIAL, 30)
  if (rsocial !== undefined) {
    raw.rsocial = rsocial
  }

  const condIva = mapLegacyCondToCondIva(String(row.COND ?? ''))
  if (condIva !== null) {
    raw.condIva = condIva
  }

  const baja = parseDbfLogical(row.BAJA)
  if (baja !== undefined) {
    raw.activo = !baja
  }

  const fantasia = trimOptionalString(row.FANTASIA, 30)
  if (fantasia !== undefined) raw.fantasia = fantasia

  const domicilio = trimOptionalString(row.DOMIC, 40)
  if (domicilio !== undefined) raw.domicilio = domicilio

  const localidad = trimOptionalString(row.LOCAL, 25)
  if (localidad !== undefined) raw.localidad = localidad

  const cpost = trimOptionalString(row.CPOST, 8)
  if (cpost !== undefined) raw.cpost = cpost

  const telef = trimOptionalString(row.TELEF, 25)
  if (telef !== undefined) raw.telef = telef

  const email = trimOptionalString(row.EMAIL, 50)
  if (email !== undefined) raw.email = email

  const cuit = trimOptionalString(row.CUIT, 14)
  if (cuit !== undefined) raw.cuit = cuit

  const credito = Number(row.CREDITO)
  if (Number.isFinite(credito)) {
    raw.creditLimit = credito
  }

  return raw
}
