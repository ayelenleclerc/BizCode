/**
 * @en Detect bank-statement file format from name + content sniff (#190).
 * @es Detecta formato de extracto por nombre y contenido (#190).
 * @pt-BR Detecta formato de extrato por nome e conteúdo (#190).
 */
export type ExtractoFormat = 'csv' | 'ofx' | 'mt940'

export function detectExtractoFormat(
  fileName: string,
  text: string,
): ExtractoFormat | null {
  const lower = fileName.toLowerCase()
  const head = text.slice(0, 800).toUpperCase()

  if (lower.endsWith('.ofx') || lower.endsWith('.qfx') || head.includes('OFXHEADER') || head.includes('<OFX')) {
    return 'ofx'
  }
  if (
    lower.endsWith('.mt940') ||
    lower.endsWith('.sta') ||
    lower.endsWith('.swi') ||
    /\{1:F01/.test(head) ||
    head.includes(':20:') && head.includes(':25:')
  ) {
    return 'mt940'
  }
  if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
    return 'csv'
  }
  // Heuristic: delimiter-heavy first line
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  if (firstLine.includes(';') || firstLine.includes(',')) {
    return 'csv'
  }
  return null
}
