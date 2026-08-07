import type { UserRole } from '@bizcode/types'

/** Roles allowed into App Seller per #167 acceptance criteria. */
export const SELLER_APP_ROLES = ['seller', 'manager', 'owner'] as const satisfies ReadonlyArray<UserRole>

export type SellerAppRole = (typeof SELLER_APP_ROLES)[number]

export function isSellerAppRole(role: string): role is SellerAppRole {
  return (SELLER_APP_ROLES as readonly string[]).includes(role)
}
