const LOG_FIELD_MAX_LEN = 200

/**
 * @en Strips control characters from externally supplied log fields (#176 / CodeQL).
 * @es Elimina caracteres de control de campos de log provistos externamente (#176 / CodeQL).
 * @pt-BR Remove caracteres de controle de campos de log fornecidos externamente (#176 / CodeQL).
 */
export function sanitizeLogField(value: string): string {
  let out = ''
  for (const ch of value) {
    const code = ch.charCodeAt(0)
    if (ch === '\r' || ch === '\n' || code < 32 || code === 127) {
      out += ' '
    } else {
      out += ch
    }
    if (out.length >= LOG_FIELD_MAX_LEN) {
      break
    }
  }
  return out.trim()
}
