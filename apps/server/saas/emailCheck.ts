/**
 * @en Linear email shape check (no polynomial backtracking) for registration (#180).
 * @es Validación lineal de email (sin backtracking polinomial) para registro (#180).
 * @pt-BR Validação linear de e-mail (sem backtracking polinomial) para registro (#180).
 */
export function isPlausibleEmail(raw: string): boolean {
  if (raw.length === 0 || raw.length > 120) return false
  if (raw.includes(' ') || raw.includes('\t') || raw.includes('\n')) return false
  const at = raw.indexOf('@')
  if (at <= 0 || at !== raw.lastIndexOf('@')) return false
  const local = raw.slice(0, at)
  const domain = raw.slice(at + 1)
  if (local.length === 0 || domain.length < 3) return false
  const dot = domain.indexOf('.')
  return dot > 0 && dot < domain.length - 1
}
