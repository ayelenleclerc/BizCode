/**
 * @en Resolves Prisma-style `tokenHash` filters (`string` or `{ in: string[] }`) against an in-memory Map (tests / #216).
 * @es Resuelve filtros Prisma `tokenHash` (`string` o `{ in: string[] }`) contra un Map en memoria (tests / #216).
 * @pt-BR Resolve filtros Prisma `tokenHash` (`string` ou `{ in: string[] }`) contra um Map em memória (tests / #216).
 */
export type TokenHashWhere = string | { in: readonly string[] }

export function getByTokenHashFilter<T>(
  store: Map<string, T>,
  tokenHash: TokenHashWhere | undefined,
): { hash: string; value: T } | undefined {
  if (tokenHash == null) {
    return undefined
  }
  if (typeof tokenHash === 'string') {
    const value = store.get(tokenHash)
    return value === undefined ? undefined : { hash: tokenHash, value }
  }
  if (typeof tokenHash === 'object' && Array.isArray(tokenHash.in)) {
    for (const candidate of tokenHash.in) {
      const value = store.get(candidate)
      if (value !== undefined) {
        return { hash: candidate, value }
      }
    }
  }
  return undefined
}

/**
 * @en True when `storedHash` matches an exact or `{ in: [...] }` tokenHash filter.
 * @es True si `storedHash` coincide con un filtro tokenHash exacto o `{ in: [...] }`.
 * @pt-BR True se `storedHash` coincide com filtro tokenHash exato ou `{ in: [...] }`.
 */
export function matchesTokenHashFilter(
  storedHash: string,
  tokenHash: TokenHashWhere | undefined,
): boolean {
  if (tokenHash == null) {
    return true
  }
  if (typeof tokenHash === 'string') {
    return storedHash === tokenHash
  }
  if (typeof tokenHash === 'object' && Array.isArray(tokenHash.in)) {
    return tokenHash.in.includes(storedHash)
  }
  return false
}
