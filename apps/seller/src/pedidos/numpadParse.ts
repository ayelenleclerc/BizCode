/**
 * @en Pure numpad buffer parse/edit helpers for App Seller (#264).
 * @es Helpers puros de parseo/edición del buffer del numpad App Seller (#264).
 * @pt-BR Helpers puros de parse/edição do buffer do numpad App Seller (#264).
 */

export type DecimalSeparator = ',' | '.'

/**
 * @en Decimal key for seller i18n locale (en → `.`, otherwise `,`). TenantConfig has no separator.
 * @es Tecla decimal según locale i18n del seller (en → `.`, si no `,`). TenantConfig no tiene separador.
 * @pt-BR Tecla decimal conforme locale i18n do seller (en → `.`, senão `,`). TenantConfig não tem separador.
 */
export function decimalSeparatorForLocale(lang: string): DecimalSeparator {
  const base = lang.split('-')[0]?.toLowerCase() ?? 'es'
  return base === 'en' ? '.' : ','
}

/**
 * @en Parses a numpad buffer using the locale decimal separator.
 * @es Parsea el buffer del numpad con el separador decimal del locale.
 * @pt-BR Faz parse do buffer do numpad com o separador decimal do locale.
 */
export function parseNumpadBuffer(buffer: string, separator: DecimalSeparator): number | null {
  const trimmed = buffer.trim()
  if (!trimmed || trimmed === separator) return null
  const normalized = separator === '.' ? trimmed : trimmed.split(separator).join('.')
  if ((normalized.match(/\./g) ?? []).length > 1) return null
  const n = Number.parseFloat(normalized)
  if (!Number.isFinite(n)) return null
  return n
}

/**
 * @en Formats an initial numeric value into a numpad buffer.
 * @es Formatea un valor numérico inicial al buffer del numpad.
 * @pt-BR Formata um valor numérico inicial no buffer do numpad.
 */
export function formatInitialBuffer(value: number, separator: DecimalSeparator): string {
  if (!Number.isFinite(value)) return ''
  const s = String(value)
  return separator === ',' ? s.replace('.', ',') : s
}

/**
 * @en Appends a digit or decimal separator to the numpad buffer.
 * @es Agrega un dígito o el separador decimal al buffer del numpad.
 * @pt-BR Acrescenta um dígito ou o separador decimal ao buffer do numpad.
 */
export function appendNumpadDigit(buffer: string, key: string, separator: DecimalSeparator): string {
  if (key === separator) {
    if (buffer.includes(separator)) return buffer
    return buffer === '' ? `0${separator}` : `${buffer}${separator}`
  }
  if (!/^[0-9]$/.test(key)) return buffer
  if (buffer === '0') return key
  return `${buffer}${key}`
}

/**
 * @en Removes the last character from the numpad buffer.
 * @es Quita el último carácter del buffer del numpad.
 * @pt-BR Remove o último caractere do buffer do numpad.
 */
export function backspaceNumpad(buffer: string): string {
  return buffer.slice(0, -1)
}

export type DsctoValidation = { ok: true; value: number } | { ok: false; reason: 'out_of_range' }

/**
 * @en Validates line discount percent 0–100 (inline error, no silent clamp).
 * @es Valida el descuento de línea 0–100 (error inline, sin clamp silencioso).
 * @pt-BR Valida o desconto de linha 0–100 (erro inline, sem clamp silencioso).
 */
export function validateDscto(value: number): DsctoValidation {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return { ok: false, reason: 'out_of_range' }
  }
  return { ok: true, value }
}

/**
 * @en Rounds qty to multiploVenta when set; otherwise keeps finite decimals.
 * @es Redondea qty a multiploVenta si existe; si no, conserva decimales finitos.
 * @pt-BR Arredonda qty para multiploVenta se existir; senão, mantém decimais finitos.
 */
export function roundQtyToMultiplo(qty: number, multiploVenta: number | null | undefined): number {
  if (!Number.isFinite(qty) || qty <= 0) return 0
  if (multiploVenta == null || !Number.isFinite(multiploVenta) || multiploVenta <= 0) {
    return Math.round(qty * 10_000) / 10_000
  }
  const rounded = Math.round(qty / multiploVenta) * multiploVenta
  if (rounded <= 0) return multiploVenta
  return Math.round(rounded * 10_000) / 10_000
}
