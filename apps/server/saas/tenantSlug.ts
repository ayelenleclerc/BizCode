/**
 * @en Tenant slug normalization for SaaS registration (#180).
 * @es Normalización de slug de tenant para registro SaaS (#180).
 * @pt-BR Normalização de slug de tenant para registro SaaS (#180).
 */

const SLUG_MAX = 80

/**
 * @en Suggests a URL-safe slug from a business name (lowercase, hyphens).
 * @es Sugiere un slug URL-safe desde el nombre del negocio (minúsculas, guiones).
 * @pt-BR Sugere um slug URL-safe a partir do nome do negócio (minúsculas, hífens).
 */
export function suggestTenantSlug(businessName: string): string {
  return normalizeTenantSlug(
    businessName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''),
  )
}

/**
 * @en Validates and normalizes an editable slug (a-z, 0-9, hyphen; 2–80 chars).
 * @es Valida y normaliza un slug editable (a-z, 0-9, guión; 2–80 caracteres).
 * @pt-BR Valida e normaliza um slug editável (a-z, 0-9, hífen; 2–80 caracteres).
 */
export function normalizeTenantSlug(raw: string): string {
  return raw.trim().toLowerCase().slice(0, SLUG_MAX)
}

export function isValidTenantSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/.test(slug) && slug.length >= 2
}
