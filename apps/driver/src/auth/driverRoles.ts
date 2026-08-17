import type { UserRole } from '@bizcode/types'

/** Roles allowed into App Driver per #159 acceptance criteria. */
export const DRIVER_APP_ROLES = ['driver'] as const satisfies ReadonlyArray<UserRole>

export type DriverAppRole = (typeof DRIVER_APP_ROLES)[number]

export function isDriverAppRole(role: string): role is DriverAppRole {
  return (DRIVER_APP_ROLES as readonly string[]).includes(role)
}
